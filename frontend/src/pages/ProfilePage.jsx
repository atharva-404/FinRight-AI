import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import PersistentLayout from "../components/PersistentLayout";
import "../styles/global.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    income: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        income: user.income || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setErrors({});

    try {
      await updateProfile(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrors({
        submit: err.detail || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PersistentLayout>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-secondary)",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 600,
            background: "var(--bg-primary)",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 12px 40px rgba(17,24,39,0.08)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h1 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700 }}>
            My Profile
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 24px 0" }}>
            Update your profile information
          </p>

          {success && (
            <div
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#22c55e",
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Profile updated successfully!
            </div>
          )}

          {errors.submit && (
            <div
              style={{
                background: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                color: "#dc2626",
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
              {errors.first_name && (
                <small style={{ color: "#dc2626" }}>{errors.first_name}</small>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
              {errors.last_name && (
                <small style={{ color: "#dc2626" }}>{errors.last_name}</small>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Annual Income
              </label>
              <input
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
                placeholder="75000.00"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
              {errors.income && (
                <small style={{ color: "#dc2626" }}>{errors.income}</small>
              )}
            </div>

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
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </PersistentLayout>
  );
}
