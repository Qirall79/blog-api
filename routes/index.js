var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middleware/authentication");

/* GET home page. */
router.get("/", indexController.index_get);

router.post("/login", isNotAuthenticated, indexController.login_post);
router.post("/logout", isAuthenticated, indexController.logout);
router.get("/user", indexController.user_get);

router.post("/signup", indexController.signup_post);

module.exports = router;
