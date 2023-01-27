const express = require("express");
const router = express.Router();
const passport = require("passport");
const postsController = require("../controllers/postsController");

// Get all posts or add post
router.get("/", postsController.posts_get);
router.post("/", postsController.posts_post);

// Get specific post
router.get("/:postId", postsController.post_get);
router.put("/:postId", postsController.post_update);
router.delete("/:postId", postsController.post_delete);

// Post a comment
router.post("/:postId", postsController.comment_post);

module.exports = router;
