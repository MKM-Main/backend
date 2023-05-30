import {MongoClient, MongoError} from "mongodb"

const PORT = process.env.MONGODB_PORT || 27017
const CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb://127.0.0.1"
const CONNECTION_STRING_CLOUD = process.env.MONGODB_CONNECTION_STRING_CLOUD

const url = CONNECTION_STRING_CLOUD //`${CONNECTION_STRING}:${PORT}`
const client = new MongoClient(url)

await client.connect()

const db = client.db("tunetower")

const users = await db.collection("users")
const posts = await db.collection("posts")
const forums = await db.collection("forums")
const conversations = await db.collection("conversations")
const collections = await db.listCollections().toArray()


export default {
    users,
    posts,
    forums,
    conversations,
    collections,
    db
}
