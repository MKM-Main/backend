import {Router} from "express"
import db from "../database/database.js"
import { ObjectId } from "mongodb";

const router = Router();

router.get("/api/user/:id", async (req, res) => {
    const id = new ObjectId(req.params.id)
    const user = await db.users.findOne({_id : id})
    delete user.password;
    res.send({user: user})
})

router.patch("/api/user/follow/:id", async (req, res) => {
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


router.patch("/api/user/unfollow/:id", async (req, res) => {
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

export default router;