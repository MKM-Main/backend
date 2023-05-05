import express from "express"
import fileUpload from "express-fileupload"
import dotenv from "dotenv/config"

const app = express()


import cors from "cors"
app.use(cors({
    credentials: true,
    origin: true
}))

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(fileUpload({
    limits: {fileSize: Infinity}
}));

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
app.use(authRouter);

import userRouter from "./routers/userRouter.js"
app.use(userRouter);

import postRouter from "./routers/postRouter.js"
app.use(postRouter);

import forumRouter from "./routers/forumRouter.js"
app.use(forumRouter);

import adminRouter from "./routers/adminRouter.js"
app.use(adminRouter)


const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
