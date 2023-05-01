import {Router} from "express"
import db from "../database/database.js"
import { authenticateToken } from "./middelware/verifyJwt.js"
import { ObjectId } from "mongodb";
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
    post.comments = []
    post.timeStamp = new Date().toLocaleString("en-GB");
    try {
      await db.posts.insertOne(post)
      res.status(200).send({newPost: post});
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

// router.get("/api/posts/comments/:id", async (req, res) => {
//   const id = new ObjectId(req.params.id)
//   const post = await db.posts.findOne({_id: id})
//   const commentsArray = post.comments
//   res.send({message: commentsArray})
// })

router.patch("/api/posts/comments/:postid", authenticateToken, async (req, res) => {
  const user = req.user;
  const comment = req.body;
  const postId = req.params.postid;
  comment.commentedBy = user.artistName;
  comment._id = new ObjectId();
  comment.timeStamp = new Date().toLocaleString("en-GB"); 
  try {
    const result = await db.posts.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } }
    );
    res.status(200).send({ message: comment });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

export default router;