// src/pages/DocumentContentPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { apiClient } from "../services/authService"; // axios instance with token + refresh
import "../styles/global.css";

export default function DocumentContentPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { documentId } = useParams();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [columns, setColumns] = useState([]);

  // sidebar + layout state
  const [tab, setTab] = useState("files");
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

  // Fetch document content from API: GET /api/ai/documents/<document_id>/content/
  useEffect(() => {
    const fetchDocumentContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(
          `/api/ai/documents/${documentId}/content/`
        );

        setDoc(res.data);

        // If content is a string (likely CSV), parse it
        if (typeof res.data === "string") {
          parseCSV(res.data);
        } else if (res.data.content && typeof res.data.content === "string") {
          parseCSV(res.data.content);
        } else if (typeof res.data === "object") {
          // Handle object format
          setColumns(Object.keys(res.data));
          setTableData([res.data]);
        }
      } catch (err) {
        console.error("Error fetching document content:", err);
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load document content.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocumentContent();
    }
  }, [documentId]);

  // helper: render any value nicely in table
  const renderValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    return JSON.stringify(value, null, 2);
  };

  // Parse CSV content into table data
  const parseCSV = (content) => {
    try {
      const lines = content.trim().split("\n");
      if (lines.length === 0) return null;

      // Parse header
      const headerLine = lines[0];
      const parsedColumns = headerLine.split(",").map((col) => col.trim());

      // Parse rows
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((val) => val.trim());
        const row = {};
        parsedColumns.forEach((col, idx) => {
          row[col] = values[idx] || "";
        });
        rows.push(row);
      }

      setColumns(parsedColumns);
      setTableData(rows);
    } catch (err) {
      console.error("CSV parsing error:", err);
      setError("Failed to parse document as CSV");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
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

        <h3>FinRight</h3>

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
        style={{
          flex: 1,
          height: "100vh",
          overflowY: "auto",
          paddingBottom: "40px",
        }}
      >
        <div className="container">
          {/* Top row: back + login */}
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
                onClick={() => navigate("/files")}
                className="back-link-btn"
                title="Back to uploaded files"
              >
                ← Back to Files
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

          {/* Card with document content */}
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              background: "var(--bg-primary)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-color)",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 24,
                  }}
                >
                  📄
                </div>
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "var(--text-primary)",
                      fontSize: 28,
                      fontWeight: 800,
                    }}
                  >
                    Document Details
                  </h2>
                </div>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: 0,
                  fontSize: 14,
                }}
              >
                Document ID:{" "}
                <code
                  style={{
                    background: "var(--bg-tertiary)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    color: "#667eea",
                    fontWeight: 600,
                  }}
                >
                  {documentId}
                </code>
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  color: "#dc2626",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 24,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <strong>Error loading document</strong>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{error}</div>
                </div>
              </div>
            )}

            {loading && (
              <div
                style={{
                  padding: 64,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  Loading document content...
                </div>
                <div style={{ fontSize: 13, marginTop: 8 }}>
                  This may take a few moments
                </div>
              </div>
            )}

            {!loading && doc && tableData && columns.length > 0 && (
              <div style={{ overflow: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                      }}
                    >
                      {columns.map((col, idx) => (
                        <th
                          key={idx}
                          style={{
                            padding: "16px 20px",
                            textAlign: "left",
                            fontWeight: 700,
                            fontSize: 13,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            minWidth: "120px",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        style={{
                          background:
                            rowIdx % 2 === 0
                              ? "transparent"
                              : "rgba(102, 126, 234, 0.03)",
                          borderBottom: "1px solid var(--border-color)",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(102, 126, 234, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            rowIdx % 2 === 0
                              ? "transparent"
                              : "rgba(102, 126, 234, 0.03)";
                        }}
                      >
                        {columns.map((col, colIdx) => (
                          <td
                            key={colIdx}
                            style={{
                              padding: "14px 20px",
                              color: "var(--text-primary)",
                              verticalAlign: "middle",
                              maxWidth: "300px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={row[col]}
                          >
                            {row[col] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Stats */}
                <div
                  style={{
                    marginTop: 32,
                    padding: 24,
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    borderRadius: 12,
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Total Rows
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#667eea",
                      }}
                    >
                      {tableData.length}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Total Columns
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#764ba2",
                      }}
                    >
                      {columns.length}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Status
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "#22c55e",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Loaded
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && doc && !tableData && (
              <div style={{ overflow: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                      }}
                    >
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: 13,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          width: "30%",
                        }}
                      >
                        📋 Field
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: 13,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        📝 Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(doc).map(([key, value], index) => (
                      <tr
                        key={key}
                        style={{
                          background:
                            index % 2 === 0
                              ? "transparent"
                              : "rgba(102, 126, 234, 0.03)",
                          borderBottom: "1px solid var(--border-color)",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(102, 126, 234, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            index % 2 === 0
                              ? "transparent"
                              : "rgba(102, 126, 234, 0.03)";
                        }}
                      >
                        <td
                          style={{
                            padding: "16px 20px",
                            color: "#667eea",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            verticalAlign: "top",
                          }}
                        >
                          {key.replace(/_/g, " ")}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            color: "var(--text-primary)",
                            verticalAlign: "top",
                          }}
                        >
                          {typeof value === "string" &&
                            value.length > 200 ? (
                            <div
                              style={{
                                maxHeight: 300,
                                overflow: "auto",
                                padding: 12,
                                background: "var(--bg-tertiary)",
                                borderRadius: 8,
                                border:
                                  "1px solid var(--border-color)",
                                lineHeight: 1.6,
                                fontSize: 13,
                                fontFamily:
                                  '"Monaco", "Courier New", monospace',
                                color: "var(--text-primary)",
                              }}
                            >
                              {value}
                            </div>
                          ) : typeof value === "object" &&
                            value !== null ? (
                            <div
                              style={{
                                maxHeight: 300,
                                overflow: "auto",
                                padding: 12,
                                background: "var(--bg-tertiary)",
                                borderRadius: 8,
                                border:
                                  "1px solid var(--border-color)",
                                lineHeight: 1.6,
                                fontSize: 12,
                                fontFamily:
                                  '"Monaco", "Courier New", monospace',
                                color: "var(--text-primary)",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {JSON.stringify(value, null, 2)}
                            </div>
                          ) : (
                            <span style={{ wordBreak: "break-word" }}>
                              {renderValue(value)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !doc && !error && (
              <div
                style={{
                  padding: 64,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  No data available
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  This document doesn't contain any extractable information yet.
                </div>
              </div>
            )}
          </div>

          <footer className="page-footer">
            © FinRight — Expense Management Platform
          </footer>
        </div>
      </main>
    </div>
  );
}
