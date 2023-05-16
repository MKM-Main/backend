import {Router} from "express"
import {authenticateToken} from "./middelware/verifyJwt.js";
import db from "../database/database.js"
import {ObjectId} from "mongodb";
import AWS from "aws-sdk";

const router = Router()

const accessKeyId = process.env.AWS_S3_ACCESKEY
const secretAccessKeyId = process.env.AWS_S3_SECRETACCESSKEY
const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKeyId
    }
)


router.post("/api/users/:artistName/discography", authenticateToken, async (req, res) => {
    const artistName = req.params.artistName
    const discographyItem = req.body
    const file = req.files?.file
    discographyItem._id = new ObjectId()
    discographyItem.songs = JSON.parse(discographyItem.songs)
    discographyItem.songs.forEach(song => {
        song._id = new ObjectId()

    })
    discographyItem.album = discographyItem.album = "true" ? true : false


    if (file) {
        discographyItem.referenceKey = file.md5
        await s3.putObject({
            Bucket: "mkm-mcb",
            Key: `${artistName}/discography/${discographyItem.referenceKey}`,
            Body: file?.data,
            ContentType: file?.mimeType
        }).promise()
    }

    try {
        await db.users.updateOne({artistName: artistName}, {
            $push: {
                "discography": discographyItem
            }
        })
        res.status(200).send({data: discographyItem})

    } catch (error) {
        res.status(500).send({error: error.message})
    }

})

router.delete("/api/users/:artistName/discography/:discoId", authenticateToken, async (req, res) => {
    const artist = req.params.artistName
    const discoId = new ObjectId(req.params.discoId)

    await s3.deleteObject({
        Bucket: "mkm-mcb",
        Key: `${artist}/discography/${discoId}`
    }).promise()

    try {
        await db.users.updateOne(
            {artistName: artist},
            {$pull: {discography: {_id: discoId}}}
        )
        res.status(200).send({message: "Success"})

    } catch (error) {
        res.status(500).send({error: error.message})
    }

})


export default router
