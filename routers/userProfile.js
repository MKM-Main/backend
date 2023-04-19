import {Router} from "express"
import db from "../database/database.js"
import { ObjectId } from "mongodb";

const router = Router();

router.get("/api/users/:id", async (req, res) => {
    const id = new ObjectId(req.params.id)
    const user = await db.users.findOne({_id : id})
    delete user.password;
    res.send({user: user})
})

router.patch("/api/users/follow/:id", async (req, res) => {
    //User who follows another user
    const userId = new ObjectId(req.params.id)

    //Get the id from the follow button on another user
    const followingUserId = new ObjectId(req.body.userId)

    // Adds to current user following list
    // Add the followUserId to the userId's following list
    const followinUserData = await db.users.findOne({_id : followingUserId})

    await db.users.updateOne(
        { _id: userId },
        { $addToSet: { following: followinUserData.artistName } }
    )

    // The user current user follows
    // Add the userId to the followUserId's followers list
    const currentUserData = await db.users.findOne({_id : userId})

    await db.users.updateOne(
        { _id: followingUserId },
        { $addToSet: { followers: currentUserData.artistName } }
    )
    res.send({ message: "User followed successfully" })
})

router.patch("/api/users/unfollow/:id", async (req, res) => {
    const userId = new ObjectId(req.params.id)
    const unfollowUserId = new ObjectId(req.body.userId)

    const followinUserData = await db.users.findOne({_id : unfollowUserId})
    // Remove the unfollowUserId from the userId's following list
    await db.users.updateOne(
        { _id: userId },
        { $pull: { following: followinUserData.artistName } }
    )

    const currentUserData = await db.users.findOne({_id : userId})
    // Remove the userId from the unfollowUserId's followers list
    await db.users.updateOne(
        { _id: unfollowUserId },
        { $pull: { followers: currentUserData.artistName } }
    )

    res.send({ message: "User unfollowed successfully" })
})

//Gets the posts from users following (Landing page)
router.get("/api/posts/landingpage/:id", async (req, res) => {
    const id = new ObjectId(req.params.id);
    const user = await db.users.findOne({ _id: id });
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
    res.status(200).send(postArray)
  });

//Post on own wall
router.get("/api/posts/wallpost/:id", async (req, res) => {
    const userId = new ObjectId(req.params.id);
    const user = await db.users.findOne({ _id: userId });
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

    console.log(postArray);
    res.status(200).send(postArray)
})

//Create a post from the user and reference is where the post is posted
router.post('/api/posts/:id/:reference', async (req, res) => {
    const userId = new ObjectId(req.params.id);
    const reference = req.params.reference
    const user = await db.users.findOne({ _id: userId });
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