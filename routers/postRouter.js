import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js"
import {ObjectId} from "mongodb";
import AWS from "aws-sdk";
const router = Router();

const accessKeyId = process.env.AWS_S3_ACCESKEY
const secretAccessKeyId = process.env.AWS_S3_SECRETACCESSKEY
// Instantiate a new S3 object, which has access to AWS API methods.
const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKeyId
    }
);

let tags = [
    {name: "pop", checked: false},
    {name: "hip-hop/rap", checked: false},
    {name: "rock", checked: false},
    {name: "electronic/dance", checked: false},
    {name: "r&b/soul", checked: false},
    {name: "country", checked: false},
    {name: "latin", checked: false},
    {name: "k-pop", checked: false},
    {name: "reggaeton", checked: false},
    {name: "alternative/indie", checked: false}
];


//get all posts
router.get("/api/posts", async (req, res) => {
    try {
        const posts = await db.posts.find().toArray();
        res.send({posts});
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }
});


//News page. Retrieve all posts from users whom the logged in user follows.
router.get("/api/posts/news", authenticateToken, async (req, res) => {
    try {
        const userLoggedIn = req.user;
        const dbUser = await db.users.findOne({_id: new ObjectId(userLoggedIn._id)});

        if (dbUser !== null) {
            const posts = db.posts.find({artistName: {$in: dbUser?.following}}).sort({"timeStamp": -1});
            const postArray = await posts.toArray();
            let filteredArray = postArray.filter(post => post.referenceName === "wallpost");

            const parseDateString = (dateString) => {
                const [datePart, timePart] = dateString.split(", ");
                const [day, month, year] = datePart.split("/");
                const [hours, minutes, seconds] = timePart.split(":");

                // Note: The month value is zero-based in JavaScript.
                // so we subtract 1 from the parsed month value
                return new Date(year, month - 1, day, hours, minutes, seconds);
            };

            filteredArray.forEach((post) => {
                const sortedComments = [...post.comments];
                sortedComments.sort((a, b) => {
                    const dateA = parseDateString(a.timeStamp);
                    const dateB = parseDateString(b.timeStamp);
                    return dateB - dateA;
                });
                post.comments = sortedComments;
            });

            res.status(200).send(filteredArray);
        }
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }

});

//Posts on own profile
router.get("/api/posts/wallposts/:artistName", async (req, res) => {
    try {
        const artistName = req.params.artistName;

        const wallPosts = await db.posts.find({
            referenceName: "wallpost",
            artistName: artistName
        }).sort({"timeStamp": -1});
        const postArray = await wallPosts.toArray();

        const parseDateString = (dateString) => {
            const [datePart, timePart] = dateString.split(", ");
            const [day, month, year] = datePart.split("/");
            const [hours, minutes, seconds] = timePart.split(":");

            // Note: The month value is zero-based in JavaScript
            // so we subtract 1 from the parsed month value
            return new Date(year, month - 1, day, hours, minutes, seconds);
        };

        postArray.forEach((post) => {
            const sortedComments = [...post.comments];
            sortedComments.sort((a, b) => {
                const dateA = parseDateString(a.timeStamp);
                const dateB = parseDateString(b.timeStamp);
                return dateB - dateA;
            });
            post.comments = sortedComments;
        });

        res.status(200).send(postArray);
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }
});
// Retrieve all tags
router.get("/api/posts/tags", (req, res) => {
    try {
        res.status(200).send({tags});
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }
});

//Create a post from the user and reference is where the post is located
router.post('/api/posts/:reference', authenticateToken, async (req, res) => {
    const fileType = req?.files?.fileType
    const user = req.user
    const reference = req.params.reference
    const post = req.body
    // Tags is sent a String from frontend.
    post.tags = JSON.parse(req.body.tags)
    const findUser = await db.users.findOne({artistName: user.artistName})

    post.artistName = user.artistName
    post.artistId = user._id
    post.profilePictureKey = findUser.profilePictureKey;
    post.referenceName = reference
    post.rating = []
    post.comments = []
    post.timeStamp = new Date().toLocaleString("en-GB");
    post._id = new ObjectId();


    if (fileType) {
        post.keyReference = `${post._id}.${fileType?.mimetype.split("/")[1]}`
        await s3.putObject({
            Body: fileType?.data, // This is the Byte data from the file object.
            Bucket: "mkm-mcb",
            Key: `${user._id}/posts/${post._id}.${fileType?.mimetype.split("/")[1]}`,
            ContentType: fileType?.mimetype
        }).promise()
    }

    try {
        // Remove any undefined values
        Object.keys(post).forEach(key => post[key] === "undefined" ? delete post[key] : {});
        await db.posts.insertOne(post)
        res.status(200).send({newPost: post});
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }
});
// Add or remove a user to the rated array in a comment.
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
        res.status(500).send({message: "An error occurred"});
    }
})
// Update a post with a comment.
router.patch("/api/posts/comments/:reference/:search", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const comment = req.body;
        const findUser = await db.users.findOne({artistName: user.artistName});
        comment.commentAuthor = user.artistName;
        comment._id = new ObjectId();
        comment.rating = [];
        comment.reported = [];
        comment.timeStamp = new Date().toLocaleString("en-GB");
        comment.artistId = user._id;
        comment.profilePictureKey = findUser.profilePictureKey;

        // reference decided whether it's a post for an artist's wall or a forum.
        if (req.params.reference === "wallposts") {
            const id = req.params.search;
            const result = await db.posts.updateOne(
                {_id: new ObjectId(id)},
                {$push: {comments: comment}}
            );
            res.status(200).send({message: comment});
        } else {
            const postId = new ObjectId(req.params.search);
            const updateCommentArray = await db.posts.updateOne(
                {_id: postId},
                {$push: {comments: comment}}
            );
            res.status(200).send(comment);
        }
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }
});

// Add or remove a user to the rated array.
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
        res.status(403).send({message: "An error occurred"})
    }
})

// Update a post or comment with a report of the user who's logged in.
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
                // Destruct postToUpdate array
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
    } catch (error) {
        return res.status(500).send({message: "An error occurred"});
    }
});
// Delete a comment within a post
router.delete("/api/posts/comments/:postid/:commentid", async (req, res) => {
    try {
        const postId = new ObjectId(req.params.postid)
        const commentId = new ObjectId(req.params.commentid)

        const update = db.posts.updateOne({_id: postId}, {$pull: {comments: {_id: commentId}}});
        res.status(200).send(update)
    } catch (error) {
        res.status(500).send({message: "An error occurred"});
    }
})
// Delete a post
router.delete("/api/posts/:postid", authenticateToken, async (req, res) => {
    const postId = new ObjectId(req.params.postid)
    const userId = req.user._id

    try {
        const post = await db.posts.find({_id: postId}).toArray()
        const keyReference = post[0].keyReference;

        await db.posts.deleteOne({_id: postId})

        if (keyReference) {
            await s3.deleteObject({
                Bucket: "mkm-mcb",
                Key: `${userId}/posts/${keyReference}`
            }).promise()
        }
        res.status(200).send({data: "deleted post"})
    } catch (error) {
        res.status(500).send({message: "An error occurred"})
    }

})

export default router;
