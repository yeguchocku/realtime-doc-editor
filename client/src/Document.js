import { useEffect, useState } from "react";

export default function Documents({ onOpen }) {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
useEffect(() => {
  fetch("http://localhost:5000/documents")
    .then(res => res.json())
    .then(setDocs)
    .catch(err => console.error("Fetch docs error:", err));
}, []);

const createDoc = async () => {
  const res = await fetch("/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });

  const doc = await res.json();

  console.log("CREATED DOC ID:", doc._id); // 👈 ADD THIS

  setDocs([...docs, doc]);
  setTitle("");
  onOpen(doc._id);
};
  const deleteDoc = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this document?");
    if (!ok) return;

    const res = await fetch(`/documents/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setDocs(prev => prev.filter(doc => doc._id !== id));
    } else {
      alert("Failed to delete document");
    }
  };

return (
  <div style={styles.container}>
    <h2 style={styles.heading}>📄 My Documents</h2>

    <div style={styles.createBox}>
      <input
        placeholder="Enter document title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={styles.input}
      />
      <button onClick={createDoc} style={styles.createBtn}>
        ➕ New Document
      </button>
    </div>

    <ul style={styles.list}>
      {docs.map((doc, index) => (
        <li key={doc._id} style={styles.listItem}>
          <span style={styles.docTitle}>
            {index + 1}. {doc.title}
          </span>

          <div style={styles.actions}>
            <button
              onClick={() => onOpen(doc._id)}
              style={styles.openBtn}
            >
              Open
            </button>

            <button
              onClick={() => deleteDoc(doc._id)}
              style={styles.deleteBtn}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

}
const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  createBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  createBtn: {
    padding: "10px 16px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    background: "#f9fafb",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  docTitle: {
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  openBtn: {
    padding: "6px 12px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
