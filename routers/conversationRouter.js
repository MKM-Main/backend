import { Router } from "express"
import db from "../database/database.js"
import { authenticateToken } from "./middelware/verifyJwt.js"
const router = Router();
import {ObjectId} from "mongodb";

//Find all messages in coversation
router.get("/api/conversations/:conversationid", authenticateToken, async (req, res) => {
    const conversationId = req.params.conversationid;
    if (!ObjectId.isValid(conversationId)) {
      return res.status(400).send("Invalid conversation id");
    }
    try {
      const findConversation = await db.conversations.findOne({_id: new ObjectId(conversationId)})
      if (!findConversation) {
        return res.status(404).send("Conversation not found");
      }
      res.send(findConversation);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  })

//Find all conversations on a logged in user
router.get("/api/conversations", authenticateToken, async (req, res) => {
    const user = req.user.artistName;
    const conversations = await db.conversations.find({ participants: { $in: [user] }}).project({participants: { $elemMatch: { $ne: user }}}).toArray();
    res.send(conversations)
  });

//Creates a conversation with another user
router.post("/api/conversations/:receiver", authenticateToken, async (req, res) => {
    const user = req.user;
    const sender = user.artistName;
    const receiver = req.params.receiver;
    const conversation = req.body;
    conversation.participants = [sender, receiver];
    conversation.messages = [];

    const insertConversation = await db.conversations.insertOne(conversation);

    res.status(200).send(insertConversation);
})

//Patch message to a conversation
router.patch("/api/conversations/messages/:conversationid", authenticateToken, async (req, res) => {
    const user = req.user;
    const conversationId = req.params.conversationid;
    const sender = user.artistName
    // const receiver = req.params.receiver;

    const message = req.body;

    message.sender = sender;
    // message.receiver = receiver;
    message._id = new ObjectId();
    message.timeStamp = new Date().toLocaleString("en-GB");

    const insertMessage = await db.conversations.updateOne({ _id: new ObjectId(conversationId) }, { $push: { messages: message } });
    res.status(200).send({ message: insertMessage });
})



export default router