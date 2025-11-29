// src/pages/UploadedFilesPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { documentService } from "../services/documentService";
import "../styles/global.css";
import "../styles/uploaded-files.css";

/*
  UploadedFilesPage: shows a full-page table of uploaded files.
  Uses backend API response like:
  [
    { "id": 8, "file_name": "data.csv", "created_at": "2025-11-29T00:18:25.976394Z" }
  ]
*/

export default function UploadedFilesPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Sidebar state (shared pattern) ----
  const [tab, setTab] = useState("files"); // this page = files tab active
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

  // ---- Fetch from API ----
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const docs = await documentService.getDocuments();
        // docs is expected like: [{ id, file_name, created_at, ... }]
        setFiles(Array.isArray(docs) ? docs : []);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  function formatSize(n) {
    if (!n && n !== 0) return "-";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${Math.round(n / (1024 * 1024))} MB`;
  }

  function deleteFile(id) {
    // Currently only removes from UI; you can later call a DELETE API here
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
  }

  return (
    <div style={{ display: "flex" }}>
      {/* ---- STATIC SIDEBAR ---- */}
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

      {/* ---- MAIN CONTENT AREA ---- */}
      <main
        ref={mainRef}
        className={`main-with-sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}
      >
        <div className="container">
          {/* Header with navigation */}
          <div className="files-page-header">
            <div className="header-left">
              <button
                onClick={() => navigate("/dashboard")}
                className="back-link-btn"
                title="Go to dashboard"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back to Dashboard</span>
              </button>
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Main card with enhanced styling */}
          <div className="files-container">
            <div className="files-header-section">
              <div className="files-header-content">
                <div className="files-header-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h1 className="files-title">Uploaded Files</h1>
                  <p className="files-subtitle">
                    Manage and organize your expense documents
                  </p>
                </div>
              </div>
              <div className="files-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Files</span>
                  <span className="stat-value">{files.length}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-alert">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your documents...</p>
              </div>
            )}

            {!loading && (
              <div className="files-content">
                {files.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                    </div>
                    <h3>No files uploaded yet</h3>
                    <p>Start by uploading an expense document to get started</p>
                    <button
                      onClick={() => navigate("/upload")}
                      className="upload-now-btn"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Upload Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="files-grid">
                    {files.map((f, index) => (
                      <div
                        key={f.id}
                        className="file-card"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="file-card-header">
                          <div className="file-icon">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                              <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                          </div>
                          <button
                            onClick={() => deleteFile(f.id)}
                            className="delete-btn"
                            title="Delete file"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>

                        <div className="file-card-body">
                          <button
                            onClick={() => navigate(`/documents/${f.id}`)}
                            className="file-name-btn"
                          >
                            {f.file_name || f.name}
                          </button>
                          <div className="file-details">
                            <div className="detail-item">
                              <span className="detail-label">Uploaded</span>
                              <span className="detail-value">
                                {f.created_at
                                  ? new Date(f.created_at).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : f.addedAt
                                  ? new Date(f.addedAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Size</span>
                              <span className="detail-value">
                                {f.size ? formatSize(f.size) : "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="file-card-footer">
                          <button
                            onClick={() => navigate(`/documents/${f.id}`)}
                            className="view-file-btn"
                          >
                            <span>View Details</span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="page-footer">
            © Finright — Expense Management Platform
          </footer>
        </div>
      </main>
    </div>
  );
}
