import {ObjectId} from "mongodb"
import db from "./database.js"
import bcrypt from "bcrypt"

const hashedPassword = await bcrypt.hash("123", 10)

const cleanDatabase = async () => {
    const deleteAction = false
    if (deleteAction) {
        await db.users.drop()
        await db.forums.drop()
        await db.posts.drop()
        await db.conversations.drop()
    }
}

const insertData = async () => {
    await db.users.insertMany([
        {
            "firstName": "Malthe",
            "lastName": "Gram",
            "artistName": "Gram",
            "role": "admin",
            "reported": [],
            "merch": [],
            "discography": [],
            "userTags": [],
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
            "profilePictureKey": "pp1.jpeg"
        },
        {
            "firstName": "Kevin",
            "lastName": "Hansen",
            "artistName": "Funch",
            "reported": [],
            "merch": [],
            "discography": [],
            "userTags": [],
            "role": "admin",
            "email": "funch@kevn.dk",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [
                "Gram",
                "Qyvaden"
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
            "role": "user",
            "reported": [],
            "merch": [],
            "discography": [],
            "userTags": [],
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [
                "Funch",
                "Gram"
            ],
            "following": [
                "Gram",
                "Funch"
            ],
            "profilePictureKey": "pp2.jpeg"
        }])

    await db.posts.insertMany([
        {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": [],
            "reported": [],
            "artistName": "Gram",
            "referenceName": "Hadeklubben",
            "postTitle": "Hadeklubben Post 1",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "commentAuthor": "Gram",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()

                },
                {
                    "commentAuthor": "Funch",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "reported": [],
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
            "reported": [],
            "comments": [
                {
                    "commentAuthor": "Funch",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId(),
                    "reported": [],
                },
                {
                    "commentAuthor": "Qyvaden",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId(),
                    "reported": [],
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
            "reported": [],
            "comments": [
                {
                    "commentAuthor": "Qyvaden",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                },
                {
                    "commentAuthor": "Qyvaden",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        }, {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": [],
            "referenceName": "Vi hader Drake",
            "postTitle": "vi hader drake Post 2",
            "reported": [],
            "artistName": "Qyvaden",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "commentAuthor": "Gram",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                },
                {
                    "commentAuthor": "Funch",
                    "commentBody": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        }
    ])

    await db.forums.insertMany([
        {
            "forumTitle": "Hadeklubben",
            "verified": true,
            "tags": [
                "metal"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Vi hader Drake",
            "verified": true,
            "tags": [
                "rap"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Vi elsker Drake",
            "verified": true,
            "tags": [
                "rap"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },

        {
            "forumTitle": "MGP FOR TOODLERS",
            "verified": false,
            "tags": [
                "rap"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "VIL MEGA GERNE HAVE SLIK",
            "verified": false,
            "tags": [
                "rap"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
    ])

    await db.conversations.insertMany([
        {
            participants: ['Qyvaden', 'Gram'],
            messages: [
                {
                    body: 'hello',
                    sender: 'Qyvaden',
                    _id: new ObjectId(),
                    timeStamp: '05/05/2023, 12:50:38'
                },
                {
                    body: 'Hej Michael',
                    sender: 'Gram',
                    _id: new ObjectId(),
                    timeStamp: '05/05/2023, 13:34:32'
                }
            ]
        }
    ])
}

await cleanDatabase()
await insertData()
