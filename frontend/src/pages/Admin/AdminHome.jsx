import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Stats configuration
  const statsConfig = [
    { key: "customers", title: "Total Customers", icon: "👥", color: "#4f46e5" },
    { key: "staff", title: "Total Staff", icon: "👨‍🍳", color: "#059669" },
    { key: "orders", title: "Total Orders", icon: "📦", color: "#dc2626" },
    { key: "pendingOrders", title: "Pending Orders", icon: "⏳", color: "#d97706" },
    { key: "preparingOrders", title: "Preparing", icon: "👨‍🍳", color: "#7c3aed" },
    { key: "servedOrders", title: "Served", icon: "🍽️", color: "#0891b2" },
    { key: "completedOrders", title: "Completed", icon: "✅", color: "#059669" },
    { key: "tables", title: "Total Tables", icon: "🪑", color: "#475569" }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard — Loading...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard — Hello, System Administrator (ADMIN)">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">Dashboard Overview 📊</h1>
        <p className="welcome-subtitle">Real-time statistics and insights</p>
      </div>

      {/* Stats Grid Only */}
      <div className="stats-grid">
        {statsConfig.map((stat) => (
          <StatCard 
            key={stat.key} 
            title={stat.title} 
            value={stats[stat.key] || 0} 
            icon={stat.icon} 
            color={stat.color} 
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card" style={{ '--card-color': color }}>
    <div className="stat-header">
      <div className="stat-icon" style={{ backgroundColor: color + '20' }}>
        {icon}
      </div>
    </div>
    <div className="stat-content">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;