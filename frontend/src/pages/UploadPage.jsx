// frontend/src/pages/UploadPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import UserMenu from "../components/UserMenu";
import { documentService } from "../services/documentService";

export default function UploadPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // ---- Sidebar state (same pattern as dashboard) ----
  const [tab, setTab] = useState("upload"); // Upload active on this page
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

  // ---- Existing upload logic (uses real API now) ----
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    return () => {
      try {
        files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      } catch (e) {
        // ignore
      }
    };
  }, [files]);

  function addFiles(list) {
    const arr = Array.from(list).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      addedAt: new Date().toISOString(),
      preview: URL.createObjectURL(f),
      uploaded: false,
      fileObj: f, // Store the actual file object for upload
    }));
    setFiles((s) => [...arr, ...s]);
  }

  function handleFileInput(e) {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    // Validate each file
    selectedFiles.forEach(file => {
      // Check file type
      const validTypes = ['.csv', '.pdf', '.xlsx', '.xls'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();

      if (!validTypes.includes(fileExt)) {
        errors.push(`${file.name}: Invalid file type. Only CSV, PDF, and Excel files are allowed.`);
        return;
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit.`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      setUploadError(errors.join(' '));
    } else {
      setUploadError(null);
    }

    // Add valid files
    if (validFiles.length > 0) {
      addFiles(validFiles);
    }

    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length)
      addFiles(e.dataTransfer.files);
  }

  function simulateUpload() {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    // Upload each file
    const uploadPromises = files
      .filter((f) => !f.uploaded)
      .map((file) => {
        const formData = new FormData();
        // Append the actual file object
        const fileObj = file.fileObj || new File([], file.name);
        formData.append('file', fileObj);

        return documentService
          .uploadDocument(formData)
          .then((response) => {
            setProgress((prev) => Math.min(prev + 50 / Math.max(files.length, 1), 95));
            return { success: true, data: response, fileId: file.id };
          })
          .catch((error) => {
            return { success: false, error, fileId: file.id };
          });
      });

    Promise.all(uploadPromises)
      .then((results) => {
        const allSuccess = results.every((r) => r.success);
        if (allSuccess) {
          setProgress(100);
          setUploadSuccess('All files uploaded successfully!');
          setFiles((s) => s.map((f) => ({ ...f, uploaded: true })));
          setTimeout(() => {
            setFiles([]);
            setUploadSuccess(null);
            setProgress(0);
          }, 2000);
        } else {
          const failedCount = results.filter((r) => !r.success).length;
          setUploadError(`${failedCount} file(s) failed to upload. Please try again.`);
        }
        setUploading(false);
      })
      .catch((error) => {
        setUploadError('Upload failed. Please try again.');
        setUploading(false);
      });
  }

  function removeFile(id) {
    setFiles((s) => s.filter((f) => f.id !== id));
  }

  function clearFiles() {
    setFiles([]);
  }

  return (
    <div style={{ display: "flex" }}>
      {/* ---- STATIC SIDEBAR (same style as Dashboard) ---- */}
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

        <button className="btn" onClick={() => navigate("/financial-health")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span>FinRight Score</span>
        </button>

        <button className="btn" onClick={() => navigate("/wallet")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <span>Wallet</span>
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

      {/* ---- MAIN AREA WITH UPLOAD UI ---- */}
      <main
        ref={mainRef}
        className={`main-with-sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}
        style={{ overflowY: "auto", height: "100vh" }}
      >
        <div className="container">
          {/* Top row: back + login (similar to dashboard top bar) */}
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

          {/* Upload card (your original content, just wrapped nicely) */}
          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              background: "var(--bg-primary)",
              borderRadius: 16,
              padding: 40,
              boxShadow: "0 12px 40px rgba(17,24,39,0.08)",
              border: "1px solid var(--border-color)",
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                color: "var(--text-primary)",
                fontWeight: 700,
              }}
            >
              Upload Expense
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: 8,
              }}
            >
              Upload CSV/PDF bank statements here to analyze your expenses.
            </p>

            <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
              <div style={{ flex: 1 }}>
                {uploadError && (
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
                    ❌ {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#22c55e",
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                      fontSize: 14,
                    }}
                  >
                    ✓ {uploadSuccess}
                  </div>
                )}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  style={{
                    border: "2px dashed var(--border-color)",
                    padding: 18,
                    borderRadius: 12,
                    background: "var(--bg-tertiary)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Drag & drop files here or choose files
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <label
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border-color)",
                        cursor: "pointer",
                        background: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        hidden
                        multiple
                        onChange={handleFileInput}
                      />
                      Choose files
                    </label>

                    <button
                      onClick={() =>
                        fileRef.current && fileRef.current.click()
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#111827",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Browse
                    </button>

                    <button
                      onClick={simulateUpload}
                      disabled={uploading || files.length === 0}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: uploading || files.length === 0 ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "#fff",
                        border: "none",
                        cursor:
                          uploading || files.length === 0
                            ? "not-allowed"
                            : "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        opacity:
                          uploading || files.length === 0 ? 0.6 : 1,
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>

                  {uploading && (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Uploading: {progress}%
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          height: 8,
                          background: "var(--bg-tertiary)",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            height: "100%",
                            background: "#2563eb",
                            borderRadius: 999,
                            transition: "width 0.2s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    color: "var(--text-secondary)",
                    fontSize: 13,
                  }}
                >
                  Supported formats: CSV, PDF, Excel (.xlsx, .xls)
                </div>
              </div>

              <div style={{ width: 420 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                  }}
                >
                  Files to upload ({files.length})
                </div>
                <div
                  style={{
                    maxHeight: 320,
                    overflow: "auto",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: 8,
                    background: "var(--bg-tertiary)",
                  }}
                >
                  <table style={{ width: "100%", fontSize: 13 }}>
                    <tbody>
                      {files.length === 0 && (
                        <tr>
                          <td
                            style={{
                              color: "var(--text-tertiary)",
                              padding: 10,
                            }}
                          >
                            No files yet
                          </td>
                        </tr>
                      )}

                      {files.map((f) => (
                        <tr
                          key={f.id}
                          style={{
                            borderTop: "1px solid var(--border-color)",
                          }}
                        >
                          <td
                            style={{
                              padding: 10,
                              color: "var(--text-primary)",
                            }}
                          >
                            {f.name}
                          </td>
                          <td
                            style={{
                              padding: 10,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {f.size
                              ? `${Math.round(f.size / 1024)} KB`
                              : "-"}
                          </td>
                          <td style={{ padding: 10 }}>
                            <button
                              onClick={() => removeFile(f.id)}
                              style={{
                                padding: "6px 8px",
                                borderRadius: 6,
                                border:
                                  "1px solid var(--border-color)",
                                background: "var(--bg-primary)",
                                cursor: "pointer",
                                color: "var(--text-primary)",
                                fontSize: 12,
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: 13,
                    }}
                  >
                    {files.length} file(s) ready
                  </div>
                  <div>
                    <button
                      onClick={clearFiles}
                      style={{
                        padding: "6px 8px",
                        borderRadius: 6,
                        border:
                          "1px solid var(--border-color)",
                        background: "var(--bg-primary)",
                        marginRight: 8,
                        cursor: "pointer",
                        color: "var(--text-primary)",
                        fontSize: 12,
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="page-footer">
            © FinRight
          </footer>
        </div>
      </main>
    </div>
  );
}
