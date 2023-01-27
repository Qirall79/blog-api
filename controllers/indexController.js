const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

exports.index_get = (req, res, next) => {
  res.redirect("/posts");
};

exports.login_post = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.status(400).json({
        message: info.message,
        user,
      });
      return;
    }
    console.log(req.user);
    if (req.user) {
      return res.json({ success: false, message: "You're already logged in." });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err);
      }
      const body = { id: user._id, email: user.email };
      const token = jwt.sign(
        { user: body },
        process.env.JWT_SECRET || "Walid zin khanz rjlin"
      );
      return res.json({ token });
    });
  })(req, res, next);
};

exports.signup_post = [
  body("first_name")
    .escape()
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required"),
  body("last_name")
    .escape()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required"),
  body("email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email"),
  body("password")
    .escape()
    .isLength({ min: 1 })
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      res.json({ success: false, errors: errors.array() });
      return;
    }
    user.save((err) => {
      if (err) {
        return next(err);
      }
      res.json({ success: true, message: "Signed up successfully" });
    });
  },
];

exports.logout = (req, res, next) => {
  req.logout();
  res.send("logged out");
};
