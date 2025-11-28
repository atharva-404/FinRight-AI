import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import "../styles/global.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { login, loading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.detail || authError || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-secondary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      transition: "background-color 0.3s ease"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "var(--bg-primary)",
        borderRadius: 16,
        padding: 40,
        boxShadow: "0 12px 40px rgba(17,24,39,0.08)",
        border: "1px solid var(--border-color)",
        transition: "all 0.3s ease"
      }}>
        {/* Logo/Brand */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Finright
          </h1>
          <p style={{
            fontSize: 14,
            color: "var(--text-tertiary)",
            margin: "8px 0 0 0"
          }}>
            Financial Intelligence at Your Fingertips
          </p>
        </div>

        {/* Form Title */}
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 8px 0"
        }}>
          Welcome Back
        </h2>
        <p style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          margin: "0 0 24px 0"
        }}>
          Sign in to your account to continue
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            color: "#dc2626",
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: 12,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: isLoading ? 0.8 : 1,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {/* Forgot Password Link */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13,
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.color = "#764ba2";
                e.target.style.textDecoration = "underline";
              }}
              onMouseOut={(e) => {
                e.target.style.color = "#667eea";
                e.target.style.textDecoration = "none";
              }}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          margin: "24px 0",
          gap: 12
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-color)" }}></div>
          <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border-color)" }}></div>
        </div>

        {/* Signup Link */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            margin: 0
          }}>
            Don't have an account?{" "}
              <button
                onClick={handleSignup}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.color = "#764ba2";
                  e.target.style.textDecoration = "underline";
                }}
                onMouseOut={(e) => {
                  e.target.style.color = "#667eea";
                  e.target.style.textDecoration = "none";
                }}
              >
                Sign Up
              </button>
          </p>
        </div>

        {/* Demo Info */}
        <div style={{
          marginTop: 24,
          padding: 12,
          background: "var(--bg-tertiary)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--text-tertiary)",
          textAlign: "center",
          border: "1px solid var(--border-color)"
        }}>
          Backend API: {process.env.REACT_APP_API_URL}
        </div>
      </div>
    </div>
  );
}
