import React, { useState, useContext } from "react";
import api from "../api/apiClient";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import './auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, refreshToken, id, name, email: userEmail, role } = res.data;
      
      console.log("Login successful:", { id, name, email: userEmail, role });
      
      // Create user data object
      const userData = {
        id,
        name,
        email: userEmail,
        role
      };
      
      // Store in localStorage first
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Then update AuthContext with user data
      login(token, refreshToken, userData);

      // Navigate based on role
      if (!role) {
        setError("Unable to detect user role. Please contact admin.");
        setLoading(false);
        return;
      }

      console.log("Navigating to dashboard for role:", role);
      
      switch (role.toUpperCase()) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;
        case "CUSTOMER":
          navigate("/customer", { replace: true });
          break;
        case "CHEF":
          navigate("/chef", { replace: true });
          break;
        case "WAITER":
          navigate("/waiter", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid email or password");
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
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
            <div className="auth-divider">
              <span>Don't have an account?</span>
            </div>
            <Link to="/register" className="auth-link-primary">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;