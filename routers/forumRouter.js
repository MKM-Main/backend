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
    try{
    const forumToFind = replaceHyphensWithSpaces(req.params.forumTitle)
    const forum = await db.posts.find({referenceName: forumToFind}).toArray()
    console.log(forum)
    if(forum.length === 0){
        res.status(200).send({forum})
    } else {
        res.status(200).send({forum, title: req.params.forumTitle})
    }
    } catch(err){
        res.status(500).send({message:"server errror"})
    }
})

router.get('/forum/post/:postTitle', async (req, res) => {
    const postTitleToFind = req.params.postTitle
    const post = await db.posts.findOne({postTitle: postTitleToFind})
    res.send({post})
})

router.post("/api/forum", authenticateToken, async (req, res) => {
    try {
        const userLoggedIn = req.user
        const forumRequest = req.body
        forumRequest.creationDate = new Date().toLocaleString("en-GB");
        forumRequest.tags = []
        forumRequest.verified = false

        const post = await db.forums.insertOne(forumRequest)
        res.sendStatus(200)
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: "Error Creating forum" })
    }
  })

export default router
