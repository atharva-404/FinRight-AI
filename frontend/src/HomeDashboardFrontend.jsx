// frontend/src/HomeDashboardFrontend.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import UserMenu from "./components/UserMenu";
import "./styles/global.css";

export default function HomeDashboardFrontend() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainRef = useRef(null);

  function openOverview() {
    setTab("overview");
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openUpload() { navigate("/upload"); }
  function openFiles() { navigate("/files"); }
  function openChatBot() { navigate("/insights"); } // renamed to ChatBot

  function backToTop() {
    if (!mainRef.current) return;
    document.documentElement.classList.add("back-to-top-clicked");
    setTimeout(() => document.documentElement.classList.remove("back-to-top-clicked"), 650);
    mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
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

        <button className={`btn ${tab === "overview" ? "active" : ""}`} onClick={openOverview}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4h12" />
            <path d="M6 8h12" />
            <path d="M9 12c4 0 7 3 7 7" />
            <path d="M9 12h7" />
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
              transition: "all 0.2s"
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

      <main ref={mainRef} className={`main-with-sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <div className="container">
          {/* Back Button and Login */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="page-back-button">
              <button 
                onClick={() => navigate("/")} 
                className="back-link-btn"
                title="Go to home"
              >
                ← Home
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

          <div className="section">
            <h2>Dashboard Overview</h2>
            <p style={{ color: "var(--text-secondary)" }}>Finright summarizes your transactions and answers your finance questions using AI.</p>

            <div style={{ marginTop: 12 }} className="feature-grid">
              <div className="section" style={{ background: "var(--bg-tertiary)" }}>
                <h4 style={{ marginTop: 0 }}>Upload</h4>
                <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>Add CSV/PDF statements on the Upload page.</p>
              </div>
              <div className="section" style={{ background: "var(--bg-tertiary)" }}>
                <h4 style={{ marginTop: 0 }}>Analyze</h4>
                <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>AI extracts categories and trends.</p>
              </div>
              <div className="section" style={{ background: "var(--bg-tertiary)" }}>
                <h4 style={{ marginTop: 0 }}>Ask</h4>
                <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>Get direct suggestions in the Insights page.</p>
              </div>
            </div>
          </div>

          {/* Make overview longer: several long-section blocks create 2-3 screens */}
          <div className="long-section">
            <div>
              <h3>Monthly Spending Snapshot</h3>
              <p style={{ color: "var(--text-secondary)" }}>Quickly see a high-level summary of spending categories and month-to-date totals. (Replace this demo content with charts or tables.)</p>
            </div>
          </div>

          <div className="long-section">
            <div>
              <h3>Top Categories & Trends</h3>
              <p style={{ color: "var(--text-secondary)" }}>Find major recurring expenses and track their changes month over month. (Add graphs when available.)</p>
            </div>
          </div>

          <div className="long-section">
            <div>
              <h3>Recommendations</h3>
              <p style={{ color: "var(--text-secondary)" }}>Actionable tips to reduce recurring costs and increase savings. (AI suggestions will appear in the Insights page.)</p>
            </div>
          </div>

          <footer className="page-footer">© Finright — Demo frontend only</footer>
        </div>
      </main>
    </div>
  );
}
