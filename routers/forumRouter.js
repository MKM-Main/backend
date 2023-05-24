import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js"
const router = Router()

function replaceHyphensWithSpaces(str) {
    return str.replace(/-/g, " ");
}

router.get('/forum', async (req, res) => {
    const forum = await db.forums.find().toArray()
    res.send({forum})
})

router.get('/forum/:forumTitle', async (req, res) => {
    const forumToFind = replaceHyphensWithSpaces(req.params.forumTitle)
    const forum = await db.forums.find({forumTitle: forumToFind}).toArray()
    if (forum.length !== 0) {
        const forumData = await db.posts.find({referenceName: forumToFind}).toArray()
        res.status(200).send({forumData, title: req.params.forumTitle})
    } else {
        res.status(404).send({message: "No forum with that title"})
    }
})

router.get('/forum/post/:postTitle', async (req, res) => {
    const postTitleToFind = req.params.postTitle;
    const post = await db.posts.findOne({ postTitle: postTitleToFind });
  
    // Function to parse the date string in the format "dd/mm/yyyy, hh:mm:ss"
    const parseDateString = (dateString) => {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
      
        // Note: The month value is zero-based in JavaScript's Date object,
        // so we subtract 1 from the parsed month value
        return new Date(year, month - 1, day, hours, minutes, seconds);
      };

    // Create a copy of the comments array and sort it in descending order
    const sortedComments = [...post.comments];
    sortedComments.sort((a, b) => {
      const dateA = parseDateString(a.timeStamp);
      const dateB = parseDateString(b.timeStamp);
      return dateB - dateA;
    });
  
    // Assign the sorted comments back to the post object
    post.comments = sortedComments;
    res.send({ post });
  });

router.post("/api/forum", authenticateToken, async (req, res) => {
    try {
        const userLoggedIn = req.user
        const forumRequest = req.body
        forumRequest.creationDate = new Date().toLocaleString("en-GB");
        forumRequest.tags = []
        forumRequest.verified = false

        const post = await db.forums.insertOne(forumRequest)
        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.status(500).send({error: "Error Creating forum"})
    }
})

export default router
