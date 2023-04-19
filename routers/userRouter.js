import {Router} from "express"
import db from "../database/database.js"
import { ObjectId } from "mongodb";
import { authenticateToken } from "./middelware/verifyJwt.js"
const router = Router();

router.get("/api/users/:artistname", async (req, res) => {
    const artistName = req.params.artistname
    const user = await db.users.findOne({artistName : artistName})
    delete user.password;
    res.send({user: user})
})

router.patch("/api/users/follow", authenticateToken, async (req, res) => {
    //Current user
    const user = req.user
    
    //Get the id from the follow button on another user
    const followingUserId = new ObjectId(req.body.userId)

    const followinUserData = await db.users.findOne({_id : followingUserId})

    //Following
    await db.users.updateOne(
        { _id: user._id },
        { $addToSet: { following: followinUserData.artistName } }
    )

    // Followers
    await db.users.updateOne(
        { _id: followingUserId },
        { $addToSet: { followers: user.artistName } }
    )
    res.send({ message: "User followed successfully" })
})

router.patch("/api/users/unfollow", authenticateToken, async (req, res) => {
    //Current user
    const user = req.user

    const unfollowUserId = new ObjectId(req.body.userId)

    const followinUserData = await db.users.findOne({_id : unfollowUserId})
    // Remove the unfollowUserId from the userId's following list
    await db.users.updateOne(
        { _id: user._id },
        { $pull: { following: followinUserData.artistName } }
    )

    // Remove the userId from the unfollowUserId's followers list
    await db.users.updateOne(
        { _id: unfollowUserId },
        { $pull: { followers: user.artistName } }
    )

    res.send({ message: "User unfollowed successfully" })
})
  
export default router;