import {ObjectId} from "mongodb"
import db from "./database.js"
import bcrypt from "bcrypt"

const hashedPassword = await bcrypt.hash("123", 10)

const cleanDatabase = async () => {
    const deleteAction = true
    if (deleteAction) {
        await db.users.drop()
        await db.forums.drop()
        await db.posts.drop()
    }
}

const insertData = async () => {
    await db.users.insertMany([
        {
            "firstName": "Malthe",
            "lastName": "Gram",
            "artistName": "Gram",
            "email": "malthegram22@gmail.com",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [
                "Funch",
                "Qyvaden"
            ],
            "following": [
                "Qyvaden",
                "Funch"
            ],
            "profilePictureKey": "pp.jpeg"
        },
        {
            "firstName": "Kevin",
            "lastName": "Hansen",
            "artistName": "Funch",
            "email": "funch@kevn.dk",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [
                "Gram"
            ],
            "following": [
                "Qyvaden",
                "Gram"
            ],
            "profilePictureKey": "pp1.jpeg"
        },
        {
            "firstName": "Michael",
            "lastName": "Dyvad",
            "artistName": "Qyvaden",
            "email": "dyvad@michael.dk",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [
                "Funch",
                "Gram"
            ],
            "following": [
                "Gram"
            ],
            "profilePictureKey": "pp2.jpeg"
        }])

    await db.posts.insertMany([
        {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": [],
            "artistName": "Gram",
            "referenceName": "Hadeklubben",
            "postTitle": "Hadeklubben Post 1",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "commentAuthor": "Gram",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()

                },
                {
                    "commentAuthor": "Funch",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        },
        {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": [],
            "referenceName": "Vi elsker Drake",
            "postTitle": "vi elsker drake Post 1",
            "artistName": "Gram",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "commentAuthor": "Funch",
                    "commentBody:": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId(),
                },
                {
                    "commentAuthor": "Qyvaden",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        },
        {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": [],
            "referenceName": "Vi hader Drake",
            "postTitle": "vi hader drake Post 1",
            "artistName": "Funch",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "commentAuthor": "Qyvaden",
                    "commentBody:": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                },
                {
                    "commentAuthor": "Qyvaden",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        }, {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": [],
            "referenceName": "Vi hader Drake",
            "postTitle": "vi hader drake Post 2",
            "artistName": "Qyvaden",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "commentAuthor": "Gram",
                    "commentBody:": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                },
                {
                    "commentAuthor": "Funch",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        }
    ])

    await db.forums.insertMany([
        {
            "forumTitle": "Hadeklubben",
            "tags": [
                "metal"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Vi hader Drake",
            "tags": [
                "rap"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Vi elsker Drake",
            "tags": [
                "rap"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
    ])

}

await cleanDatabase()
await insertData()
