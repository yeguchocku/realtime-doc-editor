import { useState } from "react";
import Editor from "./Editor";
import Documents from "./Document";
import API_BASE from "./config";
function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  // Register form states
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  // Login form states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeDoc, setActiveDoc] = useState(null);
  // --- REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          username: regUsername,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      alert(data.message);
      setShowRegister(false);
      setRegEmail("");
      setRegUsername("");
      setRegPassword("");
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };
// --- LOGIN ---
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    setUser(data.user);
    setLoggedIn(true);
  } catch (err) {
    alert("Server error: " + err.message);
  }
};

// --- REGISTER PAGE ---
  if (showRegister) {
  return (
    <div style={{
      ...styles.container,
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "#fff",
    }}>
      <h1 style={{ marginBottom: "20px", fontSize: "2rem" }}>Register</h1>
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={regUsername}
          onChange={(e) => setRegUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Register</button>
      </form>
      <p style={{ marginTop: "12px" }}>
        Already have an account?{" "}
        <button 
          onClick={() => setShowRegister(false)} 
          style={{ 
            background: "transparent",
            border: "none",
            color: "#ffeb3b",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Login
        </button>
      </p>
    </div>
  );
}

  // --- LOGIN PAGE ---
  if (!loggedIn) {
  return (
    <div style={{
      ...styles.container,
      background: "linear-gradient(135deg, #ff758c, #ff7eb3)",
      color: "#fff",
    }}>
      <h1 style={{ marginBottom: "20px", fontSize: "2rem" }}>Login</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      <p style={{ marginTop: "12px" }}>
        Don't have an account?{" "}
        <button 
          onClick={() => setShowRegister(true)} 
          style={{ 
            background: "transparent",
            border: "none",
            color: "#ffeb3b",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Register
        </button>
      </p>
    </div>
  );
}

// --- EDITOR PAGE ---
if (!activeDoc) {
  return <Documents onOpen={setActiveDoc} />;
}


return (
  <Editor
    username={user.username}
    documentId={activeDoc}
    goBack={() => setActiveDoc(null)} // <-- Pass goBack function
  />
);


}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    width: "220px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  button: {
    padding: "10px 20px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#ffd700",
    color: "#333",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
};
export default App;
 