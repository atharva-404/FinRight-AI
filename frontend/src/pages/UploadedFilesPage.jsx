// src/pages/UploadedFilesPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { documentService } from "../services/documentService";
import "../styles/global.css";

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
          {/* Top row: back + login, like other pages */}
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
          </div>

          {/* Card with table */}
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              background: "var(--bg-primary)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "var(--text-primary)" }}>
              Uploaded Files
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Your uploaded documents. Columns: File name, Date of upload, Size.
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  color: "#dc2626",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                ❌ {error}
              </div>
            )}

            {loading && (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                Loading documents...
              </div>
            )}

            <div style={{ overflow: "auto", marginTop: 12 }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead
                  style={{
                    textAlign: "left",
                    color: "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: 12,
                        color: "var(--text-primary)",
                      }}
                    >
                      File name
                    </th>
                    <th
                      style={{
                        padding: 12,
                        color: "var(--text-primary)",
                      }}
                    >
                      Date of upload
                    </th>
                    <th
                      style={{
                        padding: 12,
                        color: "var(--text-primary)",
                      }}
                    >
                      Size
                    </th>
                    <th
                      style={{
                        padding: 12,
                        color: "var(--text-primary)",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {files.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: 12,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        No documents uploaded yet.{" "}
                        <a
                          href="/upload"
                          style={{
                            color: "#667eea",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          Upload one now →
                        </a>
                      </td>
                    </tr>
                  )}

                  {files.map((f) => (
                    <tr
                      key={f.id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      {/* 🔹 use file_name from API */}
                                            <td style={{ padding: 12 }}>
                        <button
                          onClick={() => navigate(`/documents/${f.id}`)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            color: "#667eea",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "inherit",
                            fontFamily: "inherit",
                          }}
                        >
                          {f.file_name || f.name}
                        </button>
                      </td>

                      {/* 🔹 use created_at from API */}
                      <td
                        style={{
                          padding: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {f.created_at
                          ? new Date(f.created_at).toLocaleString()
                          : f.addedAt
                          ? new Date(f.addedAt).toLocaleString()
                          : "-"}
                      </td>

                      {/* 🔹 size may not exist yet, so fallback */}
                      <td
                        style={{
                          padding: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {f.size ? formatSize(f.size) : "-"}
                      </td>

                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() => deleteFile(f.id)}
                          style={{
                            padding: "6px",
                            background: "transparent",
                            color: "#c00",
                            border: "1px solid transparent",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "rgba(200, 0, 0, 0.1)";
                            e.target.style.borderColor = "#fcc";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background =
                              "transparent";
                            e.target.style.borderColor =
                              "transparent";
                          }}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="page-footer">
            © Finright — Demo frontend only
          </footer>
        </div>
      </main>
    </div>
  );
}
