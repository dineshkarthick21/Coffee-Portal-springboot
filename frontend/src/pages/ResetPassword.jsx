import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/apiClient";
import './auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [valid, setValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setValid(false);
      return;
    }
    api.get(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then(() => setValid(true))
      .catch(() => setValid(false));
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset link expired or invalid");
      setLoading(false);
    }
  };

  if (valid === false) {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-overlay"></div>
        </div>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <span className="logo-icon">☕</span>
                <span>JavaBite</span>
              </Link>
              <h2>Invalid Reset Link</h2>
              <p>This reset link is invalid or has expired</p>
            </div>
            <div className="auth-footer">
              <Link to="/forgot-password" className="auth-link-primary">
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (valid === null) {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-overlay"></div>
        </div>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <p>Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">☕</span>
              <span>JavaBite</span>
            </Link>
            <h2>Reset Your Password</h2>
            <p>Create a new password for your account</p>
          </div>

          <form onSubmit={handleReset} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="form-input"
                minLength="6"
              />
            </div>

            {message && (
              <div className="success-message">
                <span>✓</span> {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
