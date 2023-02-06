const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

require("dotenv").config();

exports.index_get = (req, res, next) => {
  res.redirect("/posts");
};

exports.user_get = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).json({ success: false, user });
    }
    return res.json({ success: true, user });
  })(req, res, next);
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
        success: false,
      });
      return;
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err);
      }
      const body = { id: user._id, email: user.email };
      const token = jwt.sign({ user: body }, process.env.JWT_SECRET || "just some secret");
      return res.json({ token, success: true });
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
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match.");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPassword,
    });

    if (!errors.isEmpty()) {
      res.status(500).json({ success: false, errors: errors.array(), user });
      return;
    }
    user.save((err) => {
      if (err) {
        return next(err);
      }
      res.json({
        success: true,
        message: "Signed up successfully",
        user,
        errors: [],
      });
    });
  },
];

exports.logout = (req, res, next) => {
  req.logout();
  res.json({ success: true, message: "Logged out" });
};
