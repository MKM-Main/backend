import {Router} from "express"
import db from "../database/database.js"
import { authenticateToken } from "./middelware/verifyJwt.js"
const router = Router();

//Gets the posts from users following (Landing page)
router.get("/api/posts/landingpage", authenticateToken, async (req, res) => {
    const user = req.user
    const artistName = user.artistName;
    const following = user.following;
    const postArray = [];
  
    for (const artist of following) {
        const cursor = db.posts.find({
            $or: [
              { artistName: artist },
              { artistName: artistName }
            ]
          });
      const posts = await cursor.toArray();
      postArray.push(...posts);
    }
    console.log(postArray)
    res.status(200).send(postArray)
  });

//Post on own wall
router.get("/api/posts/wallpost", authenticateToken, async (req, res) => {
    const user = req.user
    const posts = await db.posts.find({}).toArray();
    
    const artistName = user.artistName;
    
    const postArray = [];

    for (const post of posts) {
        if(post.artistName === artistName && post.referenceName === "wallPost"){
            const wallPost = db.posts.find({artistName: post.artistName});
            const posts = await wallPost.toArray();
            postArray.push(...posts);
        }
      }

    console.log(postArray);
    res.status(200).send(postArray)
})

//Forum get with referenceName to provide the right forum category
router.get("/api/posts/forum/:name", async (req, res) => {
    const posts = await db.posts.find({}).toArray();
    const referenceName = req.params.name
    
    const postArray = [];

    for (const post of posts) {
        if(post.referenceName === referenceName){
            const wallPost = db.posts.find({referenceName: post.referenceName});
            const posts = await wallPost.toArray();
            postArray.push(...posts);
        }
      }
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