import {Router} from "express";
import db from "../database/database.js";
import {ObjectId} from "mongodb";
import {authenticateToken} from "./middelware/verifyJwt.js";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import {authenticateAdmin} from "./middelware/authenticateAdmin.js";

const jwtSecret = process.env.JWT_SECRET;
const router = Router();
const accessKeyId = process.env.AWS_S3_ACCESKEY;
const secretAccessKeyId = process.env.AWS_S3_SECRETACCESSKEY;

// Instantiate a new S3 object, which has access to AWS API methods.
const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKeyId
    }
);

//Fetch admin role
router.get('/api/admin', authenticateToken, async (req, res) => {
    const userRole = req.user.role;
    res.send({userRole});
});
//Update profile picture 
router.patch("/api/admin/users/:artistId/profile-picture", authenticateToken, async (req, res) => {

    const artistIdString = req.params.artistId;
    const artistIdAsObject = new ObjectId(req.params.artistId);
    const file = req?.files?.profilePicture;
    try {
        if (req.user.role === "admin" || req.user._id === artistIdString) {
            if (file) {
                // Clear profile folder on AWS S3
                await s3.listObjectsV2({Bucket: "mkm-mcb", Prefix: `${artistIdAsObject}/profile/`})
                    .promise()
                    .then(async (data) => {
                        const objects = data.Contents;
                        if (objects.length > 0) {
                            const keys = objects.map(obj => ({Key: obj.Key}))
                            await s3.deleteObjects({Bucket: "mkm-mcb", Delete: {Objects: keys}}).promise()
                        }
                    }).then(async () => {
                        await s3.putObject({
                            Bucket: "mkm-mcb",
                            Key: `${artistIdAsObject}/profile/${file?.md5}`,
                            Body: file?.data,
                            ContentType: file?.mimetype
                        }).promise();
                    });
            }
            await db.users.updateOne(
                {_id: artistIdAsObject},
                {$set: {profilePictureKey: file?.md5}}
            ).then(async () => {
                await db.posts.updateMany(
                    {
                        $or: [
                            {"comments.artistId": artistIdString},
                            {artistId: artistIdString}
                        ]
                    },
                    {
                        $set: {
                            "profilePictureKey": file.md5,
                            "comments.$[comment].profilePictureKey": file.md5
                        }
                    },
                    {
                        arrayFilters: [
                            {"comment.artistId": artistIdString}
                        ]
                    }
                );
            })
        } else {
            res.status(401).send({message: "Unauthorized action"});
        }
    } catch (error) {
        res.status(500).send({error: error.message});
    }

});

//Updates a a user and maps through all collections to update artistName
router.patch("/api/admin/users/:artistName", authenticateToken, async (req, res) => {
    try {

        const {artistName} = req.params;
        const newArtistName = req.body.userBody.artistName;
        const collections = await db.collections;
        const userRole = req.user.role;

        //Functionality restricted to admin, or logged in user
        if (userRole === "admin" || req.user.artistName === artistName) {

            if (!collections) {
                throw new Error("Collections are undefined.");
            }

            let collectionArray = [];
            await db.users.updateOne({artistName: artistName}, {$set: req.body.userBody});
            if (newArtistName) {
                // Update artistName in all collections
                const updatePromises = collections.map(async (collection) => {
                    collectionArray.push(collection.name);
                });

                await Promise.all(updatePromises);

                const updateDocumentPromises = collectionArray.map(async (collectionSearch) => {
                    const collection = db.db.collection(collectionSearch);
                    const documents = await collection.find().toArray();

                    // Update artistName in documents
                    const updateDocuments = documents.map(async (document) => {
                        if (artistName === document.artistName) {
                            await collection.updateMany({artistName: document.artistName}, {$set: {artistName: newArtistName}});
                        }
                        //Update reported array iif it exits
                        if (document.reported) {
                            const updatePostReported = document.reported.map(async (report) => {
                                if (report.userWhoReported === artistName) {
                                    await collection.updateOne(
                                        {_id: document._id, 'reported._id': report._id},
                                        {$set: {'reported.$.userWhoReported': newArtistName}}
                                    );
                                }
                            });
                            await Promise.all(updatePostReported);
                        }
                        // Update commentAuthor and reported array in the comments array if it exists
                        if (document.comments) {
                            const updateComments = document.comments.map(async (comment) => {
                                if (comment.commentAuthor === artistName) {
                                    // Update commentAuthor in the comment
                                    await collection.updateOne(
                                        {_id: document._id, 'comments._id': comment._id},
                                        {$set: {'comments.$.commentAuthor': newArtistName}}
                                    );
                                }
                                if (comment.reported) {
                                    const updateReported = comment.reported.map(async (report) => {
                                        if (report.userWhoReported === artistName) {
                                            // Update userWhoReported in the reported array
                                            await collection.updateOne(
                                                {
                                                    _id: document._id,
                                                    'comments._id': comment._id,
                                                    'comments.reported._id': report._id
                                                },
                                                {$set: {'comments.$[comment].reported.$[reported].userWhoReported': newArtistName}},
                                                {arrayFilters: [{'comment._id': comment._id}, {'reported._id': report._id}]}
                                            );
                                        }
                                    });
                                    await Promise.all(updateReported);
                                }

                                if (comment.rating && comment.rating.includes(artistName)) {
                                    const updatedRating = comment.rating.map((rating) => {
                                        if (rating === artistName) {
                                            return newArtistName;
                                        }
                                        return rating;
                                    });

                                    await collection.updateOne(
                                        {_id: document._id, 'comments._id': comment._id},
                                        {$set: {'comments.$.rating': updatedRating}}
                                    );
                                }
                            });
                            await Promise.all(updateComments);
                        }
                        //Update followers array
                        if (document.followers) {
                            const updateFollowers = document.followers.map(async (follower, index) => {
                                if (follower === artistName) {
                                    await collection.updateOne(
                                        {_id: document._id},
                                        {$set: {[`followers.${index}`]: newArtistName}}
                                    );
                                }
                            });

                            await Promise.all(updateFollowers);
                        }
                        if (document.following) {
                            const updateFollowing = document.following.map(async (following, index) => {
                                if (following === artistName) {
                                    await collection.updateOne(
                                        {_id: document._id},
                                        {$set: {[`following.${index}`]: newArtistName}}
                                    );
                                }
                            });

                            await Promise.all(updateFollowing);
                        }

                        // Update sender field in the messages array if it exists
                        if (document.messages) {
                            const updateMessages = document.messages.map(async (message) => {
                                if (message.sender === artistName) {
                                    await collection.updateOne(
                                        {_id: document._id, 'messages._id': message._id},
                                        {$set: {'messages.$.sender': newArtistName}}
                                    );
                                }
                            });
                            await Promise.all(updateMessages);
                        }

                        // Update participants array if it exists
                        if (document.participants) {
                            const updateParticipants = document.participants.map(async (participant) => {
                                if (participant === artistName) {
                                    await collection.updateOne(
                                        {_id: document._id},
                                        {$set: {'participants.$[participant]': newArtistName}},
                                        {arrayFilters: [{'participant': artistName}]}
                                    );
                                }
                            });
                            await Promise.all(updateParticipants);
                        }
                        // Update rating array if it exists
                        if (document.rating) {
                            const updateRating = document.rating.map(async (rate) => {
                                if (rate === artistName) {
                                    await collection.updateOne(
                                        {_id: document._id},
                                        {$set: {'rating.$[rate]': newArtistName}},
                                        {arrayFilters: [{'rate': artistName}]}
                                    );
                                }
                            });
                            await Promise.all(updateRating);
                        }
                    });

                    await Promise.all(updateDocuments);
                });

                await Promise.all(updateDocumentPromises);
            }
            const user = req.user
            const findUserById = await db.users.find({_id: new ObjectId(user._id)}).toArray()
            //Create a new JWT token for the user on profile settings changes
            if (req.user.artistName === artistName) {
                res.clearCookie("jwt");
                const newToken = jwt.sign(findUserById[0], jwtSecret, {expiresIn: "10m"});
                res.cookie('jwt', newToken, {httpOnly: true});
            }
            res.status(200).send({message: "Success", data: findUserById[0]});
        } else {
            res.status(403).send({message: "Unauthorized action"});
        }
    } catch (err) {
        res.status(500).send("Internal server error.");
    }
});

//Verify forum requests from the users
router.patch("/api/admin/verify/:id", authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const forum = await db.forums.findOne({_id: id});
        const currentVerified = forum.verified;
        const newVerified = !currentVerified;
        forum.verified = newVerified;
        const result = await db.forums.updateOne({_id: id}, {$set: {verified: newVerified}});
        res.status(200).send(forum);
    } catch (error) {
        res.status(500).send({error: "Error updating forum"});
    }
});

//Delete users and forums
router.delete("/api/admin/:urlApi/:id", authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const urlApi = req.params.urlApi;

        if (urlApi === "forum") {
            const deleteForum = await db.forums.deleteOne({_id: id});
            res.status(200).send(deleteForum);
        }
        if (urlApi === "users") {
            const deleteUser = await db.users.deleteOne({_id: id});
            res.status(200).send(deleteUser);
        }
    } catch (error) {
        res.status(500).send({error: "Error deleting document"});
    }
});

export default router;
