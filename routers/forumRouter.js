import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js"
const router = Router()

function replaceHyphensWithSpaces(str) {
    return str.replace(/-/g, " ");
}

router.get('/forum', async (req, res) => {
    const forum = await db.forums.find().toArray()
    res.send({forum})
})

router.get('/forum/:forumTitle', async (req, res) => {
    const forumToFind = replaceHyphensWithSpaces(req.params.forumTitle)
    const forum = await db.posts.find({referenceName: forumToFind}).toArray()
    res.send({forum})
})

router.get('/forum/post/:postTitle', async (req, res) => {
    const postTitleToFind = req.params.postTitle
    const post = await db.posts.findOne({postTitle: postTitleToFind})
    res.send({post})
})

export default router
