import {Router} from "express"
import bcrypt from "bcrypt";
import db from "../database/database.js"

const router = Router()

function isValidPassword(password) {
    const regex = /^(?=.*[A-Z]).{8,}$/
    return regex.test(password)
}


router.post("/api/auth/signup", async (req, res) => {
    const newUser = req.body


    newUser.password = await bcrypt.hash(newUser.password, 10)
    newUser.creationDate = new Date().toLocaleString("en-GB");

    const emailExist = await db.users.find({ email: newUser.email }).toArray()
    if (emailExist.length !== 0) {
        res.status(401).send({ message: "Signup failed" })
    } else {
        try {


            await db.users.insertOne(newUser)
            req.session.firstName = newUser.firstName
            res.status(200).send({ message: "Signup success" })
        } catch (error) {
            console.log(`Error: ${error.message}`)
        }
    }
})

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
