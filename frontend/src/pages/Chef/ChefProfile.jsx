import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAuth } from "../../auth/AuthContext";

const ChefProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [kitchenStats, setKitchenStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    preparingOrders: 0,
    completedToday: 0,
    avgPreparationTime: "0 mins"
  });

  // Load chef profile and stats
  const loadProfile = async () => {
    try {
      // Load kitchen stats from real API
      const ordersRes = await api.get("/chef/orders");
      const orders = ordersRes.data;

      // Calculate kitchen stats from real data
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      ).length;

      const preparingOrders = orders.filter(order => 
        order.status === "PREPARING"
      ).length;

      const completedToday = orders.filter(order => 
        order.status === "COMPLETED" && 
        new Date(order.createdAt).toDateString() === today
      ).length;

      // Calculate average preparation time from real data
      let totalPrepTime = 0;
      let completedCount = 0;
      
      orders.forEach(order => {
        if (order.status === "COMPLETED" && order.createdAt && order.updatedAt) {
          const created = new Date(order.createdAt);
          const updated = new Date(order.updatedAt);
          const prepTime = (updated - created) / (1000 * 60); // Convert to minutes
          if (prepTime > 0) {
            totalPrepTime += prepTime;
            completedCount++;
          }
        }
      });

      const avgPrepTime = completedCount > 0 ? Math.round(totalPrepTime / completedCount) : 0;

      setKitchenStats({
        totalOrders: orders.length, // Total orders from API
        todayOrders,
        preparingOrders,
        completedToday,
        avgPreparationTime: `${avgPrepTime} mins`
      });

      // Load chef profile
      try {
        const profileRes = await api.get(`/chef/profile/${user.id}`);
        setProfile(profileRes.data);
      } catch (profileErr) {
        console.log("Profile endpoint not available, using auth user data");
        setProfile({
          name: user.name || "Barista Name",
          email: user.email || "barista@coffeeshop.com",
          phone: user.phone || "+91 9876543210",
          specialization: user.specialization || "Head Barista"
        });
      }

    } catch (err) {
      console.error("Profile load error:", err);
      // If API fails, use minimal user data
      setProfile({
        name: user.name || "Barista Name",
        email: user.email || "barista@coffeeshop.com",
        phone: user.phone || "+91 9876543210",
        specialization: user.specialization || "Head Barista"
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
      await api.put(`/chef/profile/${user.id}`, profile);
      setMessage("✅ Profile updated successfully!");
      setIsEditing(false);
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

  // Get specialization icon for coffee theme
  const getSpecializationIcon = (specialization) => {
    const icons = {
      'Head Barista': '☕',
      'Espresso Station': '⚡',
      'Brew Station': '💧',
      'Cold Brew Station': '❄️',
      'Pastry Station': '🥐',
      'Sandwich Station': '🥪',
      'Dessert Station': '🍰',
      'General': '👨‍🍳'
    };
    return icons[specialization] || '☕';
  };

  // Coffee-themed station names
  const getStationDisplayName = (specialization) => {
    const stations = {
      'Head Barista': 'Master Barista',
      'Espresso Station': 'Espresso Artisan',
      'Brew Station': 'Brew Master',
      'Cold Brew Station': 'Cold Brew Specialist',
      'Pastry Station': 'Pastry Chef',
      'Sandwich Station': 'Sandwich Artist',
      'Dessert Station': 'Dessert Specialist',
      'General': 'All-Round Barista'
    };
    return stations[specialization] || specialization;
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <DashboardLayout title="Barista Profile">
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>☕ Barista Profile</h1>
            <p style={styles.subtitle}>Your coffee station dashboard</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={styles.editButton}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Coffee Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <h3 style={styles.statNumber}>{kitchenStats.totalOrders}</h3>
            <p style={styles.statLabel}>Total Orders</p>
            <div style={styles.statTrend}>📈 All time</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <h3 style={styles.statNumber}>{kitchenStats.todayOrders}</h3>
            <p style={styles.statLabel}>Today's Brews</p>
            <div style={styles.statTrend}>🔥 Fresh today</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍🍳</div>
            <h3 style={styles.statNumber}>{kitchenStats.preparingOrders}</h3>
            <p style={styles.statLabel}>In Progress</p>
            <div style={styles.statTrend}>⚡ Being crafted</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <h3 style={styles.statNumber}>{kitchenStats.completedToday}</h3>
            <p style={styles.statLabel}>Served Today</p>
            <div style={styles.statTrend}>🎉 Delivered</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏱️</div>
            <h3 style={styles.statNumber}>{kitchenStats.avgPreparationTime}</h3>
            <p style={styles.statLabel}>Avg Brew Time</p>
            <div style={styles.statTrend}>⚡ Efficiency</div>
          </div>
        </div>

        {/* Profile Form */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {getSpecializationIcon(profile.specialization)} Barista Information
          </h2>

          {message && (
            <div style={{
              ...styles.message,
              ...(message.includes("❌") ? styles.errorMessage : styles.successMessage)
            }}>
              {message}
            </div>
          )}

          <div style={styles.formGrid}>
            {/* Name Field */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                👤 Barista Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter your barista name"
                />
              ) : (
                <div style={styles.formDisplay}>
                  {profile.name || "Not provided"}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                📧 Coffee Mail
              </label>
              <div style={styles.formDisabled}>
                {profile.email}
              </div>
              <p style={styles.formHelp}>
                Contact email for orders
              </p>
            </div>

            {/* Phone Field */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                📞 Brew Line
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Your contact number"
                />
              ) : (
                <div style={styles.formDisplay}>
                  {profile.phone || "Not provided"}
                </div>
              )}
            </div>

            {/* Specialization Field */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                🎯 Coffee Craft
              </label>
              {isEditing ? (
                <select
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleInputChange}
                  style={styles.formSelect}
                >
                  <option value="Head Barista">Head Barista</option>
                  <option value="Espresso Station">Espresso Station</option>
                  <option value="Brew Station">Brew Station</option>
                  <option value="Cold Brew Station">Cold Brew Station</option>
                  <option value="Pastry Station">Pastry Station</option>
                  <option value="Sandwich Station">Sandwich Station</option>
                  <option value="Dessert Station">Dessert Station</option>
                  <option value="General">General Barista</option>
                </select>
              ) : (
                <div style={styles.specializationDisplay}>
                  <span style={styles.specializationIcon}>
                    {getSpecializationIcon(profile.specialization)}
                  </span>
                  {getStationDisplayName(profile.specialization) || "General Barista"}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div style={styles.formActions}>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => e.target.style.background = '#D2B48C'}
                  onMouseLeave={(e) => e.target.style.background = '#F5E6D3'}
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={styles.saveButton}
                  onMouseEnter={(e) => e.target.style.background = '#8B4513'}
                  onMouseLeave={(e) => e.target.style.background = '#A0522D'}
                >
                  {loading ? "⏳ Saving..." : "💾 Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coffee Station Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            🏪 Coffee Station
          </h2>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>
                🆔 Barista ID
              </label>
              <div style={styles.infoValue}>
                {user.id || "N/A"}
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>
                👨‍💼 Role
              </label>
              <div style={styles.infoValue}>
                {user.role || "Barista"}
              </div>
            </div>
          </div>

          <div style={styles.coffeeStation}>
            <label style={styles.infoLabel}>
              🔥 Your Station
            </label>
            <div style={styles.stationDisplay}>
              <span style={styles.stationIcon}>
                {getSpecializationIcon(profile.specialization)}
              </span>
              <div>
                <div style={styles.stationName}>
                  {getStationDisplayName(profile.specialization)}
                </div>
                <div style={styles.stationDescription}>
                  Crafting perfect {profile.specialization?.toLowerCase() || 'coffee'} experiences
                </div>
              </div>
            </div>
          </div>

          {/* Current Shift Info */}
          <div style={styles.shiftInfo}>
            <label style={styles.infoLabel}>
              🕒 Brewing Shift
            </label>
            <div style={styles.shiftDetails}>
              <div style={styles.shiftTime}>🕘 6:00 AM - 3:00 PM</div>
              <div style={styles.shiftStatus}>
                <span style={styles.statusDot}>●</span>
                Active Brewing
              </div>
            </div>
          </div>

          {/* Coffee Skills */}
          <div style={styles.skillsSection}>
            <label style={styles.infoLabel}>
              🎯 Coffee Skills
            </label>
            <div style={styles.skillsGrid}>
              <div style={styles.skillItem}>☕ Espresso</div>
              <div style={styles.skillItem}>💧 Pour Over</div>
              <div style={styles.skillItem}>❄️ Cold Brew</div>
              <div style={styles.skillItem}>🥛 Latte Art</div>
              <div style={styles.skillItem}>🍰 Pastry Pairing</div>
              <div style={styles.skillItem}>⚡ Quick Service</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Coffee-themed styles
const styles = {
  container: {
    padding: '20px',
    background: 'linear-gradient(135deg, #F9F5F0 0%, #F5E6D3 100%)',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'rgba(255, 250, 245, 0.9)',
    padding: '30px',
    borderRadius: '16px',
    border: '2px solid #D2B48C',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #8B4513, #D2691E)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent'
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#8B4513',
    fontSize: '16px',
    fontWeight: '500'
  },
  editButton: {
    background: 'linear-gradient(135deg, #8B4513, #A0522D)',
    color: '#FFF8F0',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'rgba(255, 250, 245, 0.9)',
    padding: '25px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
    border: '2px solid #D2B48C',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  statIcon: {
    fontSize: '36px',
    marginBottom: '15px',
    opacity: 0.9
  },
  statNumber: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '700',
    color: '#5D4037'
  },
  statLabel: {
    margin: '0 0 8px 0',
    color: '#8B4513',
    fontSize: '14px',
    fontWeight: '600'
  },
  statTrend: {
    fontSize: '12px',
    color: '#A0522D',
    fontWeight: '500',
    background: 'rgba(210, 180, 140, 0.2)',
    padding: '4px 8px',
    borderRadius: '12px',
    display: 'inline-block'
  },
  section: {
    background: 'rgba(255, 250, 245, 0.9)',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
    border: '2px solid #D2B48C',
    backdropFilter: 'blur(10px)',
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '0 0 25px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#5D4037',
    borderBottom: '2px solid #D2B48C',
    paddingBottom: '15px'
  },
  message: {
    padding: '15px 20px',
    borderRadius: '12px',
    marginBottom: '25px',
    fontWeight: '500',
    fontSize: '14px',
    border: '2px solid transparent'
  },
  successMessage: {
    background: 'rgba(139, 195, 74, 0.1)',
    color: '#2E7D32',
    borderColor: '#4CAF50'
  },
  errorMessage: {
    background: 'rgba(244, 67, 54, 0.1)',
    color: '#C62828',
    borderColor: '#F44336'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px'
  },
  formGroup: {
    marginBottom: '25px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#5D4037',
    fontSize: '14px'
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #D2B48C',
    borderRadius: '12px',
    fontSize: '14px',
    background: '#FFF8F0',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxSizing: 'border-box'
  },
  formDisplay: {
    padding: '14px 16px',
    background: '#FFF8F0',
    borderRadius: '12px',
    border: '2px solid #D2B48C',
    color: '#5D4037',
    fontWeight: '500',
    fontSize: '14px'
  },
  formDisabled: {
    padding: '14px 16px',
    background: '#F5E6D3',
    borderRadius: '12px',
    border: '2px solid #A0522D',
    color: '#8B4513',
    fontWeight: '500',
    fontSize: '14px'
  },
  formHelp: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#A0522D',
    fontStyle: 'italic'
  },
  formSelect: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #D2B48C',
    borderRadius: '12px',
    fontSize: '14px',
    background: '#FFF8F0',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease'
  },
  specializationDisplay: {
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #FFF8F0, #F5E6D3)',
    borderRadius: '12px',
    border: '2px solid #8B4513',
    color: '#5D4037',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  specializationIcon: {
    fontSize: '20px'
  },
  formActions: {
    gridColumn: '1 / -1',
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '25px',
    paddingTop: '25px',
    borderTop: '2px solid #D2B48C'
  },
  cancelButton: {
    background: '#F5E6D3',
    color: '#8B4513',
    border: '2px solid #D2B48C',
    padding: '14px 28px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  saveButton: {
    background: '#A0522D',
    color: '#FFF8F0',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
    marginBottom: '25px'
  },
  infoItem: {
    marginBottom: '20px'
  },
  infoLabel: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#5D4037',
    fontSize: '14px'
  },
  infoValue: {
    padding: '14px 16px',
    background: '#FFF8F0',
    borderRadius: '12px',
    border: '2px solid #D2B48C',
    color: '#5D4037',
    fontWeight: '500',
    fontSize: '14px'
  },
  coffeeStation: {
    marginBottom: '30px'
  },
  stationDisplay: {
    padding: '20px',
    background: 'linear-gradient(135deg, #8B4513, #A0522D)',
    borderRadius: '16px',
    border: '2px solid #D2691E',
    color: '#FFF8F0',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '16px',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)'
  },
  stationIcon: {
    fontSize: '28px'
  },
  stationName: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  stationDescription: {
    fontSize: '12px',
    opacity: 0.9,
    fontWeight: '400'
  },
  shiftInfo: {
    marginBottom: '25px'
  },
  shiftDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px',
    background: 'linear-gradient(135deg, #FFF8F0, #F5E6D3)',
    borderRadius: '12px',
    border: '2px solid #D2B48C'
  },
  shiftTime: {
    color: '#5D4037',
    fontWeight: '600',
    fontSize: '14px'
  },
  shiftStatus: {
    color: '#228B22',
    fontWeight: '600',
    background: 'rgba(34, 139, 34, 0.1)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusDot: {
    color: '#228B22',
    fontSize: '16px'
  },
  skillsSection: {
    marginTop: '25px'
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginTop: '15px'
  },
  skillItem: {
    padding: '10px 12px',
    background: 'rgba(139, 69, 19, 0.1)',
    borderRadius: '8px',
    color: '#5D4037',
    fontWeight: '500',
    fontSize: '12px',
    textAlign: 'center',
    border: '1px solid #D2B48C'
  }
};

export default ChefProfile;