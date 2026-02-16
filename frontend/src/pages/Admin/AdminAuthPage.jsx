import React, { useState, useContext } from "react";
import api from "../../api/apiClient";
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import '../auth.css';

const AdminAuthPage = () => {
  const [activeTab, setActiveTab] = useState("signin"); // signin or signup
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up State
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "ADMIN"
  });
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError("");
    
    try {
      const res = await api.post("/auth/login", { 
        email: signInEmail, 
        password: signInPassword 
      });
      
      const { token, refreshToken, id, name, email: userEmail, role } = res.data;
      
      // Verify admin role
      if (role !== "ADMIN") {
        setSignInError("❌ Access Denied! This portal is for administrators only.");
        setSignInLoading(false);
        return;
      }
      
      console.log("Admin login successful:", { id, name, email: userEmail, role });
      
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
      
      // Update AuthContext with user data
      login(token, refreshToken, userData);

      // Navigate to admin dashboard
      navigate("/admin", { replace: true });
      
    } catch (err) {
      console.error("Login error:", err);
      setSignInError(err.response?.data?.message || "Invalid email or password");
      setSignInLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpError("");
    setSignUpSuccess(false);

    try {
      await api.post("/auth/register", {
        ...signUpForm,
        role: "ADMIN"
      });
      
      setSignUpSuccess(true);
      setSignUpForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "ADMIN"
      });
      
      // Switch to sign in tab after 2 seconds
      setTimeout(() => {
        setActiveTab("signin");
        setSignUpSuccess(false);
      }, 2000);
      
    } catch (err) {
      setSignUpError(err?.response?.data?.message || "Registration failed");
    } finally {
      setSignUpLoading(false);
    }
  };

  // Handle Sign Up Form Changes
  const handleSignUpChange = (e) => {
    setSignUpForm({
      ...signUpForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">☕</span>
              <span>JavaBite</span>
            </Link>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #d4a574 0%, #8b4513 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Admin Portal
            </h2>
            <p style={{ color: '#a0826d', fontSize: '0.95rem' }}>
              Administrative Access Only
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            borderRadius: '12px',
            background: 'rgba(212, 165, 116, 0.1)',
            padding: '0.5rem'
          }}>
            <button
              onClick={() => setActiveTab("signin")}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === "signin" 
                  ? 'linear-gradient(135deg, #d4a574 0%, #8b4513 100%)'
                  : 'transparent',
                color: activeTab === "signin" ? '#0f0f0f' : '#a0826d',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === "signup" 
                  ? 'linear-gradient(135deg, #d4a574 0%, #8b4513 100%)'
                  : 'transparent',
                color: activeTab === "signup" ? '#0f0f0f' : '#a0826d',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="auth-form">
              {signInError && (
                <div className="form-error" style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#ff6b6b',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {signInError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="signin-email">Admin Email</label>
                <input
                  id="signin-email"
                  type="email"
                  placeholder="admin@javabite.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signin-password">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="form-input"
                  autoComplete="current-password"
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={signInLoading}
              >
                {signInLoading ? "Signing In..." : "Sign In as Admin"}
              </button>

              <div style={{ 
                marginTop: '1.5rem', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    color: '#d4a574',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#8b4513'}
                  onMouseLeave={(e) => e.target.style.color = '#d4a574'}
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="auth-form">
              {signUpSuccess && (
                <div className="form-success" style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  ✅ Admin account created successfully! Redirecting to sign in...
                </div>
              )}

              {signUpError && (
                <div className="form-error" style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#ff6b6b',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {signUpError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signUpForm.name}
                  onChange={handleSignUpChange}
                  required
                  className="form-input"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Admin Email</label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="admin@javabite.com"
                  value={signUpForm.email}
                  onChange={handleSignUpChange}
                  required
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-phone">Phone Number</label>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={signUpForm.phone}
                  onChange={handleSignUpChange}
                  required
                  className="form-input"
                  autoComplete="tel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={signUpForm.password}
                  onChange={handleSignUpChange}
                  required
                  minLength="6"
                  className="form-input"
                  autoComplete="new-password"
                />
              </div>

              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(212, 165, 116, 0.1)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#a0826d'
              }}>
                <strong>Note:</strong> You are creating an ADMIN account with full system access.
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={signUpLoading}
              >
                {signUpLoading ? "Creating Account..." : "Create Admin Account"}
              </button>
            </form>
          )}

          {/* Back to Main Site */}
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(212, 165, 116, 0.2)'
          }}>
            <Link 
              to="/" 
              style={{ 
                color: '#a0826d',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#d4a574'}
              onMouseLeave={(e) => e.target.style.color = '#a0826d'}
            >
              ← Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
