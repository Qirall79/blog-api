const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const async = require("async");

exports.posts_get = (req, res, next) => {
  Post.find((err, posts) => {
    if (err) {
      return next(err);
    }
    res.json({ success: true, posts });
  });
};
exports.posts_post = [
  body("title")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must contain at least 3 characters")
    .escape(),
  body("content")
    .isLength({ min: 100 })
    .withMessage("Post's content must be at least 100 characters long.")
    .escape(),
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json("You must be logged in to create a post");
      }
      const errors = validationResult(req);
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: user._id,
      });
      if (!errors.isEmpty()) {
        res.status(500).json({ errors: errors.array(), success: false, post });
        return;
      }
      post.save((err, result) => {
        if (err) {
          return next(err);
        }
        res.json({ post, success: true });
      });
    })(req, res, next);
  },
];

// Get specific post
exports.post_get = (req, res, next) => {
  async.parallel(
    {
      post(cb) {
        Post.findById(req.params.postId).populate("author").exec(cb);
      },
      comments(cb) {
        Comment.find({ post: req.params.postId }).populate("user").exec(cb);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (!results.post) {
        return res.json({ success: false, post: results.post });
      }
      res.json({
        success: true,
        post: results.post,
        comments: results.comments,
      });
    }
  );
};
exports.post_update = [
  body("title")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must contain at least 3 characters")
    .escape(),
  body("content")
    .isLength({ min: 100 })
    .withMessage("Post's content must be at least 100 characters long.")
    .escape(),
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ success: false, message: info.message });
      }
      Post.findById(req.params.postId)
        .populate("author")
        .exec((err, post) => {
          if (err) {
            return next(err);
          }
          if (!post) {
            return res
              .status(404)
              .json({ success: false, message: "Post not found" });
          }
          if (user._id.toString() !== post.author._id.toString()) {
            console.log(post.author._id);
            return res.status(401).json({
              success: false,
              message: "You can't edit a post that's not yours.",
            });
          }
          const updatedPost = new Post({
            content: req.body.content,
            title: req.body.title,
            author: user._id,
            _id: post._id,
          });
          Post.findByIdAndUpdate(post._id, updatedPost, {}, (err) => {
            if (err) {
              return next(err);
            }
            res.json(updatedPost);
          });
        });
    })(req, res, next);
  },
];
exports.post_delete = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({ success: false, message: info.message });
    }
    Post.findById(req.params.postId)
      .populate("author")
      .exec((err, post) => {
        if (err) {
          return next(err);
        }
        if (!post) {
          return res
            .status(404)
            .json({ success: false, message: "Post not found" });
        }
        if (user._id.toString() !== post.author._id.toString()) {
          console.log(post.author._id);
          return res.status(401).json({
            success: false,
            message: "You can't delete a post that's not yours.",
          });
        }
        Post.findByIdAndDelete(post._id, (err) => {
          if (err) {
            return next(err);
          }
          res.json({ success: true, message: "Post deleted successfully" });
        });
      });
  })(req, res, next);
};

// Post a comment
exports.comment_post = [
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Comment content is required"),
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send({ success: false, message: info.message });
      }
      const errors = validationResult(req);
      const comment = new Comment({
        text: req.body.text,
        user: user._id,
        post: req.params.postId,
      });
      if (!errors.isEmpty()) {
        return res.json({ success: false, errors: errors.array(), comment });
      }
      comment.save((err) => {
        if (err) {
          return next(err);
        }
        res.json({ success: true, comment });
      });
    })(req, res, next);
  },
];
