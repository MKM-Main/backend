import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js"
const router = Router()

router.get('/forum', async (req, res) => {
    const forum = await db.forums.find().toArray()
    res.send({forum})
})

router.get('/forum/:forumTitle', async (req, res) => {
    const forumToFind = req.params.forumTitle
    const forum = await db.posts.find({referenceName: forumToFind}).toArray()
    res.send({forum})
})

router.get('/forum/post/:postTitle', async (req, res) => {
    const postTitleToFind = req.params.postTitle
    const post = await db.posts.findOne({postTitle: postTitleToFind})
    res.send({post})
})

router.patch('/forum/forumtitle/:postTitle', authenticateToken, async (req, res) => {
    const loggedInUser = req.user.artistName
    const postToUpdate = req.params.postTitle
    const newComment = req.body;
    newComment.author = loggedInUser;
    newComment.rating = 0;
    newComment.timeStamp = new Date().toLocaleString("en-GB");
    const updateCommentArray = await db.posts.updateOne({postTitle: postToUpdate}, {$push: {comments: newComment}})
    res.send(newComment)
})

export default router
