const posts = require("../routes/posts");
const index = require("../routes/index");
const postsController = require("../controllers/postsController");
const request = require("supertest");
const express = require("express");

const app = express();

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

app.use(express.urlencoded({ extended: false }));

app.use("/", index);
app.use("/posts", posts);

test("posts route works", (done) => {
  request(app)
    .get("/posts")
    .expect("Content-Type", /json/)
    .expect("Content-Length", "2246")
    .expect(200, done);
});

test("Login successful", (done) => {
  request(app)
    .post("/login")
    .send({
      email: "belfatmi79@gmail.com",
      password: "walid123",
    })
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      return done();
    });
});
jest.setTimeout(500000);
