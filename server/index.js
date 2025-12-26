import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import Document from "./models/document";
import User from "./models/user";

const app = express();
app.use(cors());
app.use(express.json());


// ------------------ MongoDB ------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ------------------ Auth APIs ------------------

// Register
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ email, username, password });
  res.status(201).json({
    message: "User registered successfully",
    user: { email: user.email, username: user.username }
  });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  res.status(200).json({
    message: "Login successful",
    user: { email: user.email, username: user.username }
  });
});
// ------------------ Document APIs ------------------

// Create new document
app.get("/documents", async (req, res) => {
  const docs = await Document.find({}, { content: 0 });
  res.json(docs);
});
app.post("/documents", async (req, res) => {
  try {
    let title = req.body.title?.trim();

    if (!title) {
      title = "Untitled Document";
    }

    const doc = await Document.create({
      title,
      content: { ops: [] },
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/documents/:id", async (req, res) => {
  try {
    const { title } = req.body;

    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rename failed" });
  }
});

// Delete document
app.delete("/documents/:id", async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// ------------------ Socket.IO ------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on("connection", socket => {
  console.log("User connected:", socket.id);
  socket.on("get-document", async (documentId) => {
    console.log("Loading document:", documentId);
    let doc = await Document.findById(documentId);

// 🔧 FIX OLD DOCUMENTS
    if (doc && (!doc.content || !doc.content.ops)) {
      doc.content = { ops: [] };
      await doc.save();
    }

// Create if not exists
    if (!doc) {
      doc = await Document.create({
      _id: documentId,
      title: "Untitled Document",
      content: { ops: [] },
      allowedUsers: []
      });
    }

  socket.join(documentId);
  socket.emit("load-document", doc.content);

  socket.on("send-changes", delta => {
    socket.to(documentId).emit("receive-changes", delta);
  });

    socket.on("send-cursor", data => {
      socket.to(documentId).emit("receive-cursor", {
        userId: socket.id,
        ...data
      });  
 
    });
        socket.on("save-document", async content => {
      await Document.findByIdAndUpdate(documentId, { content });
    });
  });
    
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
  });
});
// ------------------ Server Start ------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
