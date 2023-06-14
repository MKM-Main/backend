import { Router } from "express";
import db from "../database/database.js";
import { authenticateToken } from "./middelware/verifyJwt.js";
const router = Router();
import { ObjectId } from "mongodb";

//Find all messages in coversation
router.get(
  "/api/conversations/:conversationid",
  authenticateToken,
  async (req, res) => {
    const conversationId = req.params.conversationid;
    if (!ObjectId.isValid(conversationId)) {
      return res.status(400).send("Invalid conversation id");
    }
    try {
      const findConversation = await db.conversations.findOne({
        _id: new ObjectId(conversationId),
      });
      if (!findConversation) {
        return res.status(404).send("Conversation not found");
      }
      res.send(findConversation);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//Find all conversations on a logged in user
router.get("/api/conversations", authenticateToken, async (req, res) => {
  try {
    const user = req.user.artistName;
    const conversations = await db.conversations
      .find({ participants: { $in: [user] } })
      .project({
        participants: { $elemMatch: { $ne: user } },
        timeStamp: 1,
        read: 1,
        sender: 1,
      })
      .sort({ timeStamp: -1 })
      .toArray();

    const arrayParticipants = conversations
      .map((conversation) => conversation.participants)
      .flat();
    const findUsers = await db.users
      .find({ artistName: { $in: arrayParticipants } })
      .project({ profilePictureKey: 1, artistName: 1 })
      .toArray();

    //Merge profilepicturekey directly into the conversation object
    const mergedConversations = conversations.map((conversation) => {
      const user = findUsers.find(
        (u) => u.artistName === conversation.participants[0]
      );
      return {
        ...conversation,
        profilePictureKey: user?.profilePictureKey,
        participantId: user?._id,
      };
    });
    res.status(200).send(mergedConversations);
  } catch (error) {
    res.status(500).send({ message: "An error occurred" });
  }
});

//Creates a conversation with another user
router.post(
  "/api/conversations/:receiver",
  authenticateToken,
  async (req, res) => {
    try {
      const user = req.user;
      const sender = user.artistName;
      const receiver = req.params.receiver;
      const timeStamp = new Date().toLocaleString("en-GB");
      const existingConversation = await db.conversations.findOne({
        participants: { $all: [sender, receiver] },
      });
      if (existingConversation) {
        res.send({ message: "Conversation already exist" });
      } else {
        const conversation = req.body;
        conversation.participants = [sender, receiver];
        conversation.messages = [
          {
            _id: new ObjectId(),
            timeStamp: timeStamp,
            body: `New conversation created at: ${timeStamp}`,
          },
        ];
        conversation.timeStamp = timeStamp;
        conversation.read = false;
        conversation.sender = sender;
        const insertConversation = await db.conversations.insertOne(
          conversation
        );
        const getImgReceiver = await db.users.findOne({ artistName: receiver });
        const getImgSender = await db.users.findOne({ artistName: sender });
        res.status(200).send([
          {
            receiver: [receiver],
            sender: [sender],
            _id: insertConversation.insertedId,
            profilePictureKeyReceiver: getImgReceiver.profilePictureKey,
            profilePictureKeySender: getImgSender.profilePictureKey,
            timeStamp: conversation.timeStamp,
            senderId: user._id,
          },
        ]);
      }
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  }
);

//Patch message to a conversation
router.patch(
  "/api/conversations/messages/:conversationid",
  authenticateToken,
  async (req, res) => {
    try {
      const user = req.user;
      const conversationId = req.params.conversationid;
      const sender = user.artistName;
      const timeStamp = new Date().toLocaleString("en-GB");
      const message = req.body;

      const findImg = await db.users.findOne({ artistName: sender });

      message.profilePictureKey = findImg.profilePictureKey;
      message.sender = sender;
      message._id = new ObjectId();
      message.timeStamp = timeStamp;
      message.senderId = user._id;

      const updateConversation = await db.conversations.updateOne(
        { _id: new ObjectId(conversationId) },
        { $set: { timeStamp: timeStamp, read: false, sender: user.artistName } }
      );

      const insertMessage = await db.conversations.updateOne(
        { _id: new ObjectId(conversationId) },
        { $push: { messages: message } }
      );
      res.status(200).send({ message: message });
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  }
);

router.patch(
  "/api/conversations/read/:coversationid",
  authenticateToken,
  async (req, res) => {
    try {
      const conversationId = new ObjectId(req.params.coversationid);
      const updateConversation = await db.conversations.updateOne(
        { _id: conversationId },
        { $set: { read: true } }
      );
      res.status(200).send(updateConversation);
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  }
);

router.delete("/api/conversations/:conversationid", async (req, res) => {
  try {
    const conversationId = new ObjectId(req.params.conversationid);
    const deleteConversation = await db.conversations.deleteOne({
      _id: conversationId,
    });
    res.status(200).send(deleteConversation);
  } catch (error) {
    res.status(500).send({ message: "An error occurred" });
  }
});

export default router;
