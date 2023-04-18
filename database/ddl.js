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

// await cleanDatabase()

const insertData = async () => {
    await db.users.insertMany([
        {
            "firstName": "Malthe",
            "lastName": "Gram",
            "artistName": "Gram",
            "email": "malthegram22@gmail.com",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": hashedPassword,
            "followers": [
                "Funch",
                "Qyvaden"
            ],
            "following": [
                "Qyvaden"
            ]
        },
        {
            "firstName": "Kevin",
            "lastName": "Hansen",
            "artistName": "Funch",
            "email": "funch@kevn.dk",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [],
            "following": [
                "Qyvaden",
                "Gram"
            ]
        },
        {
            "firstName": "Michael",
            "lastName": "Dyvad",
            "artistName": "Qyvaden",
            "email": "coke@young",
            "creationDate": new Date().toLocaleString("en-GB"),
            "password": bcrypt.hashSync("123", 10),
            "followers": [
                "Funch",
                "Gram"
            ],
            "following": [
                "Qyvaden",
                "Gram"
            ]
        }
    ])

    await db.posts.insertMany([
        {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": 0,
            "artistName": "Gram",
            "referenceName": "Vi hader Drake",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "body:": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": 99,
                    "timeStamp": new Date().toLocaleString("en-GB"),

                },
                {
                    "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": 66,
                    "timeStamp": new Date().toLocaleString("en-GB"),
                }
            ]
        },
        {
            "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "rating": 0,
            "referenceName": "wallPost",
            "artistName": "Gram",
            "comments": [
                {
                    "body:": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": 99,
                    "timeStamp": new Date().toLocaleString("en-GB"),
                },
                {
                    "body": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    "rating": 66,
                    "timeStamp": new Date().toLocaleString("en-GB"),
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
insertData()