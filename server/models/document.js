const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  
  title: {
    type: String,
    default: "Untitled Document",
  },
  content: {
    type: Object,
    default: { ops: [] },
  },
  allowedUsers: {
    type: [String], // usernames
    default: [],
  },
},{timestamps: true});

module.exports = mongoose.model("Document", DocumentSchema);
