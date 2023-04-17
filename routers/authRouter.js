import { Router } from "express"
import bcrypt from "bcrypt";
import db from "../database/database.js"

const router = Router()

//Create a user with the role "USER".
router.post("/api/auth/signup", async (req, res) => {
    const newUser = req.body
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword
    newUser.creationDate = new Date().toLocaleString("en-GB");
    let emailExist = await db.users.find({ email: newUser.email }).toArray()
    
    if (emailExist != 0) {
        res.status(500).send({ message: "Signup failed" })
    } else {
        db.users.insertOne(newUser)
        req.session.firstName = newUser.firstName
        res.status(200).send({ message: "Signup success" })
    }
})

router.post("/api/auth/login", async (req, res) => {
    const user = req.body
    const dbEmail = await db.users.find({ email: user.email }).toArray()
    try {
      const hashedPassword = dbEmail[0].password
      if (await bcrypt.compare(user.password, hashedPassword)) {
        req.session.name = user.firstName;
        res.status(200).send({ message: "Login success" })
      }
    } catch (error) {
      res.status(500).send({ message: "login failed" })
    }
  })


export default router