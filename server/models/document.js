import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Document" },
    content: { type: Object, default: { ops: [] } },
    allowedUsers: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
