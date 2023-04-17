import {Router} from "express"
import bcrypt from "bcrypt";
import db from "../database/database.js"

const router = Router()

router.post("/api/auth/signup", async (req, res) => {
    console.log(req.body)
    const {firstName, lastName, artistName, email, password} = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)


    const newUser = {
        firstName,
        lastName,
        artistName,
        email,
        password: hashedPassword,
        creationDate: new Date().toLocaleString("en-GB"),
        followers: [],
        following: []
    }


    console.log(newUser)
    const findUserByEmail = await db.users.find({email: email}).toArray()
    if (findUserByEmail.length !== 0) {
        res.status(422).send({data: `User with email ${email} already exists`})
    } else {
        try {
            await db.users.insertOne(newUser)
            req.session.firstName = firstName
            req.session.lastName = lastName
            req.session.artistName = artistName
            req.session.email = email

            res.status(200).send({data: "Signup was a success"})

        } catch (error) {
            console.log(error)
            res.status(500).redirect("/")
        }
    }


})

export default router

