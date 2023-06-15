import {ObjectId} from "mongodb"
import db from "./database.js"
import bcrypt from "bcrypt"

const user1Id = new ObjectId()
const user1IdString = user1Id.toString();
const user2Id = new ObjectId()
const user2IdString = user2Id.toString();
const user3Id = new ObjectId()
const user3IdString = user3Id.toString();

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
            "_id": user1Id,
            "firstName": "Malthe",
            "lastName": "Gram",
            "artistName": "Gram",
            "role": "admin",
            "reported": [],
            "merch": [],
            "discography": [],
            "userTags": ["DJ", "Singer", "Guitarist"],
            "email": "malthegram22@tunetower.com",
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
            "profilePictureKey": "blank_profile.webp"
        },
        {
            "_id": user2Id,
            "firstName": "Kevin",
            "lastName": "Hansen",
            "artistName": "Funch",
            "reported": [],
            "merch": [],
            "discography": [],
            "userTags": ["Rapper", "Producer"],
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
            "profilePictureKey": "blank_profile.webp"
        },
        {
            "_id": user3Id,
            "firstName": "Michael",
            "lastName": "Dyvad",
            "artistName": "Qyvaden",
            "email": "dyvad@michael.dk",
            "role": "user",
            "reported": [],
            "merch": [],
            "discography": [],
            "userTags": ["Piano", "Beatboxing"],
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
            "profilePictureKey": "blank_profile.webp"
        }])

    await db.posts.insertMany([
        {
            "body": "Get ready to immerse yourself in a sonic adventure with my latest electronic mix! This carefully curated blend of electrifying beats, pulsating synths, and atmospheric melodies will transport you to a realm where rhythm takes control.",
            "rating": [],
            "reported": [],
            "artistName": "Gram",
            "referenceName": "New Releases",
            "profilePictureKey": "blank_profile.webp",
            "artistId": user1IdString,
            "postTitle": "Check my new mix!",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "artistId": user1IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Gram",
                    "commentBody": "Whatever",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()

                },
                {
                    "artistId": user2IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Funch",
                    "commentBody": "Guess u alright mate",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        },
        {
            "body": "Calling all music enthusiasts in London! Are you passionate about creating soul-stirring melodies and captivating rhythms? We're looking for talented individuals to join us in forming an incredible band that will ignite the music scene. Currently, we are in need of a skilled guitarist and a dynamic drummer to complete our lineup. If you're a guitarist or drummer with a burning desire to showcase your talent, collaborate with like-minded musicians, and perform in thrilling live shows, this is your opportunity! Let's come together, jam out, and create magic on stage. Join us on this exhilarating musical journey as we make waves in the vibrant London music scene!",
            "rating": [],
            "artistId": user1IdString,
            "profilePictureKey": "blank_profile.webp",
            "referenceName": "Sharing, Collaborating, and Inspiring",
            "postTitle": "Anyone up for creating a band",
            "artistName": "Gram",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "reported": [],
            "comments": [
                {
                    "artistId": user2IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Funch",
                    "commentBody": "Sounds amazing!! Are there any auditions?",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId(),
                    "reported": [],
                },
                {
                    "artistId": user3IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Qyvaden",
                    "commentBody": "How about you share some of your material first??",
                    "rating": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId(),
                    "reported": [],
                }
            ]
        },
        {
            "body": "The new Aqua album has arrived, immersing listeners in a world of vibrant sounds and infectious beats. From the very first track, it captures the essence of their signature style, blending catchy pop melodies with a refreshing twist. Each song takes you on a journey, evoking a range of emotions and creating an irresistible urge to move to the rhythm. The album showcases Aqua's growth and evolution while staying true to their unique sound. It's an exhilarating musical experience that leaves you craving more, and undoubtedly, it's a remarkable addition to their discography. So, dive in and let the new Aqua album envelop you in its captivating waves of sound. Thoughts?",
            "rating": [],
            "artistId": user2IdString,
            "referenceName": "Sharing, Collaborating, and Inspiring",
            "postTitle": "What do you think about the new Aqua album",
            "profilePictureKey": "blank_profile.webp",
            "artistName": "Funch",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "reported": [],
            "comments": [
                {
                    "artistId": user3IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Qyvaden",
                    "commentBody": "The new Aqua album is a perfect blend of nostalgia and modern pop. It's like a refreshing breeze from the past mixed with catchy beats that make you want to dance. Aqua has truly delivered another infectious collection of songs that will have you singing along and reminiscing about the good old days. It's a must-listen for both old fans and new listeners!",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId() 
                },
                {
                    "artistId": user3IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Qyvaden",
                    "commentBody": "I have to admit, the new Aqua album didn't quite meet my expectations. While their signature style is still present, I feel like they played it safe and didn't take many risks with this release. The songs lack the innovative edge I was hoping for, and it feels like a rehash of their previous work. That being said, if you're a die-hard Aqua fan, you might still find enjoyment in the album. It's just not as groundbreaking as I had hoped it would be.",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                }
            ]
        }, {
            "artistId": user3IdString,
            "body": "The air was electric with anticipation as the crowd gathered under the starlit sky. The stage was set, pulsating with colorful lights and towering speakers. As the music started, a wave of energy swept through the audience, uniting them in a shared musical experience. The performers unleashed their passion, their melodies resonating with every soul present. The atmosphere transformed into a euphoric frenzy, as people danced, sang, and lost themselves in the magic of the music. Time seemed to stand still as the night unfolded, leaving an indelible memory of the BEST CONCERT EVER etched in the hearts of all who attended.",
            "rating": [],
            "referenceName": "Personal Stories, Experiences, and Insights",
            "profilePictureKey": "blank_profile.webp",
            "postTitle": "BEST CONCERT EVER!",
            "reported": [],
            "artistName": "Qyvaden",
            "timeStamp": new Date().toLocaleString("en-GB"),
            "comments": [
                {
                    "artistId": user1IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Gram",
                    "commentBody": "What a night xD",
                    "rating": [],
                    "reported": [],
                    "timeStamp": new Date().toLocaleString("en-GB"),
                    "_id": new ObjectId()
                },
                {
                    "artistId": user2IdString,
                    "profilePictureKey": "blank_profile.webp",
                    "commentAuthor": "Funch",
                    "commentBody": "hahaha you are funny dude. Sounds like a blast!",
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
            "forumTitle": "New Releases",
            "verified": true,
            "tags": [
                "news"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Sharing, Collaborating, and Inspiring",
            "verified": true,
            "tags": [
                "music"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Personal Stories, Experiences, and Insights",
            "verified": true,
            "tags": [
                "personal",
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },

        {
            "forumTitle": "Fundraising Tips",
            "verified": false,
            "tags": [
                "tips"
            ],
            "creationDate": new Date().toLocaleString("en-GB")
        },
        {
            "forumTitle": "Praise 'N Glory",
            "verified": false,
            "tags": [
                "fans"
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

