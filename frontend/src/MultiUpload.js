import React, { useRef, useState } from "react";

export default function MultiUpload() {
  const fileInputRef = useRef();

  // NEW: status state
  const [status, setStatus] = useState("");

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = async (e) => {
    const files = Array.from(e.target.files);

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setStatus("⏳ Uploading...");

        await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });

        setStatus(`✅ ${file.name} uploaded`);
      } catch (err) {
        setStatus(`❌ Failed to upload ${file.name}`);
      }

      // auto clear after 3 sec
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <>
      {/* 📎 Button */}
      <button className="clip-btn" onClick={handleClick}>📎</button>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        hidden
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
      />

      {/* NEW: Popup */}
      {status && (
        <div className="upload-popup">
          {status}
        </div>
      )}
    </>
  );
}