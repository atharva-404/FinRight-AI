import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          cursor: "pointer",
          color: "var(--text-primary)",
          fontSize: 14,
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.background = "var(--bg-secondary)";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "var(--bg-tertiary)";
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {user.username ? user.username[0].toUpperCase() : "U"}
        </div>
        <span>{user.username || user.email}</span>
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 200,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid var(--border-color)",
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            Signed in as <strong>{user.email}</strong>
          </div>

          <button
            onClick={() => {
              navigate("/profile");
              setShowMenu(false);
            }}
            style={{
              width: "100%",
              padding: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontSize: 14,
              textAlign: "left",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "var(--bg-tertiary)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "none";
            }}
          >
            👤 Profile
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#dc2626",
              fontSize: 14,
              textAlign: "left",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "var(--bg-tertiary)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "none";
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
