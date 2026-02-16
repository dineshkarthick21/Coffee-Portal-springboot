  import React, { useState } from "react";
import api from "../api/apiClient";
  import { Link } from "react-router-dom";
  import './auth.css';
  
  const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setMessage("");
  
      try {
        const res = await api.post("/auth/forgot-password", { email });
        setMessage(res.data?.message || "Reset link sent to your email. Please check your inbox.");
        setEmail("");
      } catch (err) {
        setError(err.response?.data?.message || "Email not found or server error.");
      } finally {
        setLoading(false);
      }
    };
  
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
              <h2>Forgot Password?</h2>
              <p>No worries, we'll send you reset instructions</p>
            </div>
  
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
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
                {loading ? "Sending..." : "Send Reset Link"}
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
  
export default ForgotPassword;
