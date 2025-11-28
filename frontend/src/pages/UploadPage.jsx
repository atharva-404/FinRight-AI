// frontend/src/pages/UploadPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";

/*
  UploadPage:
  - Full-screen page
  - A centered card/container with minimal margin
  - Contains the upload box (drag/drop, choose, browse, simulate) and file list
  - Frontend-only (localStorage)
*/

const STORAGE_KEY = "finright_uploaded_files_v3";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [files, setFiles] = useState(loadFromStorage());
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);
  const uploadIntervalRef = useRef(null);

  useEffect(() => {
    saveToStorage(files);
    return () => {
      try {
        files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      } catch (e) {
        // ignore
      }
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
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
    }));
    setFiles((s) => [...arr, ...s]);
  }

  function handleFileInput(e) {
    if (!e.target.files) return;
    addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function simulateUpload() {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    let cur = 0;
    const id = setInterval(() => {
      cur += 8 + Math.floor(Math.random() * 12);
      setProgress(Math.min(cur, 100));
      if (cur >= 100) {
        clearInterval(id);
        uploadIntervalRef.current = null;
        setUploading(false);
        setProgress(0);
        setFiles((s) => s.map((f) => ({ ...f, uploaded: true })));
      }
    }, 140);
    uploadIntervalRef.current = id;
  }

  function removeFile(id) {
    setFiles((s) => s.filter((f) => f.id !== id));
  }

  function clearFiles() {
    setFiles([]);
  }

  const demoFilePath = "/mnt/data/d4576c80-0809-4920-b691-6e6fa02485c2.png";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        transition: "background-color 0.3s ease",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 70,
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          title="Go to dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 14px",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          ← Dashboard
        </button>

        <button
          onClick={() => navigate("/login")}
          title="Login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            color: "white",
            boxShadow: "0 4px 12px rgba(102,126,234,0.35)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Login</span>
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflow: "auto" }}>
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
          <h2 style={{ margin: 0, fontSize: 28, color: "var(--text-primary)", fontWeight: 700 }}>Upload Expense</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Upload CSV/PDF bank statements here to analyze your expenses. (Demo mode: files kept locally.)</p>

          <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
            <div style={{ flex: 1 }}>
              <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} style={{ border: "2px dashed var(--border-color)", padding: 18, borderRadius: 12, background: "var(--bg-tertiary)" }}>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>Drag & drop files here or choose files</p>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <label style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", cursor: "pointer", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 14, fontWeight: 500 }}>
                    <input ref={fileRef} type="file" hidden multiple onChange={handleFileInput} />
                    Choose files
                  </label>

                  <button onClick={() => fileRef.current && fileRef.current.click()} style={{ padding: "8px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                    Browse
                  </button>

                  <button onClick={simulateUpload} disabled={uploading || files.length === 0} style={{ padding: "8px 12px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", cursor: uploading || files.length === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500, opacity: uploading || files.length === 0 ? 0.6 : 1 }}>
                    Simulate Upload
                  </button>
                </div>

                {uploading && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Uploading: {progress}%</div>
                    <div style={{ marginTop: 6, height: 8, background: "var(--bg-tertiary)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "#2563eb", borderRadius: 999, transition: "width 0.2s ease" }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: 13 }}>
                Demo preview file path (dev-only): <code style={{ color: "var(--text-primary)" }}>{demoFilePath}</code>
              </div>
            </div>

            <div style={{ width: 420 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Files (local)</div>
              <div style={{ maxHeight: 320, overflow: "auto", border: "1px solid var(--border-color)", borderRadius: 8, padding: 8, background: "var(--bg-tertiary)" }}>
                <table style={{ width: "100%", fontSize: 13 }}>
                  <tbody>
                    {files.length === 0 && (
                      <tr>
                        <td style={{ color: "var(--text-tertiary)", padding: 10 }}>No files yet</td>
                      </tr>
                    )}

                    {files.map((f) => (
                      <tr key={f.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                        <td style={{ padding: 10, color: "var(--text-primary)" }}>{f.name}</td>
                        <td style={{ padding: 10, color: "var(--text-secondary)" }}>{f.size ? `${Math.round(f.size / 1024)} KB` : "-"}</td>
                        <td style={{ padding: 10 }}>
                          <button onClick={() => removeFile(f.id)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--bg-primary)", cursor: "pointer", color: "var(--text-primary)", fontSize: 12 }}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{files.length} files (local)</div>
                <div>
                  <button onClick={clearFiles} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--bg-primary)", marginRight: 8, cursor: "pointer", color: "var(--text-primary)", fontSize: 12 }}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}