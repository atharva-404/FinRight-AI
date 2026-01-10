import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import "../styles/chat.css";

export default function InsightsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false); // overlay (full-screen chat covering uncovered area)
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Autoscroll (also when overlay opens)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, overlayOpen]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    const userMessage = {
      type: "user",
      content: question,
      fileName: file ? file.name : null,
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setFile(null);
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("question", question);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const aiMessage = { type: "ai", content: response.data.advice };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      // Try to extract a helpful server message, otherwise fall back to generic text
      const serverMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message;
      const friendly = serverMessage || "Failed to get AI insights. Please try again.";
      setError("An error occurred. " + (serverMessage ? "See details below." : "Please try again later."));
      console.error("API Error:", err);
      // Add a single error entry to the chat
      setChatHistory((prev) => [
        ...prev,
        { type: "error", content: friendly },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => setChatHistory([]);

  // overlay removed — no need for overlay left position

  // Reusable messages area
  const MessagesArea = (
    <div className="messages-container overlay-messages" role="log" aria-live="polite">
      {chatHistory.length === 0 ? (
        <div className="chat-welcome">
          <h1>Financial Insights Assistant</h1>
          <p>Upload your financial data and ask questions to get insights</p>
          <div className="quick-tips">
            <h4>Try asking:</h4>
            <ul>
              <li>"What are my biggest spending categories?"</li>
              <li>"How can I save more money?"</li>
              <li>"What's my savings trend?"</li>
            </ul>
          </div>
        </div>
      ) : (
        chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.type === "user" ? "user-message" : msg.type === "error" ? "error-message" : "ai-message"}`}
          >
            <div className="message-content">
              {msg.type === "user" && (
                <div className="user-message-wrapper">
                  <p className="message-text">{msg.content}</p>
                  {msg.fileName && <span className="file-indicator">📎 {msg.fileName}</span>}
                </div>
              )}
              {msg.type === "ai" && <p className="message-text">{msg.content}</p>}
              {msg.type === "error" && <p className="message-text error">{msg.content}</p>}
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="message ai-message">
          <div className="message-content">
            <div className="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );

  // Reusable input bar
  const InputBar = (
    <div className="input-area overlay-input">
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <button
            type="button"
            className="file-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload CSV or PDF"
            aria-label="Upload file"
          >
            <span className="plus-icon">+</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".csv, .pdf" onChange={handleFileChange} style={{ display: "none" }} />

          {file && (
            <div className="file-selected">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="file-name">{file.name}</span>
              <button type="button" className="file-remove" onClick={() => setFile(null)} aria-label="Remove file">×</button>
            </div>
          )}

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a financial question..."
            className="message-input"
            aria-label="Message input"
            rows={1}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSubmit(e); }}
          />

          {/* Full-screen toggle (opens overlay covering uncovered area) */}
          <button
            type="button"
            className="fullscreen-toggle-btn"
            title="Open full chat"
            aria-label="Open full chat"
            onClick={() => setOverlayOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9V3h6M21 15v6h-6M3 15v6h6M21 9V3h-6" />
            </svg>
          </button>

          <button type="submit" className="send-btn" disabled={isLoading || !question.trim()} title="Send message" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
      <p className="input-hint">Press Ctrl+Enter to send</p>
    </div>
  );

  return (
    <div className="chat-container-wrapper">
      <div className="chat-container">
        {/* Sidebar */}
        <aside className={`chat-sidebar ${sidebarOpen ? "open" : "closed"}`} aria-hidden={!sidebarOpen}>
          <div className="sidebar-header">
            <h3>Finright</h3>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen((s) => !s)}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              )}
            </button>
          </div>

          <div className="chat-list">
            {chatHistory.length === 0 ? (
              <div className="empty-state"><p>No conversations yet</p><p className="text-xs">Start chatting to see history here</p></div>
            ) : (
              chatHistory.map((msg, idx) => msg.type === "user" ? (
                <div key={idx} className="chat-item" role="button" tabIndex={0}>
                  <div className="chat-item-preview">{msg.content.substring(0, 40)}...</div>
                </div>
              ) : null)
            )}
          </div>

          <button onClick={handleClearHistory} className="clear-history-btn">Clear History</button>

          {/* inside-edge open button when collapsed */}
          {!sidebarOpen && (
            <button className="open-sidebar-inside" onClick={() => setSidebarOpen(true)} title="Open sidebar" aria-label="Open sidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="9 6 15 12 9 18"></polyline>
              </svg>
            </button>
          )}
        </aside>

        {/* Main uncovered area */}
        <main className="chat-main" role="main">
          {/* Top bar with login button */}
            <div className="chat-top-bar">
              <div className="chat-top-bar-content">
                <button 
                  onClick={() => navigate("/login")} 
                  className="login-button-chat"
                  title="Login to your account"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Login
                </button>
              </div>
            </div>

          {MessagesArea}
          {InputBar}
        </main>
      </div>

      {/* Fullscreen overlay (covers uncovered area) */}
      {overlayOpen && (
        <div
          className="chat-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen chat"
          style={{ left: sidebarOpen ? 280 : 80 }}
        >
          <div className="overlay-header">
            <div className="overlay-title">Chat — Full screen</div>
            <div className="overlay-controls">
              <button className="overlay-close-btn" onClick={() => setOverlayOpen(false)} aria-label="Close full screen chat" title="Close">×</button>
            </div>
          </div>

          <div className="overlay-content">
            {MessagesArea}
            {InputBar}
          </div>
        </div>
      )}
    </div>
  );
}
