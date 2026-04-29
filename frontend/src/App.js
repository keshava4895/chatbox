import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import { FaMicrophone, FaMicrophoneSlash, FaPaperclip, FaPaperPlane, FaUserCircle, FaSun, FaMoon, FaFileAlt, FaSitemap, FaLightbulb, FaChartBar, FaSearch, FaEdit, FaColumns, FaDownload } from "react-icons/fa";

function SwooshLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 192.756 192.756" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
      <defs>
        <linearGradient id="swooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path fill="url(#swooshGrad)" d="M42.741 71.477c-9.881 11.604-19.355 25.994-19.45 36.75-.037 4.047 1.255 7.58 4.354 10.256 4.46 3.854 9.374 5.213 14.264 5.221 7.146.01 14.242-2.873 19.798-5.096 9.357-3.742 112.79-48.659 112.79-48.659.998-.5.811-1.123-.438-.812-.504.126-112.603 30.505-112.603 30.505a24.771 24.771 0 0 1-6.524.934c-8.615.051-16.281-4.731-16.219-14.808.024-3.943 1.231-8.698 4.028-14.291z"/>
    </svg>
  );
}

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  useEffect(() => {
    const close = () => setShowMenu(false);
    if (showMenu) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);


  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Upload ref
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const suggestions = [
    { icon: <FaFileAlt size={18} />,  title: "Summarize this project",  desc: "Get a concise overview of what this project is about", prompt: "Can you give me a summary of what this project is about and what it covers?" },
    { icon: <FaSitemap size={18} />,  title: "Explain architecture",    desc: "Understand system design and infrastructure",            prompt: "Can you explain the system architecture and how the components are designed?" },
    { icon: <FaLightbulb size={18} />,title: "Key insights",            desc: "Extract the most important findings",                    prompt: "What are the key insights and most important findings from the knowledge base?" },
    { icon: <FaChartBar size={18} />, title: "Generate a report",       desc: "Create a structured report from documents",             prompt: "Can you generate a structured summary report based on the available documents?" },
  ];

  // Upload function with status feedback
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploadStatus(`⏳ Uploading ${file.name}...`);

        const res = await fetch("/api/upload", {
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

  const sendMessage = async (overrideText) => {
    const userText = overrideText || message;
    if (!userText.trim() || loading) return;

    setMessage("");

    setChat((prev) => [
      ...prev,
      { role: "user", text: userText, time: new Date() }
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
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

      {isLoggedIn ? (
        <>
        {/* Sidebar — only shown after login */}
        <div className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>

          {/* Header: brand + toggle */}
          <div className="sidebar-header">
            {sidebarOpen && (
              <div className="brand-block">
                <div className="brand-logo-row">
                  <h2 className="brand-gradient">SwooshAI</h2>
                  <SwooshLogo className="sidebar-swoosh" />
                </div>
                <span className="tag">JUSTASK</span>
              </div>
            )}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <FaColumns size={15} />
            </button>
          </div>

          {/* New Chat */}
          <button className="new-chat" onClick={newChat}>
            <FaEdit size={14} />
            {sidebarOpen && <span>New Chat</span>}
          </button>

          {/* Export Chat */}
          <button className="sidebar-row-btn export-btn" onClick={exportChat} title="Export chat">
            <FaDownload size={14} />
            {sidebarOpen && <span>Export Chat</span>}
          </button>

          {/* Search */}
          {sidebarOpen ? (
            <div className="sidebar-search">
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          ) : (
            <button className="sidebar-icon-btn" title="Search">
              <FaSearch size={15} />
            </button>
          )}

          {/* Recents */}
          {sidebarOpen && (
            <div className="recent">
              {history.length > 0 && <div className="recent-label">Recents</div>}
              {history
                .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, i) => (
                  <div key={i} className="chat-item" onClick={() => loadChat(item)}>
                    {item.title}
                  </div>
                ))}
            </div>
          )}

          {/* Bottom */}
          <div className="sidebar-bottom">
            {/* Dark mode */}
            <button
              className="sidebar-row-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
              {sidebarOpen && <span>{darkMode ? "Light mode" : "Dark mode"}</span>}
            </button>

            {/* User menu — rendered above user-info, outside overflow:hidden clip */}
            {showMenu && (
              <div className="user-menu">
                <div className="menu-item logout" onClick={logout}>
                  Logout
                </div>
              </div>
            )}

            {/* User */}
            <div
              className="user-info"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
            >
              <div className="user-avatar"><FaUserCircle size={20} /></div>
              {sidebarOpen && (
                <div>
                  <div className="user-name">{userName || "User"}</div>
                  <div className="user-role">Logged In</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <div></div>
            <h3 className="title">Your assistant</h3>
            <div className="top-right">
              <div className="quadrant-block">
                <img src="/Qlogo.svg" className="logo quadrant-logo" />
                <div className="quadrant-tagline">Powered By Quadrant</div>
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
            {chat.length === 0 && !loading && (
              <div className="welcome-screen">
                <h2 className="welcome-title">How can I help you today?</h2>
                <p className="welcome-sub">Ask anything about Nike's knowledge base</p>
                <div className="suggestions">
                  {suggestions.map((s, i) => (
                    <div key={i} className="suggestion" onClick={() => sendMessage(s.prompt)}>
                      <div className="suggestion-icon">{s.icon}</div>
                      <div className="suggestion-title">{s.title}</div>
                      <div className="suggestion-desc">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                rows={1}
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
        </>
      ) : (
        <div className="login-container">
          <div className="login-form">
            <SwooshLogo className="login-nike-logo" />
            <h1 className="login-title">Welcome to SwooshAI</h1>
            <p className="login-subtitle">Your intelligent Nike knowledge assistant</p>

            <div className="login-input-wrapper">
              <FaUserCircle className="login-input-icon" size={17} />
              <input
                type="text"
                placeholder="Enter your name or email"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>

            <button onClick={login}>
              Start Chatting &nbsp;<FaPaperPlane size={13} />
            </button>

            <p className="login-footer">Secure &middot; Internal Use Only</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;