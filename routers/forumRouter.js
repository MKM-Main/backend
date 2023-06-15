import {Router} from "express"
import db from "../database/database.js"
import {authenticateToken} from "./middelware/verifyJwt.js"
const router = Router()

//Replace"-" with spaces from a string
function replaceHyphensWithSpaces(str) {
    return str.replace(/-/g, " ");
}

//Get all forums 
router.get('/api/forum', async (req, res) => {
    try {
      const forum = await db.forums.find().toArray();
      res.send({ forum });
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  });

  //Get data on specific forum
  router.get('/api/forum/:forumTitle', async (req, res) => {
    try {
      const forumToFind = replaceHyphensWithSpaces(req.params.forumTitle);
      const forum = await db.forums.find({ forumTitle: forumToFind }).toArray();
      if (forum.length !== 0) {
        const forumData = await db.posts.find({ referenceName: forumToFind }).toArray();
        res.status(200).send({ forumData, title: req.params.forumTitle });
      } else {
        res.status(404).send({ message: "No forum with that title" });
      }
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  });

  //Get data for specific post 
  router.get('/api/forum/post/:postTitle', async (req, res) => {
    try {
      const postTitleToFind = req.params.postTitle;
      const post = await db.posts.findOne({ postTitle: postTitleToFind });
  
      if (!post) {
        res.status(404).send({ message: "No post with that title" });
        return;
      }
  
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
    } catch (error) {
      res.status(500).send({ message: "An error occurred" });
    }
  });

//Request new forum
router.post("/api/forum", authenticateToken, async (req, res) => {
    try {
        const forumRequest = req.body
        forumRequest.creationDate = new Date().toLocaleString("en-GB");
        forumRequest.tags = []
        forumRequest.verified = false
        const post = await db.forums.insertOne(forumRequest)
        res.sendStatus(200)
    } catch (error) {
        res.status(500).send({ message: "An error occurred" })
    }
})

export default router
