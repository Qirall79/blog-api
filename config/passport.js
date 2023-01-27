const User = require("../models/User");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;

// dotenv
require("dotenv").config();

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    (email, password, done) => {
      User.findOne({ email }).exec((err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Incorrect Email.",
          });
        }
        if (user.password !== password) {
          return done(null, false, {
            message: "Incorrect Password.",
          });
        }
        return done(null, user, { message: "Logged in successfully" });
      });
    }
  )
);

// Use JWT to protect routes
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "Walid zin khanz rjlin",
    },
    (token, done) => {
      User.findById(token.user.id).exec((err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "User not found." });
        }
        return done(null, user);
      });
    }
  )
);
