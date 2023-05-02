import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js"
import {ObjectId} from "mongodb";
import AWS from "aws-sdk";
const router = Router();

const accessKeyId = process.env.AWS_S3_ACCESKEY
const secretAccessKeyId = process.env.AWS_S3_SECRETACCESSKEY
const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKeyId
    }
);

//News page
router.get("/api/posts/news", authenticateToken, async (req, res) => {
    const userLoggedIn = req.user
    const dbUser = await db.users.findOne({_id: new ObjectId(userLoggedIn._id)})
    const posts = db.posts.find({artistName: {$in: dbUser.following}}).sort({"timeStamp": -1})
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


//Create a post from the user and reference is where the post is posted
router.post('/api/posts/:reference', authenticateToken, async (req, res) => {
    const fileType = req?.files?.fileType
    const user = req.user
    const reference = req.params.reference
    const post = req.body

    post.artistName = user.artistName
    post.referenceName = reference
    post.comments = []
    post.timeStamp = new Date().toLocaleString("en-GB");

    if (fileType) {
        post.keyReference = fileType?.name
        await s3.putObject({
            Body: fileType?.data,
            Bucket: "mkm-mcb",
            Key: fileType?.name,
            ContentType: fileType?.mimetype
        }).promise()
    }

    try {
        await db.posts.insertOne(post)
        res.status(200).send({newPost: post});
    } catch (err) {
        res.status(400).send({message: err.message});
    }
});

router.patch("/api/posts/comments/:reference/:search", authenticateToken, async (req, res) => {
    const userLoggedIn = req.user.artistName;
    const comment = req.body;
    comment.commentAuthor = userLoggedIn;
    comment._id = new ObjectId();
    comment.rating = 0;
    comment.timeCreated = new Date().toLocaleString("en-GB");

    if (req.params.reference === "wallposts") {
        const id = req.params.search
        const result = await db.posts.updateOne(
            {_id: new ObjectId(id)},
            {$push: {comments: comment}}
        );
        res.status(200).send({message: comment});
    } else {
        const postTitle = req.params.search
        const updateCommentArray = await db.posts.updateOne({postTitle: postTitle}, {$push: {comments: comment}})
        res.status(200).send(comment)
    }
});

export default router;
