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

let tags = [
    {name: "metal", checked: false},
    {name: "rap", checked: false},
    {name: "pop", checked: false}
]

//get all posts
router.get("/api/posts", async (req, res) => {
    const posts = await db.posts.find().toArray()
    res.send(posts)
})


//News page
router.get("/api/posts/news", authenticateToken, async (req, res) => {
    const userLoggedIn = req.user
    const dbUser = await db.users.findOne({_id: new ObjectId(userLoggedIn._id)})

    if (dbUser !== null) {
        const posts = db.posts.find({artistName: {$in: dbUser?.following}}).sort({"timeStamp": -1})
        const postArray = await posts.toArray();

        const filteredArray = postArray.filter(post => post.referenceName === "wallpost")

        res.status(200).send(filteredArray)
    }
    if (dbUser === null) {
        res.status(200).send({message: "no posts"})
    } else {
        res.status(500).send()
    }
});

//Posts on own profile
router.get("/api/posts/wallposts/:artistName", async (req, res) => {
    const artistName = req.params.artistName;

    const wallPosts = await db.posts.find({referenceName: "wallpost", artistName: artistName});
    const postArray = await wallPosts.toArray();

    res.status(200).send(postArray)
})

router.get("/api/posts/tags", (req, res) => {
    res.status(200).send({tags})
})

router.get("/api/posts/hyped", async (req, res) => {
    const postEligibleForHype = await db.posts.find({
        $expr: {$gte: [{$size: "$rating"}, 2]}
    }).toArray()


    res.status(200).send(postEligibleForHype)
})


//Create a post from the user and reference is where the post is located
router.post('/api/posts/:reference', authenticateToken, async (req, res) => {
    const fileType = req?.files?.fileType
    const user = req.user
    const reference = req.params.reference
    const post = req.body
    post.tags = JSON.parse(req.body.tags)

    post.artistName = user.artistName
    post.referenceName = reference
    post.rating = []
    post.comments = []
    post.timeStamp = new Date().toLocaleString("en-GB");


    if (fileType) {
        post.keyReference = fileType?.name
        await s3.putObject({
            Body: fileType?.data,
            Bucket: "mkm-mcb",
            Key: `${user.artistName}/posts/${fileType?.name}`,
            ContentType: fileType?.mimetype
        }).promise()
    }

    try {
        Object.keys(post).forEach(key => post[key] === "undefined" ? delete post[key] : {});
        await db.posts.insertOne(post)
        res.status(200).send({newPost: post});
    } catch (error) {
        res.status(400).send({message: error.message});
    }
});

router.patch("/api/posts/comments/:commentId", authenticateToken, async (req, res) => {
    const commentId = new ObjectId(req.params.commentId);

    try {
        const post = await db.posts.findOne({"comments._id": commentId})

        if (!post) {
            res.status(404).send({error: "Post not found"});
            return
        }
        const comment = post.comments.find((comment) => comment._id.equals(commentId));

        if (!comment) {
            res.status(404).send({error: "Comment not found"});
            return
        }
        if (comment.rating.includes(req.user.artistName)) {
            // User already rated the comment, so remove the rating
            await db.posts.updateOne(
                {"comments._id": commentId},
                {$pull: {"comments.$.rating": req.user.artistName}}
            )
            res.status(200).send({length: comment.rating.length - 1});
        } else {
            // User has not rated the comment, so add the rating
            await db.posts.updateOne(
                {"comments._id": commentId},
                {$push: {"comments.$.rating": req.user.artistName}}
            );
            res.status(200).send({length: comment.rating.length + 1});
        }
    } catch (error) {
        res.status(500).send({error: error.message});
    }


})

router.patch("/api/posts/comments/:reference/:search", authenticateToken, async (req, res) => {
    const userLoggedIn = req.user.artistName;
    const comment = req.body;
    comment.commentAuthor = userLoggedIn;
    comment._id = new ObjectId();
    comment.rating = [];
    comment.reported = []
    comment.timeStamp = new Date().toLocaleString("en-GB");

    if (req.params.reference === "wallposts") {
        const id = req.params.search
        const result = await db.posts.updateOne(
            {_id: new ObjectId(id)},
            {$push: {comments: comment}}
        );
        res.status(200).send({message: comment});
    } else {
        const postTitle = req.params.search
        const updateCommentArray = await db.posts.updateOne({_id: postTitle}, {$push: {comments: comment}})
        res.status(200).send(comment)
    }
});

router.patch("/api/posts/:postid", authenticateToken, async (req, res) => {
    const postId = new ObjectId(req.params.postid)
    const userWhoRated = req.body.loggedInUser

    try {
        const checkIfUserAlreadyRatedPost = await db.posts.find({_id: postId}).toArray()
        if (checkIfUserAlreadyRatedPost[0].rating.includes(userWhoRated)) {
            const removeUserFromRatingArray = await db.posts.updateOne({_id: postId}, {$pull: {rating: userWhoRated}})
            res.status(200).send({length: checkIfUserAlreadyRatedPost[0]?.rating?.length - 1})
        } else {
            const addUserToRatingArray = await db.posts.updateOne({_id: postId}, {$push: {rating: userWhoRated}})
            res.status(200).send({length: checkIfUserAlreadyRatedPost[0]?.rating?.length + 1})
        }
    } catch (error) {
        res.status(403).send({error: error.message})
    }
})

router.patch("/api/report/:id", authenticateToken, async (req, res) => {
    try {
        const posts = await db.posts.find().toArray();
        const collection = req.body.collection;
        const link = req.body.link;
        const description = req.body.description;
        const reason = req.body.reason;
        const id = new ObjectId(req.params.id);
        const postId = new ObjectId(req.body.postId);
        const loggedInUser = req.user.artistName;

        if (collection === "posts") {
            if (req.body.postId) {
                const postToUpdate = posts.find((post) => post._id.equals(postId));
                if (!postToUpdate) {
                    return res.status(404).send("Post not found");
                }

                const {comments} = postToUpdate;
                const updatedComments = await Promise.all(
                    comments.map(async (comment) => {
                        if (comment._id.equals(id)) {
                            return {
                                ...comment,
                                reported: [...comment.reported, {
                                    userWhoReported: loggedInUser,
                                    timeStamp: new Date().toLocaleString("en-GB"),
                                    link: link,
                                    reason: reason,
                                    description: description,
                                    _id: new ObjectId()
                                }]
                            };
                        } else {
                            return comment;
                        }
                    })
                );
                const reportPost = await db.posts.updateOne(
                    {_id: postId},
                    {$set: {comments: updatedComments}}
                );
                return res.sendStatus(200);
            } else {
                const reportPost = await db.posts.updateOne(
                    {_id: id},
                    {
                        $push: {
                            reported: {
                                userWhoReported: loggedInUser,
                                timeStamp: new Date().toLocaleString("en-GB"),
                                link: link,
                                reason: reason,
                                description: description,
                                _id: new ObjectId()
                            }
                        }
                    }
                );
                return res.sendStatus(200);
            }
        } else {
            const reportUser = await db[collection].updateOne(
                {_id: id},
                {
                    $push: {
                        reported: {
                            userWhoReported: loggedInUser,
                            timeStamp: new Date().toLocaleString("en-GB"),
                            link: link,
                            reason: reason,
                            description: description,
                            _id: new ObjectId()
                        }
                    }
                }
            );
            return res.sendStatus(200);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
});

router.delete("/api/posts/comments/:postid/:commentid", async (req, res) => {
    try {
        const postId = new ObjectId(req.params.postid)
        const commentId = new ObjectId(req.params.commentid)

        const update = db.posts.updateOne({_id: postId}, {$pull: {comments: {_id: commentId}}});
        res.status(200).send(update)
    } catch (error) {
        res.status(500).send({error: "Error deleting user"});
    }
})

router.delete("/api/posts/:postid", authenticateToken, async (req, res) => {
    const postId = new ObjectId(req.params.postid)

    try {
        const postData = await db.posts.find({_id: postId}).project({keyReference: 1, _id: 0}).toArray()

        await db.posts.deleteOne({_id: postId})

        if (postData[0].keyReference) {
            await s3.deleteObject({
                Bucket: "mkm-mcb",
                Key: postData[0].keyReference
            }).promise()
        }

        res.status(200).send({data: "deleted post"})
    } catch (error) {
        res.status(500).send(error)
    }

})

export default router;
