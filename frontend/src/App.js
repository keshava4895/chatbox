import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import { FaMicrophone, FaMicrophoneSlash, FaPaperclip, FaPaperPlane, FaUserCircle } from "react-icons/fa";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };


  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ✅ Upload ref
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const suggestions = [
    "Summarize this project",
    "Explain architecture",
    "Key insights?",
    "Generate report"
  ];

  // ✅ Upload function with status feedback
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploadStatus(`⏳ Uploading ${file.name}...`);

        const res = await fetch("http://localhost:8001/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        await res.json();

        setUploadStatus(`✅ ${file.name} uploaded successfully!`);
        console.log(file.name + " uploaded");
      } catch (err) {
        setUploadStatus(`❌ Failed to upload ${file.name}: ${err.message}`);
        console.error("Upload failed:", file.name, err);
      }

      // Keep message visible for 3 seconds
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };
  const exportChat = () => {
    if (chat.length === 0) {
      alert("No chat to export");
      return;
    }

    setExportLoading(true);

    const formatted = chat.map((c) => {
      const time = c.time ? new Date(c.time).toLocaleString() : "";
      const sender = c.role === "user" ? "You" : "SwooshAI";
      return `[${time}] ${sender}: ${c.text}`;
    }).join("\n\n");

    const blob = new Blob([formatted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "chat-export.txt";
    link.click();

    URL.revokeObjectURL(url);
    setExportLoading(false);
  };

  const login = () => {
    if (userName.trim()) {
      localStorage.setItem("userName", userName);
      setIsLoggedIn(true);
    } else {
      alert("Please enter your name or email");
    }
  };

  const logout = () => {
    setUserName("");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setChat([]);
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [chat]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  useEffect(() => {
    const closeMenu = () => setShowMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const newChat = () => {
    if (chat.length > 0) {
      setHistory((prev) => [
        { title: chat[0]?.text?.slice(0, 25) || "Chat", data: chat },
        ...prev
      ]);
    }
    setChat([]);
  };

  const loadChat = (item) => setChat(item.data);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userText = message;
    setMessage("");

    setChat((prev) => [
      ...prev,
      { role: "user", text: userText, time: new Date() }
    ]);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let botText = "";

      setChat((prev) => [
        ...prev,
        { role: "bot", text: "", time: new Date() }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        botText += chunk;

        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = botText;
          return updated;
        });
      }

    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error connecting to server." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="app">

      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <div className="brand-logo">
          <h2 className="brand-gradient">SwooshAI</h2>
          <span className="tag">JUSTASK</span>
        </div>

          <button className="new-chat" onClick={newChat}>
            + New Chat
          </button>

          <div className="recent">
            {history.map((item, i) => (
              <div key={i} className="chat-item" onClick={() => loadChat(item)}>
                {item.title}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom user */}
        <div
          className="user-info"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
        >
          <div className="user-avatar"><FaUserCircle size={20} /></div>
          <div>
            <div className="user-name">{userName || "User"}</div>
            <div className="user-role">Logged In</div>
          </div>

          {showMenu && (
            <div className="user-menu">
              <div className="menu-item" onClick={exportChat}>
                Export chat
              </div>
              <div className="menu-item logout" onClick={logout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoggedIn ? (
        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <img src="/nike.png" className="logo nike-logo" />
            <h3 className="title">Your assistant</h3>

            <div className="top-right">
              <img src="/quadrant.png" className="logo quadrant-logo" />

              <div className="theme-toggle">
                <input
                  id="theme-toggle"
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <label htmlFor="theme-toggle" className="toggle-label">
                  <span className="toggle-ball" />
                </label>
              </div>
            </div>
          </div>

          {/* Upload Status Popup */}
          {uploadStatus && (
            <div className="upload-popup">
              {uploadStatus}
            </div>
          )}
          <div className="chat-area">
            {chat.map((c, i) => (
              <div key={i} className={`msg ${c.role}`}>
                <div className="bubble">
                  <div className="meta">
                    {c.role === "user" ? "You" : "SwooshAI"} •{" "}
                    {new Date(c.time).toLocaleTimeString()}
                  </div>
                  <ReactMarkdown>{c.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg bot">
                <div className="bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="input-box">
            <div className="input-box-inner">

              {/* 🖇️ Upload */}
              <button
                type="button"
                className="audio-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <FaPaperclip size={18} />
              </button>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                hidden
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
              />

              {/* 🎤 Mic */}
              <button
                type="button"
                className={`audio-btn mic-btn ${isRecording ? "recording" : ""}`}
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <FaMicrophoneSlash size={18} />
                ) : (
                  <FaMicrophone size={18} />
                )}
              </button>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message SwooshAI..."
                disabled={loading}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.keyCode === 13) && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button type="button" className="audio-btn send-btn" onClick={sendMessage}>
                <FaPaperPlane size={18} />
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="login-container">
          <div className="login-form">
            <h1>Welcome to SwooshAI</h1>
            <input
              type="text"
              placeholder="Enter your name or email"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={login}>Start Chatting</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;