import {Router} from "express"
import bcrypt from "bcrypt";
import db from "../database/database.js"
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middelware/verifyJwt.js";

const jwtSecret = process.env.JWT_SECRET
const router = Router()

function isValidPassword(password) {
    const regex = /^(?=.*[A-Z]).{8,}$/
    return regex.test(password)
}


router.get('/api/auth/verify/token', authMiddleware, async (req, res) => {
  //Firstname, lastname, artistname, email, creationDate, followers[], following[]
  const userId = req.userId;
  const userEmail = req.userEmail;
  const userData = await db.users.findOne({email: userEmail})
  delete userData.password
  if (userData.email === userEmail && userData._id.toString() === userId){
    res.json(userData)
    //res.json({ id: userData._id, email: userData.email, firstName: userData.firstName, lastName: userData.lastName, artistName: userData.artistName, followers: userData.followers, following: userData.following });
  } else{
    res.json({message: "auth failed"})
  }
});

router.post("/api/auth/signup", async (req, res) => {
  const newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, 10);
  newUser.creationDate = new Date().toLocaleString("en-GB");
  const emailExist = await db.users.find({ email: newUser.email }).toArray();
  if (emailExist.length !== 0) {
    res.status(401).send({ message: "Signup failed" });
  } else {
    try {
      await db.users.insertOne(newUser);

      // Generate a JWT token with the user ID and email as payload
      const token = jwt.sign({ id: newUser._id, email: newUser.email }, jwtSecret);

      // Set the JWT token in a cookie (you could also store it in localStorage or sessionStorage in the front-end)
      res.cookie('jwt', token, { httpOnly: true });
      res.status(200).send({token});
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
});

router.post("/api/auth/login", async (req, res) => {
    const user = req.body
    const findUserByEmail = await db.users.find({ email: user.email }).toArray()

    try {
      const hashedPassword = findUserByEmail[0].password
      if (await bcrypt.compare(user.password, hashedPassword)) {
        req.session.name = user.firstName;
        res.status(200).send({ message: "Login success" })
      }
    } catch (error) {
      res.status(401).send({ message: `login failed. \nError: ${error.message}` })
    }
  })

export default router
