import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import UserMenu from "./UserMenu";
import "../styles/global.css";

export default function PersistentLayout({ children }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function openUpload() { navigate("/upload"); }
  function openFiles() { navigate("/files"); }
  function openChatBot() { navigate("/insights"); }
  function openDashboard() { navigate("/dashboard"); }

  function backToTop() {
    const el = document.querySelector("main");
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ display: "flex" }}>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
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

        <h3>Finright</h3>

        <button className={`btn`} onClick={openDashboard}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Dashboard Overview</span>
        </button>

        <button className="btn" onClick={openUpload}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload Expense</span>
        </button>

        <button className="btn" onClick={openFiles}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <span>Uploaded Files</span>
        </button>

        <button className="btn" onClick={openChatBot}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>ChatBot</span>
        </button>

        <div style={{ marginTop: "auto", fontSize: 12, color: "var(--text-tertiary)" }}>Sidebar (UI-only)</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button 
            onClick={backToTop} 
            style={{ 
              padding: "8px 10px", 
              borderRadius: 8, 
              border: "none", 
              cursor: "pointer", 
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              transition: "all 0.2s"
            }}
          >
            Back to Top
          </button>
          <UserMenu />
        </div>
      </aside>

      <main className={`main-with-sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}>
        {children}
      </main>
    </div>
  );
}
