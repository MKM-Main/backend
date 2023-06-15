import { Router } from "express";
import { authenticateToken } from "./middelware/verifyJwt.js";
import db from "../database/database.js";
import { ObjectId } from "mongodb";
import AWS from "aws-sdk";

const router = Router();

const accessKeyId = process.env.AWS_S3_ACCESKEY;
const secretAccessKeyId = process.env.AWS_S3_SECRETACCESSKEY;
const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKeyId
}
);

//This router handles creating a new discography for a specific user
router.post("/api/users/:artistId/discography", authenticateToken, async (req, res) => {
    const artistId = new ObjectId(req.params.artistId);
    const discographyItem = req.body;
    const file = req.files?.file;
    discographyItem._id = new ObjectId();
    discographyItem.songs = JSON.parse(discographyItem.songs);
    discographyItem.songs.forEach(song => {
        song._id = new ObjectId();

    });
    discographyItem.releaseDate = discographyItem.releaseDate.split("-").reverse().join("-");
    discographyItem.album = JSON.parse(discographyItem.album);
    discographyItem.isNewRelease = JSON.parse(discographyItem.isNewRelease);

    if (file) {
        await s3.putObject({
            Bucket: "mkm-mcb",
            Key: `${artistId}/discography/${discographyItem._id}`,
            Body: file?.data,
            ContentType: file?.mimeType
        }).promise()
    };

    try {
        await db.users.updateOne({ _id: artistId }, {
            $push: {
                "discography": discographyItem
            }
        })
        res.status(200).send({ data: discographyItem });

    } catch (error) {
        res.status(500).send({ message: "An error occurred" });
    }
});

//This router handles delete of a discography on the id
router.delete("/api/users/:artistId/discography/:discoId", authenticateToken, async (req, res) => {
    const artistId = new ObjectId(req.params.artistId);
    const discoId = new ObjectId(req.params.discoId);

    await s3.deleteObject({
        Bucket: "mkm-mcb",
        Key: `${artistId}/discography/${discoId}`
    }).promise();

    try {
        await db.users.updateOne(
            { _id: artistId },
            { $pull: { discography: { _id: discoId } } }
        )
        res.status(200).send({ message: "Success" });

    } catch (error) {
        res.status(500).send({ message: "An error occurred" });
    }
});


export default router;