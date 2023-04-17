import express from "express"
import dotenv from "dotenv/config"

const app = express()


import cors from "cors"
app.use(cors({
    credentials: true,
    origin: true
}))

app.use(express.urlencoded({extended: true}))
app.use(express.json())


import helmet from "helmet"
app.use(helmet())

import session from "express-session"
const sessionMiddleware = session({
    secret: "123",
    resave: true,
    saveUninitialized: true,
    cookie: {
        name: "456",
        secure: false,
        maxAge: 10000 * 60 * 60
    }
})
app.use(sessionMiddleware)


import authRouter from "./routers/authRouter.js"
app.use(authRouter)


const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
