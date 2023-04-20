import {Router} from "express"
import db from "../database/database.js"
import { authenticateToken } from "./middelware/verifyJwt.js"
const router = Router();

//News page
router.get("/api/posts", authenticateToken, async (req, res) => {
    const user = req.user
    const following = user.following;
    
    const posts = db.posts.find({artistName: {$in : following}})
    const postArray = await posts.toArray();

    res.status(200).send(postArray)
  });

//Post on own profile
router.get("/api/posts/wallposts/:artistName", async (req, res) => {
  const artistName = req.params.artistName;

    const wallPosts = db.posts.find({referenceName: "wallpost", artistName: artistName});
    const postArray = await wallPosts.toArray();
    
    res.status(200).send(postArray)
})

//Forum get with referenceName to provide the right forum category
router.get("/api/posts/forum/:name", async (req, res) => {
    const referenceName = req.params.name

    const wallPost = db.posts.find({referenceName: referenceName});
    const postArray = await wallPost.toArray();

    res.status(200).send(postArray)
})

//Create a post from the user and reference is where the post is posted
router.post('/api/posts/:reference', authenticateToken, async (req, res) => {
    const user = req.user
    const reference = req.params.reference
    const post = req.body
    post.artistName = user.artistName
    post.referenceName = reference
    post.timeStamp = new Date().toLocaleString("en-GB");
    try {
      await db.posts.insertOne(post)
      res.status(200).send({newPost: post});
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

export default router;