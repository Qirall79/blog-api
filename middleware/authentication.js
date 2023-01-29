const passport = require("passport");

// Middleware to verify that the user is not already logged in when trying to login again
const isNotAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      return res.json({ success: false, message: "Already logged in" });
    }
    next();
  })(req, res, next);
};

// Middleware to verify that the user is logged in before logging out
const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    console.log(user);
    if (!user) {
      res.status(401).send("You're not logged in.");
      return;
    }
    next();
  })(req, res, next);
};

module.exports = { isAuthenticated, isNotAuthenticated };
