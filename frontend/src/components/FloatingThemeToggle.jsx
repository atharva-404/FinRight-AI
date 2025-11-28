import React from "react";
import { useTheme } from "../ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function FloatingThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        zIndex: 999,
      }}
      onMouseOver={(e) => {
        e.target.style.transform = "scale(1.07)";
        e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
      }}
      onMouseOut={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
      }}
    >
      {isDark ? (
        <SunIcon style={{ width: 22, height: 22, color: "var(--text-primary)" }} />
      ) : (
        <MoonIcon style={{ width: 22, height: 22, color: "var(--text-primary)" }} />
      )}
    </button>
  );
}
