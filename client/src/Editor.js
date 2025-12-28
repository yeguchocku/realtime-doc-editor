import API_BASE from "./config";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillCursors from "quill-cursors";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";

// Register cursor module
Quill.register("modules/cursors", QuillCursors);

export default function Editor({ username, documentId,goBack }) {
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const wordInputRef = useRef(null);
  const pdfInputRef = useRef(null);
 
  const socket = io("https://realtime-doc-editor-wedl.onrender.com");
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [docTitle, setDocTitle] = useState("Untitled Document");
  // Random color per user
  const userColor = useRef(
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );

  // 🔹 Connect socket once
  useEffect(() => {

    socketRef.current = io(API_BASE);
    return () => socketRef.current.disconnect();
  }, []);

  // 🔹 Load document + receive updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    console.log("EMITTING get-document with documentId:", documentId);
    if(!documentId) return;
    socket.emit("get-document", documentId);

    socket.on("load-document", document => {
      const quill = quillRef.current.getEditor();
      quill.setContents(document || { ops: [] });
      quill.enable();
      setDocumentLoaded(true);
    });

    socket.on("receive-changes", delta => {
      quillRef.current.getEditor().updateContents(delta);
    });

    socket.on("receive-cursor", ({ userId, range, name, color }) => {
      const quill = quillRef.current.getEditor();
      const cursors = quill.getModule("cursors");
      cursors.createCursor(userId, name, color);
      cursors.moveCursor(userId, range);
    });

    return () => {
      socket.off("load-document");
      socket.off("receive-changes");
      socket.off("receive-cursor");
    };
  }, [documentId]);

  // 🔹 Autosave every 2 seconds
  useEffect(() => {
    if (!documentLoaded) return;

    const interval = setInterval(() => {
      const quill = quillRef.current.getEditor();
      socketRef.current.emit("save-document", quill.getContents());
    }, 2000);

    return () => clearInterval(interval);
  }, [documentLoaded]);

  // 🔹 Send text changes
  const handleChange = (content, delta, source) => {
    if (source !== "user") return;
    socketRef.current.emit("send-changes", delta);
  };

  // 🔹 Send cursor updates
  const handleSelectionChange = (range, source) => {
    if (source !== "user" || !range) return;

    socketRef.current.emit("send-cursor", {
      range,
      name: username,
      color: userColor.current
    });
  };

  // 📄 Import Word
const importWord = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  const quill = quillRef.current.getEditor();
  quill.setText("");
  quill.clipboard.dangerouslyPasteHTML(result.value);

  const delta = quill.getContents();

  socketRef.current.emit("send-changes", delta);
  socketRef.current.emit("save-document", delta);
};


  // 📄 Import PDF
const importPDF = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  const quill = quillRef.current.getEditor();

  // 🔴 IMPORTANT PART
  quill.setText("");                // clear existing content
  quill.insertText(0, fullText);    // insert text

  const delta = quill.getContents();

  // 🔥 SEND TO ALL USERS
  socketRef.current.emit("send-changes", delta);

  // 💾 SAVE DOCUMENT
  socketRef.current.emit("save-document", delta);
};

const renameDocument = async () => {
    const newTitle = prompt("Enter new title", docTitle);
    if (!newTitle) return;

    const res = await fetch(`http://localhost:5000/documents/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (res.ok) setDocTitle(newTitle);
  };
const editorBtn = {
  marginLeft: "8px",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};
const handleLogout = () => {
  // Clear any stored user info (e.g., localStorage or context)
  localStorage.removeItem("username"); // adjust if you use different storage
  window.location.href = "/login"; // redirect to login page
};



  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
 {/* 🔙 BACK BUTTON */}
      <button
        onClick={goBack}
        style={{
          padding: "8px 16px",
          margin: "10px",
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        ⬅ Back
      </button>      
 
      {/* 🔹 Top bar */}
      <div
        style={{
          padding: "12px 20px",
          background: "linear-gradient(90deg, #4f46e5, #6366f1)",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  Logged in as: <strong>{username}</strong>
  <button
    onClick={handleLogout}
    style={{
      marginLeft: "16px",
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#ef4444", // red
      color: "#fff",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    Logout
  </button>
</div>


        <div>
          <button style={editorBtn} onClick={() => wordInputRef.current.click()}>
            Import Word
          </button>

  <button 
    style={{ ...editorBtn, marginLeft: "8px" }}
    onClick={() => pdfInputRef.current.click()}
  >
    Import PDF
  </button>
    <button 
      style={{ ...editorBtn, marginLeft: "8px" }}
      onClick={renameDocument} >
      Rename
    </button>

          {/* Hidden inputs */}
          <input
            type="file"
            accept=".docx"
            ref={wordInputRef}
            onChange={importWord}
            style={{ display: "none" }}
          />

          <input
            type="file"
            accept=".pdf"
            ref={pdfInputRef}
            onChange={importPDF}
            style={{ display: "none" }}
          />
        </div>
      </div>
      {/* 🔹 Editor */}
      <div style={{ flex: 1 }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          readOnly={!documentLoaded}
          onChange={handleChange}
          onChangeSelection={handleSelectionChange}
          modules={{
            toolbar: true,
            cursors: true
          }}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
