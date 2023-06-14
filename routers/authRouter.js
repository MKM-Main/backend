import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../database/database.js";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middelware/verifyJwt.js";

const jwtSecret = process.env.JWT_SECRET;
const router = Router();

function isValidPassword(password) {
  const regex = /^(?=.*[A-Z]).{8,}$/;
  return regex.test(password);
}

router.get("/profile", authenticateToken, (req, res) => {
  res.send({ customMessage: req.user });
});

router.get("/api/auth/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).send({ message: "An error occurred" });
  }
});

router.post("/api/auth/signup", async (req, res) => {
  const newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, 10);
  newUser.creationDate = new Date().toLocaleString("en-GB");
  newUser.followers = [];
  newUser.following = [];
  newUser.merch = [];
  newUser.discography = [];
  newUser.userTags = [];
  newUser.profilePictureKey = "blank_profile.webp";
  const emailExist = await db.users.find({ email: newUser.email }).toArray();

  if (emailExist.length !== 0) {
    res.status(409).send({ message: "Signup failed" });
  } else {
    try {
      await db.users.insertOne(newUser);

      delete newUser.password;
      // Generate a JWT token with the user ID and email as payload
      const accessToken = jwt.sign(newUser, jwtSecret, { expiresIn: "10m" });
      // Set the JWT token in a cookie (you could also store it in localStorage or sessionStorage in the front-end)
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(200).send({ data: "Success" });
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  }
});

router.post("/api/auth/login", async (req, res) => {
  const user = req.body;
  const findUserByEmail = await db.users.find({ email: user.email }).toArray();
  try {
    const hashedPassword = findUserByEmail[0].password;
    if (await bcrypt.compare(user.password, hashedPassword)) {
      delete findUserByEmail[0].password;
      const accessToken = jwt.sign(findUserByEmail[0], jwtSecret, {
        expiresIn: "120m",
      });
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true });
      res
        .status(200)
        .send({ data: "Success", artistName: findUserByEmail[0].artistName });
    } else {
      res.status(401).send({ message: "Login failed" });
    }
  } catch (error) {
    res.status(401).send({ message: "login failed" });
  }
});

export default router;
