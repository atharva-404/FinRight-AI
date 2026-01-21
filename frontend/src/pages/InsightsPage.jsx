// src/pages/InsightsPage.jsx - WebSocket Chat Implementation
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { useWebSocketChat } from "../services/useWebSocketChat";
import "../styles/global.css";
import "../styles/insights.css";

export default function InsightsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  // WebSocket chat hook
  const {
    isConnected,
    messages: wsMessages,
    isTyping,
    currentStreamingText,
    error: wsError,
    sendMessage,
    setError: setWsError,
    setMessages: setWsMessages,
  } = useWebSocketChat();

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(isTyping);
  const [error, setError] = useState(wsError);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputTextareaRef = useRef(null);

  // Layout / sidebar state
  const [tab, setTab] = useState("chatbot");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Sync WebSocket messages to chat history
  useEffect(() => {
    if (wsMessages.length > 0) {
      setChatHistory(wsMessages);
    }
  }, [wsMessages]);

  // Update loading state based on typing indicator
  useEffect(() => {
    setIsLoading(isTyping);
  }, [isTyping]);

  // Update error state
  useEffect(() => {
    if (wsError) {
      setError(wsError);
    }
  }, [wsError]);

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading, currentStreamingText]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (inputTextareaRef.current) {
      inputTextareaRef.current.style.height = "auto";
      inputTextareaRef.current.style.height = Math.min(inputTextareaRef.current.scrollHeight, 120) + "px";
    }
  }, [question]);

  // Connection status indicator
  useEffect(() => {
    if (!isConnected) {
      console.log("Attempting to reconnect...");
    }
  }, [isConnected]);

  // Navigation functions
  const openDashboard = () => {
    setTab("overview");
    navigate("/dashboard");
  };

  const openUpload = () => {
    setTab("upload");
    navigate("/upload");
  };

  const openFiles = () => {
    setTab("files");
    navigate("/files");
  };

  const openChatBot = () => {
    setTab("chatbot");
    navigate("/insights");
  };

  const backToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // File handling
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit message handler - using WebSocket
  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (!isConnected) {
      setError("Chat service not connected. Please refresh the page.");
      return;
    }

    // Clear error
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
    setWsError(null);

    // Send message through WebSocket
    // Note: File handling would require multipart support or separate file upload
    sendMessage(question, null);

    // Clear input
    setQuestion("");
    removeFile();
  };

  // Keyboard handling
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Quick question handler
  const handleQuickQuestion = (tip) => {
    setQuestion(tip);
    setTimeout(() => {
      if (inputTextareaRef.current) {
        inputTextareaRef.current.focus();
      }
    }, 0);
  };

  // Quick suggestion questions
  const quickQuestions = [
    "What are my biggest spending categories?",
    "How can I save more money?",
    "What's my savings trend?",
    "Which months did I spend the most?",
    "What are my recurring expenses?",
  ];

  // Render welcome screen
  const renderWelcome = () => (
    <div className="chat-welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">💰 Financial Insights</h1>
          <p className="welcome-subtitle">AI-powered analysis of your spending patterns</p>
        </div>

        <div className="quick-actions">
          <h3 className="quick-actions-title">Quick Start</h3>
          <div className="quick-actions-grid">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="quick-action-btn"
              >
                <span className="quick-action-icon">💡</span>
                <span className="quick-action-text">{question}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="welcome-hint">
          <p>Upload your financial data and ask questions to get instant insights</p>
        </div>
      </div>
    </div>
  );

  // Render messages
  const renderMessages = () => (
    <div className="messages-list">
      {chatHistory.map((msg, idx) => (
        <div key={idx} className={`message-wrapper message-${msg.type}`}>
          <div className={`message-bubble ${msg.type}-bubble`}>
            {msg.type === "user" && (
              <div className="user-message-content">
                <p className="message-text">{msg.content}</p>
                {msg.fileName && (
                  <div className="message-attachment">
                    <span className="attachment-icon">📎</span>
                    <span className="attachment-name">{msg.fileName}</span>
                  </div>
                )}
              </div>
            )}
            {msg.type === "ai" && (
              <p className="message-text">{msg.content}</p>
            )}
            {msg.type === "error" && (
              <p className="message-text error-text">{msg.content}</p>
            )}
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="message-wrapper message-ai">
          <div className="message-bubble ai-bubble">
            {currentStreamingText ? (
              <p className="message-text streaming-text">{currentStreamingText}</p>
            ) : (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
        </div>
      )}
      {!isConnected && chatHistory.length === 0 && (
        <div className="connection-status">
          <p className="status-text">🔌 Connecting to chat service...</p>
        </div>
      )}
      <div ref={messagesEndRef} style={{ height: 0 }} />
    </div>
  );

  return (
    <div className="insights-page-container">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        <h3>FinRight</h3>

        <button
          className={`btn ${tab === "overview" ? "active" : ""}`}
          onClick={openDashboard}
          title="Go to Dashboard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          className={`btn ${tab === "upload" ? "active" : ""}`}
          onClick={openUpload}
          title="Go to Upload"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload</span>
        </button>

        <button
          className={`btn ${tab === "files" ? "active" : ""}`}
          onClick={openFiles}
          title="Go to Files"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <span>Files</span>
        </button>

        <button
          className={`btn ${tab === "chatbot" ? "active" : ""}`}
          onClick={openChatBot}
          title="AI Chat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>ChatBot</span>
        </button>

        <div className="sidebar-footer">
          <button
            onClick={backToTop}
            className="back-to-top-btn"
            title="Scroll to top"
          >
            ↑ Top
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main
        ref={mainRef}
        className={`insights-main ${sidebarOpen ? "" : "sidebar-closed"}`}
      >
        {/* Header */}
        <div className="insights-header">
          <div className="header-left">
            <button
              onClick={() => navigate("/dashboard")}
              className="back-link-btn"
              title="Go to dashboard"
            >
              ← Dashboard
            </button>
            <div className="connection-badge">
              <span className={`connection-dot ${isConnected ? "connected" : "disconnected"}`}></span>
              <span className="connection-text">{isConnected ? "Connected" : "Connecting..."}</span>
            </div>
          </div>

          <div className="header-right">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="login-button"
                title="Login to your account"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Login
              </button>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="insights-chat-container">
          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="insights-messages-area"
          >
            {chatHistory.length === 0 ? renderWelcome() : renderMessages()}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="insights-error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="error-close"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="insights-input-area">
            <form onSubmit={handleSubmit} className="input-form">
              <div className="input-wrapper">
                {/* File Upload Button */}
                <button
                  type="button"
                  className="file-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload CSV or PDF"
                  aria-label="Upload file"
                >
                  +
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  aria-label="File input"
                />

                {/* File Selected Indicator */}
                {file && (
                  <div className="file-selected-badge">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={removeFile}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Message Input */}
                <textarea
                  ref={inputTextareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your finances..."
                  className="message-textarea"
                  rows={1}
                  aria-label="Message input"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  className="send-btn"
                  disabled={isLoading || !question.trim()}
                  title="Send message"
                  aria-label="Send message"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>

              {/* Input Hint */}
              <p className="input-hint">
                ⌨️ Enter to send • Shift+Enter for new line
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
