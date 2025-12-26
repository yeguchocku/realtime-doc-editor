import mongoose from "mongoose";
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

export default mongoose.model("User", userSchema);
