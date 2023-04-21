import {Router} from "express"
import bcrypt from "bcrypt";
import db from "../database/database.js"
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middelware/verifyJwt.js";

const jwtSecret = process.env.JWT_SECRET
const router = Router()

function isValidPassword(password) {
    const regex = /^(?=.*[A-Z]).{8,}$/
    return regex.test(password)
}

router.post('/profile', authenticateToken, (req, res) => {
    res.send({message: req.user})
})

router.get('/profile', (req, res) => {

})





// router.get('/api/auth/verify/token', async (req, res) => {
//   //Firstname, lastname, artistname, email, creationDate, followers[], following[]
//   const userId = req.userId;
//   const userEmail = req.userEmail;
//   const userData = await db.users.findOne({email: userEmail})
//   delete userData.password
//   if (userData.email === userEmail && userData._id.toString() === userId){
//     res.json(userData)
//   } else{
//     res.json({message: "auth failed"})
//   }
// });

router.post("/api/auth/signup", async (req, res) => {
  const newUser = req.body;
  console.log(newUser)
  newUser.password = await bcrypt.hash(newUser.password, 10);
  newUser.creationDate = new Date().toLocaleString("en-GB");
  const emailExist = await db.users.find({ email: newUser.email }).toArray();
  
  if (emailExist.length !== 0) {
    res.status(200).send({ message: "Signup failed" });
  } else {
    try {
      await db.users.insertOne(newUser);

      // Generate a JWT token with the user ID and email as payload
      const accessToken = jwt.sign({ id: newUser._id, email: newUser.email }, jwtSecret);
      // Set the JWT token in a cookie (you could also store it in localStorage or sessionStorage in the front-end)
      res.cookie('jwt', accessToken, { httpOnly: true });
      delete newUser.password
      res.status(200).send({data: newUser});
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
        delete findUserByEmail[0].password
        const accessToken = jwt.sign(user, jwtSecret);
        res.cookie('jwt', accessToken, { httpOnly: true });
        res.status(200).send({data: findUserByEmail})
      }
    } catch (error) {
      res.status(401).send({ message: `login failed. \nError: ${error.message}` })
    }
  })

  router.get("/api/auth/logout", async (req, res) => {
    try {
      res.clearCookie("jwt");
      res.status(200).send({ message: "User logged out successfully" });
    } catch (error) {
      res.status(500).send({ message: `An error occurred. Error: ${error.message}` });
    }
  });

export default router
