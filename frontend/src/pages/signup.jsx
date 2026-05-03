import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const { register, loading: authLoading, error: authError } = useAuth();
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.username.trim()) err.username = "Enter a username";
    if (!form.name.trim()) err.name = "Enter your full name";
    if (!form.email.trim()) err.email = "Enter your email";
    else if (!/^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(form.email))
      err.email = "Enter a valid email";
    if (!form.password) err.password = "Choose a password";
    else if (form.password.length < 6)
      err.password = "Password must be 6+ characters";
    if (form.password !== form.password_confirm)
      err.password_confirm = "Passwords do not match";
    return err;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register(
        form.username,
        form.email,
        form.password,
        form.password_confirm
      );
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const errorMsg = authError || error.detail || "Registration failed";
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className={`card ${success ? "card-success" : ""}`}>
        <header className="card-header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">FR</div>
            <div>
              <h1 className="brand-title">FinRight</h1>
              <p className="brand-sub">Financial Intelligence at your fingertips</p>
            </div>
          </div>
          <div className="decor-swoosh" aria-hidden="true" />
        </header>

        <main className="card-body">
          <h2 className="title">Create an account</h2>
          <p className="subtitle">Start using FinRight — secure, fast, and smart.</p>

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

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="label-text">Username</span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="john_doe"
                className={`input ${errors.username ? "input-error" : ""}`}
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "err-username" : undefined}
              />
              {errors.username && (
                <small id="err-username" className="error">
                  {errors.username}
                </small>
              )}
            </label>

            <label className="field">
              <span className="label-text">Full name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Aman Verma"
                className={`input ${errors.name ? "input-error" : ""}`}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "err-name" : undefined}
              />
              {errors.name && (
                <small id="err-name" className="error">
                  {errors.name}
                </small>
              )}
            </label>

            <label className="field">
              <span className="label-text">Email</span>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                type="email"
                className={`input ${errors.email ? "input-error" : ""}`}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "err-email" : undefined}
              />
              {errors.email && (
                <small id="err-email" className="error">
                  {errors.email}
                </small>
              )}
            </label>

            <label className="field">
              <span className="label-text">Password</span>
              <div className="password-row">
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Choose a secure password"
                  type={showPassword ? "text" : "password"}
                  className={`input ${errors.password ? "input-error" : ""}`}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "err-pass" : undefined}
                />
                <button
                  type="button"
                  className="show-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <small id="err-pass" className="error">
                  {errors.password}
                </small>
              )}
            </label>

            <label className="field">
              <span className="label-text">Confirm Password</span>
              <input
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                placeholder="Confirm your password"
                type={showPassword ? "text" : "password"}
                className={`input ${errors.password_confirm ? "input-error" : ""}`}
                aria-invalid={errors.password_confirm ? "true" : "false"}
                aria-describedby={
                  errors.password_confirm ? "err-pass-confirm" : undefined
                }
              />
              {errors.password_confirm && (
                <small id="err-pass-confirm" className="error">
                  {errors.password_confirm}
                </small>
              )}
            </label>

            <button className="cta" type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner" aria-hidden="true"></span> : null}
              {isLoading ? "Creating..." : success ? "Created" : "Create account"}
            </button>
          </form>

          <div className="alt">
            Already have an account?{" "}
            <button className="link-btn" onClick={() => navigate("/login")}>Log in</button>
          </div>
        </main>

        <footer className="card-footer">
          <small className="muted">By creating an account you agree to our Terms & Privacy.</small>
        </footer>

        {/* success check animation */}
        {success && (
          <div className="success-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="check">
              <path d="M20 6L9 17l-5-5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
