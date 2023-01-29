var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const session = require("express-session");

var indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");

var app = express();

require("dotenv").config();
// Database setup
const mongoose = require("mongoose");
const { mainModule } = require("process");
const mongoDb =
  process.env.MONGODB_URI ||
  "mongodb+srv://walid:walid123@cluster0.hqkhs9t.mongodb.net/blog?retryWrites=true&w=majority";

main().catch((err) => {
  console.log(err);
});
async function main() {
  await mongoose.connect(mongoDb);
}

// cors setup
app.use(cors());

// passport js
require("./config/passport");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/posts", postsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
