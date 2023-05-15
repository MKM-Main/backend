import express from "express"
import fileUpload from "express-fileupload"
import dotenv from "dotenv/config"
import http from "http";

import {Server} from "socket.io";

const app = express()

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
})
io.on("connect", socket => {
    socket.on("new message", async message => {
        try {
            const messageData = {
                dataMessage: message[0],
                params: message[1],
                loggedInUser: message[2],
                loggedInArtistname: message[3],
                timeStamp: new Date().toLocaleString("en-GB")
            };
            io.emit("new message", {data: messageData});
        } catch (error) {
            console.error(error);
        }
    });
    socket.on("new conversation", async data => {
        console.log(data)
        try {
            const newData = {
                conversation: data
            };
            io.emit("new conversation", {data: newData});
        } catch (error) {
            console.error(error);
        }
    })
});

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


import conversationRouter from "./routers/conversationRouter.js"
app.use(conversationRouter);

import adminRouter from "./routers/adminRouter.js"
app.use(adminRouter)

import merchRouter from "./routers/merchRouter.js";
app.use(merchRouter)

import discographyRouter from "./routers/discographyRouter.js";
app.use(discographyRouter)


const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
