// frontend/src/pages/Splash.jsx
import React from "react";

export default function Splash() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: "100vh"
    }}>
      <div className="splash-card" style={{
        textAlign: "center",
        maxWidth: 480,
        padding: "60px 40px"
      }}>
        {/* Logo/Icon */}
        <div style={{
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
        }}>
          <span style={{ fontSize: 40, color: "#fff" }}>💰</span>
        </div>

        <div className="splash-title" style={{ fontSize: 42, fontWeight: 800 }}>FinRight</div>
        <div style={{
          marginTop: 12,
          color: "#64748b",
          fontSize: 16,
          lineHeight: 1.5
        }}>
          Your intelligent financial assistant. Upload, analyze, and get AI-powered insights in seconds.
        </div>

        {/* Animated Loading Bar */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            width: "100%",
            height: 4,
            background: "#e2e8f0",
            borderRadius: 999,
            margin: "0 auto",
            overflow: "hidden"
          }}>
            <div style={{
              width: "60%",
              height: "100%",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 999,
              animation: "splashBar 1.8s ease-in-out infinite"
            }} />
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: "#94a3b8" }}>
            Setting up your financial dashboard...
          </div>
        </div>

        {/* Feature hints */}
        <div style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12
        }}>
          <div style={{
            padding: 12,
            background: "rgba(102, 126, 234, 0.08)",
            borderRadius: 8,
            fontSize: 12,
            color: "#475569"
          }}>
            📊 Smart Analysis
          </div>
          <div style={{
            padding: 12,
            background: "rgba(102, 126, 234, 0.08)",
            borderRadius: 8,
            fontSize: 12,
            color: "#475569"
          }}>
            🤖 AI Insights
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splashBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(400%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
