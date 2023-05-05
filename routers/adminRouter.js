import {Router} from "express"
import db from "../database/database.js"
import {ObjectId} from "mongodb"
import {authenticateToken} from "./middelware/verifyJwt.js"

const router = Router()

router.get('/api/admin', authenticateToken, async (req, res) =>{
    const userRole = req.user.role
    res.send({userRole})
})

router.patch('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    const id = new ObjectId(req.params.userId);
    const artist = await db.users.findOne({ _id: id });
    if (!artist) {
      res.status(404).send('User not found.');
      return;
    }
    const oldArtistName = artist.artistName;
    const newArtistName = req.body.userBody.artistName;

    const array = await db.users.find().toArray();
    const posts = await db.posts.find().toArray();

    array.forEach(async (user) => {
      const { followers, following } = user;

      if (followers.includes(oldArtistName)) {
        const index = followers.indexOf(oldArtistName);
        followers.splice(index, 1, newArtistName);
      }

      if (following.includes(oldArtistName)) {
        const index = following.indexOf(oldArtistName);
        following.splice(index, 1, newArtistName);
      }

      await db.users.updateOne(
        { _id: user._id },
        { $set: { followers, following } }
      );
    });

    posts.forEach(async (post) => {
      const { comments } = post;
      const updatedComments = comments.map((comment) => {
        if (comment.commentAuthor === oldArtistName) {
          return {
            ...comment,
            commentAuthor: newArtistName,
          };
        } else {
          return comment;
        }
      });

      if (updatedComments.some((comment) => comment.commentAuthor === newArtistName)) {
        await db.posts.updateOne(
          { _id: post._id },
          { $set: { comments: updatedComments } }
        );
      }
    });

    await db.users.updateOne({ _id: id }, { $set: req.body.userBody });
    res.status(200).send("User updated successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});

router.patch("/api/admin/verify/:id", authenticateToken, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id)
    const forum = await db.forums.findOne({_id: id})
    const currentVerified = forum.verified
    const newVerified = !currentVerified

    const result = await db.forums.updateOne({_id: id}, { $set: { verified: newVerified } })
    console.log(result)
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Error updating forum" })
  }
})

router.delete("/api/admin/:urlApi/:id", authenticateToken, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id)
    const urlApi = req.params.urlApi

    if (urlApi === "forum") {
      const deleteForum = await db.forums.deleteOne({_id: id})
      console.log(deleteForum)
      res.status(200).send(deleteForum)
    }
    if (urlApi === "users") {
      const deleteUser = await db.users.deleteOne({_id: id})
      res.status(200).send(deleteUser)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Error deleting document" })
  }
})

export default router
