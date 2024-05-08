import express from "express";

import {
  createPost,
  deletePost,
  getPosts,
  likePost,
  replyToPost,
  getPostfeed
} from "../controllers/PostController.js";
import protectRoute from "../middleware/post.js";

const router = express.Router();
router.get("/feed",protectRoute, getPostfeed);
router.get("/:id", getPosts);
router.delete("/:id", deletePost);
router.post("/create", createPost);
router.post("/likes/:id", likePost);
router.post("/reply/:id",protectRoute, replyToPost);

export default router;
