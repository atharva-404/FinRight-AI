// src/pages/InsightsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { aiService } from "../services/aiService";
import "../styles/global.css";
import "../styles/chat.css";

export default function InsightsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Layout / sidebar state (shared with other pages)
  const [tab, setTab] = useState("chatbot"); // active tab
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainRef = useRef(null);

  function openDashboard() {
    setTab("overview");
    navigate("/dashboard");
  }
  function openUpload() {
    setTab("upload");
    navigate("/upload");
  }
  function openFiles() {
    setTab("files");
    navigate("/files");
  }
  function openChatBot() {
    setTab("chatbot");
    navigate("/insights");
  }

  function backToTop() {
    if (!mainRef.current) return;
    document.documentElement.classList.add("back-to-top-clicked");
    setTimeout(
      () => document.documentElement.classList.remove("back-to-top-clicked"),
      650
    );
    mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }

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

    try {
      const response = await aiService.getInsights(question, file);
      const aiMessage = { type: "ai", content: response.advice };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      const serverMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message;
      const friendly =
        serverMessage || "Failed to get AI insights. Please try again.";
      setError(
        "An error occurred. " +
          (serverMessage ? "See details below." : "Please try again later.")
      );
      console.error("API Error:", err);
      setChatHistory((prev) => [
        ...prev,
        { type: "error", content: friendly },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => setChatHistory([]);

  // Reusable messages area
  const MessagesArea = (
    <div
      className="messages-container overlay-messages"
      role="log"
      aria-live="polite"
    >
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
            className={`message ${
              msg.type === "user"
                ? "user-message"
                : msg.type === "error"
                ? "error-message"
                : "ai-message"
            }`}
          >
            <div className="message-content">
              {msg.type === "user" && (
                <div className="user-message-wrapper">
                  <p className="message-text">{msg.content}</p>
                  {msg.fileName && (
                    <span className="file-indicator">
                      📎 {msg.fileName}
                    </span>
                  )}
                </div>
              )}
              {msg.type === "ai" && (
                <p className="message-text">{msg.content}</p>
              )}
              {msg.type === "error" && (
                <p className="message-text error">{msg.content}</p>
              )}
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="message ai-message">
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {file && (
            <div className="file-selected">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="file-name">{file.name}</span>
              <button
                type="button"
                className="file-remove"
                onClick={() => setFile(null)}
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          )}

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a financial question..."
            className="message-input"
            aria-label="Message input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleSubmit(e);
            }}
          />

          {/* Full-screen toggle (opens overlay) */}
          <button
            type="button"
            className="fullscreen-toggle-btn"
            title="Open full chat"
            aria-label="Open full chat"
            onClick={() => setOverlayOpen(true)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 9V3h6M21 15v6h-6M3 15v6h6M21 9V3h-6" />
            </svg>
          </button>

          <button
            type="submit"
            className="send-btn"
            disabled={isLoading || !question.trim()}
            title="Send message"
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
      <p className="input-hint">Press Ctrl+Enter to send</p>
    </div>
  );

  return (
    <div style={{ display: "flex" }}>
      {/* === STATIC SIDEBAR (same as other pages) === */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        <h3>Finright</h3>

        <button
          className={`btn ${tab === "overview" ? "active" : ""}`}
          onClick={openDashboard}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Dashboard Overview</span>
        </button>

        <button
          className={`btn ${tab === "upload" ? "active" : ""}`}
          onClick={openUpload}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload Expense</span>
        </button>

        <button
          className={`btn ${tab === "files" ? "active" : ""}`}
          onClick={openFiles}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <span>Uploaded Files</span>
        </button>

        <button
          className={`btn ${tab === "chatbot" ? "active" : ""}`}
          onClick={openChatBot}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>ChatBot</span>
        </button>

        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "var(--text-tertiary)",
          }}
        >
          Sidebar (UI-only)
        </div>

        <div>
          <button
            onClick={backToTop}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "var(--primary-color)";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "var(--bg-tertiary)";
              e.target.style.color = "var(--text-primary)";
            }}
          >
            Back to Top
          </button>
        </div>
      </aside>

      {/* === MAIN AREA WITH CHAT === */}
      <main
        ref={mainRef}
        className={`main-with-sidebar ${
          sidebarOpen ? "" : "sidebar-closed"
        }`}
      >
        <div className="container">
          {/* Top row: back + login, consistent with other pages */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div className="page-back-button">
              <button
                onClick={() => navigate("/dashboard")}
                className="back-link-btn"
                title="Go to dashboard"
              >
                ← Dashboard
              </button>
            </div>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="login-button"
                title="Login to your account"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Login
              </button>
            )}
          </div>

          {/* Chat UI card */}
          <div className="chat-container-wrapper">
            <div className="chat-container">
              {/* Main chat area (no extra sidebar now) */}
              <main className="chat-main" role="main">
                {MessagesArea}
                {InputBar}
              </main>
            </div>
          </div>

          {/* Fullscreen overlay (covers main area, not sidebar) */}
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
                  <button
                    className="overlay-close-btn"
                    onClick={() => setOverlayOpen(false)}
                    aria-label="Close full screen chat"
                    title="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="overlay-content">
                {MessagesArea}
                {InputBar}
              </div>
            </div>
          )}

          <footer className="page-footer">
            © Finright — Demo frontend only
          </footer>
        </div>
      </main>
    </div>
  );
}
