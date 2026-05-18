import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import { FaMicrophone, FaMicrophoneSlash, FaPaperclip, FaPaperPlane, FaUserCircle, FaSun, FaMoon, FaFileAlt, FaSitemap, FaLightbulb, FaChartBar, FaSearch, FaEdit, FaColumns, FaDownload, FaTools, FaListUl, FaExclamationTriangle, FaChevronDown, FaTimes } from "react-icons/fa";

function QLogoAnimated({ className }) {
  return (
    <svg className={`qlogo ${className || ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 241 230">
      <path className="q-body" d="M0 0 C0.89871826 -0.00161133 1.79743652 -0.00322266 2.72338867 -0.00488281 C23.4686448 0.33943679 43.92507844 8.94166605 59.5625 22.375 C60.34882813 23.04917969 61.13515625 23.72335938 61.9453125 24.41796875 C76.89606665 38.30081189 87.82015589 59.88351698 88.6875 80.3203125 C89.04138373 99.73968195 85.68211753 116.26010135 76.5625 133.375 C75.9025 133.375 75.2425 133.375 74.5625 133.375 C74.31495468 132.61459915 74.06740936 131.8541983 73.81236267 131.070755 C71.45761403 123.84506756 69.09082955 116.62348183 66.71100521 109.40601826 C65.48842623 105.69683555 64.27027832 101.9863273 63.06274414 98.2722168 C61.89350213 94.67646938 60.71198674 91.08495719 59.52246284 87.49587059 C59.07457052 86.13760632 58.63084585 84.77795917 58.19172478 83.41683388 C52.1021571 64.56706124 43.69749007 48.48817835 25.69140625 38.8359375 C17.30811116 34.85939531 9.54952827 32.98120454 0.3125 33 C-0.51870361 33.00161133 -1.34990723 33.00322266 -2.20629883 33.00488281 C-9.18263964 33.14296116 -15.05151882 34.50680501 -21.4375 37.375 C-22.14777344 37.65214844 -22.85804687 37.92929687 -23.58984375 38.21484375 C-34.90792838 43.07825833 -45.25092299 54.55273782 -50.37109375 65.62109375 C-56.18368277 80.63162583 -56.14069176 96.08982823 -49.9609375 110.91796875 C-41.93368476 128.53024749 -28.92203838 136.48561841 -11.4375 143.375 C-6.91602912 145.00206969 -2.36135113 146.51792203 2.203125 148.01953125 C4.07541779 148.64150642 4.07541779 148.64150642 5.98553467 149.27604675 C9.25886992 150.36339161 12.53397104 151.44531362 15.80950928 152.52600098 C19.16969276 153.63572059 22.52812372 154.75071855 25.88671875 155.86523438 C32.44363509 158.04023904 39.00243773 160.2095029 45.5625 162.375 C45.5625 163.035 45.5625 163.695 45.5625 164.375 C24.02786021 175.84966208 -0.52792924 180.28861082 -24.4375 173.375 C-46.79493315 166.0554626 -66.13258397 151.26289121 -77.4375 130.375 C-88.42234546 106.90661019 -90.51929303 82.9566481 -82.8203125 57.94921875 C-74.23954474 35.77011565 -58.04626398 19.62664581 -37.4375 8.375 C-36.65890625 7.94316406 -35.8803125 7.51132812 -35.078125 7.06640625 C-24.17878692 1.63785996 -12.02118509 0.02036971 0 0 Z " transform="translate(116.4375,24.625)" />
      <path className="q-accent" d="M0 0 C1.86198405 2.79297608 2.54267391 4.50856891 3.3671875 7.68359375 C3.61339844 8.61236328 3.85960937 9.54113281 4.11328125 10.49804688 C4.36464844 11.46806641 4.61601562 12.43808594 4.875 13.4375 C6.40677668 19.31741524 8.00400615 25.12953348 9.96484375 30.8828125 C12.15581126 37.32963499 13.94471152 43.85742932 15.6875 50.4375 C15.99494141 51.58154297 16.30238281 52.72558594 16.61914062 53.90429688 C17.86996188 58.58734977 19.09419789 63.23625247 20 68 C12.96777215 66.73988981 6.24438248 64.96664498 -0.5625 62.8125 C-10.13052022 59.83939082 -19.74110266 57.06478903 -29.39868164 54.39770508 C-35.62413695 52.67664327 -41.82203478 50.88471661 -48 49 C-45.31424948 47.20949966 -42.86828652 46.15138386 -39.86010742 45.04785156 C-32.57002865 42.34735749 -26.75933851 39.33272084 -21 34 C-20.18015625 33.29359375 -19.3603125 32.5871875 -18.515625 31.859375 C-9.10591361 23.24806337 -3.43040856 12.22083049 0 0 Z " transform="translate(159,107)" />
    </svg>
  );
}

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

const formatSourceName = (filename) =>
  filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getFileExt = (filename) => {
  const ext = (filename.split(".").pop() || "").toUpperCase();
  return ["PDF", "DOCX", "TXT"].includes(ext) ? ext : "DOC";
};

function SourcesDropdown({ sources }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="sources">
      <button className="sources-toggle" onClick={() => setOpen(!open)}>
        <FaFileAlt size={11} />
        <span>Referenced Documents</span>
        <span className="sources-count">{sources.length}</span>
        <FaChevronDown size={10} className={`sources-arrow${open ? " open" : ""}`} />
      </button>
      {open && (
        <div className="sources-list">
          {sources.map((s, j) => (
            <div key={j} className="source-card">
              <span className="source-number">{j + 1}</span>
              <FaFileAlt size={13} className="source-card-icon" />
              <span className="source-name">{formatSourceName(s)}</span>
              <span className={`source-type source-type-${getFileExt(s).toLowerCase()}`}>
                {getFileExt(s)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const HEADING_ICONS = {
  "Overview":               <FaSearch size={13} />,
  "Technical Breakdown":    <FaTools size={13} />,
  "Step-by-Step Process":   <FaListUl size={13} />,
  "Technical Considerations": <FaExclamationTriangle size={13} />,
  "Key Takeaway":           <FaLightbulb size={13} />,
};

const markdownComponents = {
  h2: ({ children }) => {
    const text = String(children);
    const icon = Object.entries(HEADING_ICONS).find(([key]) => text.includes(key))?.[1];
    return (
      <div className="response-heading">
        {icon && <span className="response-heading-icon">{icon}</span>}
        <span>{children}</span>
      </div>
    );
  },
};

function MermaidDiagram({ code }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !code) return;
    let cancelled = false;
    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "default" });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<pre class="diagram-fallback">${code}</pre>`;
        }
      }
    };
    render();
    return () => { cancelled = true; };
  }, [code]);

  return <div className="mermaid-diagram" ref={ref} />;
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
  const [lightbox, setLightbox] = useState(null);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  useEffect(() => {
    const close = () => setShowMenu(false);
    if (showMenu) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);


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
      const SOURCES_SEP    = "\x00SOURCES\x00";
      const IMAGES_SEP     = "\x00IMAGES\x00";
      const CONFIDENCE_SEP = "\x00CONFIDENCE\x00";
      const FOLLOWUPS_SEP  = "\x00FOLLOWUPS\x00";
      const IMAGE_SEP      = "\x00IMAGE\x00";
      const DIAGRAM_SEP    = "\x00DIAGRAM\x00";
      const TABLE_SEP      = "\x00TABLE\x00";

      const parseSentinel = (text, sep) => {
        const idx = text.indexOf(sep);
        if (idx === -1) return null;
        const after = text.slice(idx + sep.length);
        const end = after.indexOf("\x00");
        return end !== -1 ? after.slice(0, end) : after;
      };

      setChat((prev) => [
        ...prev,
        { role: "bot", text: "", time: new Date() }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        botText += chunk;

        const firstMarker = botText.indexOf("\x00");
        const displayText = firstMarker !== -1 ? botText.slice(0, firstMarker) : botText;

        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = displayText;
          return updated;
        });
      }

      // Parse all sentinels from the end of the stream
      let sources = [];
      let images = [];
      let confidence = null;
      let followups = [];
      let imageData = null;
      let diagramCode = null;
      let tableHtml = null;
      try { const r = parseSentinel(botText, SOURCES_SEP);    if (r) sources    = JSON.parse(r); } catch {}
      try { const r = parseSentinel(botText, IMAGES_SEP);     if (r) images     = JSON.parse(r); } catch {}
      try { const r = parseSentinel(botText, CONFIDENCE_SEP); if (r) confidence = parseInt(r, 10); } catch {}
      try { const r = parseSentinel(botText, FOLLOWUPS_SEP);  if (r) followups  = JSON.parse(r); } catch {}
      try { const idx = botText.indexOf(IMAGE_SEP);   if (idx !== -1) imageData   = botText.slice(idx + IMAGE_SEP.length); } catch {}
      try { const idx = botText.indexOf(DIAGRAM_SEP); if (idx !== -1) diagramCode = botText.slice(idx + DIAGRAM_SEP.length); } catch {}
      try { const idx = botText.indexOf(TABLE_SEP);   if (idx !== -1) tableHtml   = botText.slice(idx + TABLE_SEP.length); } catch {}

      if (sources.length > 0 || images.length > 0 || confidence !== null || followups.length > 0 || imageData || diagramCode || tableHtml) {
        setChat((prev) => {
          const updated = [...prev];
          const msg = { ...updated[updated.length - 1] };
          if (sources.length > 0)   msg.sources    = sources;
          if (images.length > 0)    msg.images     = images;
          if (confidence !== null)  msg.confidence = confidence;
          if (followups.length > 0) msg.followups  = followups;
          if (imageData)            msg.imageData  = imageData;
          if (diagramCode)          msg.diagramCode = diagramCode;
          if (tableHtml)            msg.tableHtml  = tableHtml;
          updated[updated.length - 1] = msg;
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
                <QLogoAnimated className="logo quadrant-logo" />
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
                <div className="msg-inner">
                  <div className="bubble">
                    <div className="meta">
                      {c.role === "user" ? "You" : "SwooshAI"} •{" "}
                      {new Date(c.time).toLocaleTimeString()}
                    </div>
                    <ReactMarkdown components={markdownComponents}>{c.text}</ReactMarkdown>
                    {c.imageData && (
                      <div className="generated-image-wrap">
                        <img src={`data:image/png;base64,${c.imageData}`} alt="Generated" className="generated-image" />
                      </div>
                    )}
                    {c.diagramCode && <MermaidDiagram code={c.diagramCode} />}
                    {c.tableHtml && (
                      <div className="generated-table" dangerouslySetInnerHTML={{ __html: c.tableHtml }} />
                    )}
                    {c.images && c.images.length > 0 && (
                      <div className="image-gallery">
                        <div className="image-gallery-header">
                          <FaFileAlt size={11} />
                          <span>Referenced Images</span>
                          <span className="image-gallery-count">{c.images.length}</span>
                        </div>
                        <div className="image-grid">
                          {c.images.map((url, j) => (
                            <div key={j} className="image-card" onClick={() => setLightbox(`/api${url}`)}>
                              <div className="image-card-inner">
                                <img src={`/api${url}`} alt={`Reference ${j + 1}`} />
                                <div className="image-card-overlay">
                                  <span>View Full Size</span>
                                </div>
                              </div>
                              <div className="image-card-label">Figure {j + 1}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {c.confidence != null && (
                      <div className="confidence-bar-wrap">
                        <span className="confidence-label">Confidence Score</span>
                        <div className="confidence-bar-track">
                          <div className={`confidence-bar-fill ${c.confidence >= 80 ? "confidence-high" : c.confidence >= 60 ? "confidence-medium" : "confidence-low"}`}
                            style={{ width: `${c.confidence}%` }} />
                        </div>
                        <span className="confidence-pct">{c.confidence}%</span>
                      </div>
                    )}
                    {c.sources && c.sources.length > 0 && (
                      <SourcesDropdown sources={c.sources} />
                    )}
                  </div>
                  {c.followups && c.followups.length > 0 && (
                    <div className="followups">
                      {c.followups.map((q, j) => (
                        <button key={j} className="followup-chip" onClick={() => sendMessage(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
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

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <FaTimes size={18} />
          </button>
          <img
            className="lightbox-img"
            src={lightbox}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default App;