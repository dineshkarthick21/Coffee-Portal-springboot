import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "../customer.css";

const CustomerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0
  });

  // Load user profile and stats
  const loadProfile = async () => {
    try {
      // Try to load user orders for stats
      try {
        const ordersRes = await api.get(`/customer/orders/${user.id}`);
        const orders = ordersRes.data;

        // Calculate stats
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

        setStats({
          totalOrders,
          totalSpent
        });
      } catch (orderErr) {
        console.log("Orders endpoint not available, using default stats");
        setStats({
          totalOrders: 0,
          totalSpent: 0
        });
      }

      // Try to load user profile from backend
      try {
        const profileRes = await api.get(`/customer/profile/${user.id}`);
        setProfile(profileRes.data);
      } catch (profileErr) {
        console.log("Profile endpoint not available, using auth user data");
        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || ""
        });
      }

    } catch (err) {
      console.error("Profile load error:", err);
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      // Try to update profile in backend
      try {
        await api.put(`/customer/profile/${user.id}`, profile);
        setMessage("✅ Profile updated successfully!");
      } catch (updateErr) {
        console.log("Profile update endpoint not available, updating local state only");
        setMessage("✅ Profile updated locally (backend not available)");
      }
      
      setIsEditing(false);
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage("❌ Error updating profile: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setIsEditing(false);
    setMessage("");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <DashboardLayout title="My Profile">
      {/* Message Alert */}
      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
          <span>{message}</span>
        </div>
      )}

      {/* Header with Edit Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.8rem',
          color: '#d4a574',
          margin: 0
        }}>
          Profile Information
        </h3>
        {!isEditing && (
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.15), rgba(160, 130, 109, 0.1))',
          border: '2px solid rgba(160, 130, 109, 0.3)',
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#d4a574', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
            {stats.totalOrders}
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '0.95rem' }}>
            Total Orders
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#4ade80', fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
            ₹{stats.totalSpent.toFixed(2)}
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '0.95rem' }}>
            Total Spent
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '15px',
        padding: '2rem',
        border: '1px solid rgba(160, 130, 109, 0.2)'
      }}>
        <h4 style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.5rem',
          color: '#d4a574',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(160, 130, 109, 0.2)'
        }}>
          Personal Information
        </h4>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                className="form-input"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            ) : (
              <div style={{
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(160, 130, 109, 0.2)',
                color: '#fff'
              }}>
                {profile.name || "Not provided"}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(160, 130, 109, 0.2)',
              color: '#fff',
              opacity: 0.7
            }}>
              {profile.email}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', margin: '0.5rem 0 0 0' }}>
              Email cannot be changed
            </p>
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={profile.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            ) : (
              <div style={{
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(160, 130, 109, 0.2)',
                color: '#fff'
              }}>
                {profile.phone || "Not provided"}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end',
              marginTop: '1rem'
            }}>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "⏳ Saving..." : "💾 Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '15px',
        padding: '2rem',
        border: '1px solid rgba(160, 130, 109, 0.2)',
        marginTop: '2rem'
      }}>
        <h4 style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.5rem',
          color: '#d4a574',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(160, 130, 109, 0.2)'
        }}>
          Account Information
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">User ID</label>
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(160, 130, 109, 0.2)',
              color: '#fff',
              opacity: 0.7,
              fontFamily: 'monospace'
            }}>
              {user.id || "N/A"}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">User Role</label>
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(160, 130, 109, 0.2)',
              color: '#fff',
              opacity: 0.7
            }}>
              {user.role || "Customer"}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
