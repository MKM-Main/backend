import {Router} from "express"
import db from "../database/database.js"
import {ObjectId} from "mongodb";
import {authenticateToken} from "./middelware/verifyJwt.js"
import jwt from "jsonwebtoken";
const router = Router();

//Gets all the users
router.get("/api/users", async (req, res) => {
    try {
        const users = await db.users.find().toArray()
        delete users.password
        let usersArray = []
        users.forEach((user) => {
            delete user.password
            usersArray.push(user)
        })
        res.status(200).send({data: usersArray})
    } catch (error) {
        res.status(404).send({ message: "Not found" })
    }
})

//Gets one specific user on artistname
router.get("/api/users/:artistname", async (req, res) => {
    try {
      const artistName = req.params.artistname;
      const user = await db.users.findOne({ artistName: artistName });
      res.send({ user: user });
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  });
  

//Finds the following or follower on artistname
router.get("/api/users/:state/:artistname", async (req, res) => {
    try {
      const state = req.params.state;
      const artistName = req.params.artistname;
      const artist = await db.users.findOne({ artistName: artistName });
  
      if (state === "following") {
        const followingUsers = db.users.find({ artistName: { $in: artist.following } });
        const userArray = await followingUsers.toArray();
  
        res.status(200).send(userArray);
      } else {
        const followersUsers = db.users.find({ artistName: { $in: artist?.followers } });
        const userArray = await followersUsers.toArray();
  
        res.status(200).send(userArray);
      }
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  });

//Updates a user
router.patch("/api/users", authenticateToken, async (req, res) => {
    const id = new ObjectId(req.user._id)
    const updatedUser = req.body
    try {
        await db.users.updateOne({_id: id}, {$set: updatedUser})
        const newPayLoad = {...req.user, ...updatedUser}
        const newToken = jwt.sign(newPayLoad, process.env.JWT_SECRET)
        res.cookie('jwt', newToken, {httpOnly: true});
        res.send({message: "Succes", token: newToken})
    } catch (error) {
        res.status(500).send({ message: "An error occurred" })
    }
})

//Makes it possible for at user to follow another user
router.patch("/api/users/follow", authenticateToken, async (req, res) => {
    try {
      // Current user
      const user = req.user;
  
      // Get the id from the follow button on another user
      const followingUserId = new ObjectId(req.body.userId);
  
      const followingUserData = await db.users.findOne({ _id: followingUserId });
  
      // Following
      await db.users.updateOne(
        { _id: new ObjectId(user._id) },
        { $addToSet: { following: followingUserData.artistName } }
      );
  
      // Followers
      await db.users.updateOne(
        { _id: followingUserId },
        { $addToSet: { followers: user.artistName } }
      );
  
      res.send({ message: "User followed successfully" });
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  });

//Makes it possbile for a user to unfollow
router.patch("/api/users/unfollow", authenticateToken, async (req, res) => {
  try {
    // Current user
    const user = req.user;

    const unfollowUserId = new ObjectId(req.body.userId);

    const followinUserData = await db.users.findOne({ _id: unfollowUserId });

    // Remove the unfollowUserId from the userId's following list
    await db.users.updateOne(
      { _id: new ObjectId(user._id) },
      { $pull: { following: followinUserData.artistName } }
    );

    // Remove the userId from the unfollowUserId's followers list
    await db.users.updateOne(
      { _id: unfollowUserId },
      { $pull: { followers: user.artistName } }
    );

    res.send({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).send({ message: "An error occurred" });
  }
});

export default router;
