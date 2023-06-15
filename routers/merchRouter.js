import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js";
import {ObjectId} from "mongodb";
import AWS from "aws-sdk";

const router = Router()

const accessKeyId = process.env.AWS_S3_ACCESKEY
const secretAccessKeyId = process.env.AWS_S3_SECRETACCESSKEY
const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKeyId
    }
);

//Gets the all the merch from a user on artistname
router.get(`/api/users/:artistName/merch`, async (req, res) => {
    const artistName = req.params.artistName

    try {
        const getMerch = await db.users.findOne(
            {artistName: artistName},
            {merch: 1, _id: 0}
        )
        res.status(200).send({data: getMerch})
    } catch (error) {
        res.status(500).send({ message: "An error occurred" })
    }
})

//Creates new merch for a specific user on their id
router.post("/api/users/:artistId/merch", authenticateToken, async (req, res) => {
    const artistId = new ObjectId(req.params.artistId)
    const merch = req.body
    merch.sizes = JSON.parse(merch.sizes);
    merch._id = new ObjectId()
    const file = req.files?.file

    if (file) {
        await s3.putObject({
            Bucket: "mkm-mcb",
            Key: `${artistId}/merch/${merch._id}`,
            Body: file?.data,
            ContentType: file?.mimetype
        }).promise()
    }

    try {
        await db.users.updateOne({_id: artistId}, {
            $push: {
                "merch": merch
            }
        })
        res.status(200).send({data: merch})
    } catch (error) {
        res.status(500).send({ message: "An error occurred" })
    }
})

//Deletes specific merch for on a user and merch id
router.delete("/api/users/:artistId/merch/:merchId", authenticateToken, async (req, res) => {
    const artistId = new ObjectId(req.params.artistId)
    const merchId = new ObjectId(req.params.merchId)

    await s3.deleteObject({
        Bucket: "mkm-mcb",
        Key: `${artistId}/merch/${merchId}`
    }).promise()

    try {
        await db.users.updateOne(
            {_id: artistId},
            {$pull: {merch: {_id: merchId}}}
        )
        res.status(200).send({message: "Success"})

    } catch (error) {
        res.status(500).send({ message: "An error occurred" })
    }

})


export default router
