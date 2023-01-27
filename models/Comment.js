const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Comment = new Schema({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  timestamp: { type: Date, required: true, default: new Date() },
});

module.exports = mongoose.model("Comment", Comment);