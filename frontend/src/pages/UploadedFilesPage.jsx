// src/pages/UploadedFilesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import "../styles/global.css";

/*
  UploadedFilesPage: shows a full-page table of uploaded files.
  Columns: File name, Date of upload, Size
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

export default function UploadedFilesPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [files, setFiles] = useState(loadFromStorage());

  useEffect(() => {
    // sync with storage in case other components update it
    const onStorage = () => setFiles(loadFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function formatSize(n) {
    if (!n && n !== 0) return "-";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${Math.round(n / (1024 * 1024))} MB`;
  }

  function deleteFile(id) {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    saveToStorage(updatedFiles);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", padding: 28 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", background: "var(--bg-primary)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)" }}>
        {/* header area (dashboard link removed) */}

        <h2 style={{ marginTop: 0, color: "var(--text-primary)" }}>Uploaded Files</h2>
        <p style={{ color: "var(--text-secondary)" }}>Files uploaded (demo local storage). Columns: File name, Date of upload, Size.</p>

        <div style={{ overflow: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ textAlign: "left", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)" }}>
              <tr>
                <th style={{ padding: 12, color: "var(--text-primary)" }}>File name</th>
                <th style={{ padding: 12, color: "var(--text-primary)" }}>Date of upload</th>
                <th style={{ padding: 12, color: "var(--text-primary)" }}>Size</th>
                <th style={{ padding: 12, color: "var(--text-primary)" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {files.length === 0 && (
                <tr><td colSpan="4" style={{ padding: 12, color: "var(--text-tertiary)" }}>No files uploaded yet.</td></tr>
              )}

              {files.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: 12, color: "var(--text-primary)" }}>{f.name}</td>
                  <td style={{ padding: 12, color: "var(--text-secondary)" }}>{f.addedAt ? new Date(f.addedAt).toLocaleString() : "-"}</td>
                  <td style={{ padding: 12, color: "var(--text-secondary)" }}>{formatSize(f.size)}</td>
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
                        height: "36px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(200, 0, 0, 0.1)";
                        e.target.style.borderColor = "#fcc";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.borderColor = "transparent";
                      }}
                      title="Delete file"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </div>
  );
}
