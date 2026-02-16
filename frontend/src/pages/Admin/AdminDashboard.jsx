import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

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
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stats configuration with icons and colors
  const statsConfig = [
    { 
      key: "customers", 
      title: "Total Customers", 
      icon: "👥", 
      color: "#4f46e5"
    },
    { 
      key: "staff", 
      title: "Total Staff", 
      icon: "👨‍🍳", 
      color: "#059669"
    },
    { 
      key: "orders", 
      title: "Total Orders", 
      icon: "📦", 
      color: "#dc2626"
    },
    { 
      key: "pendingOrders", 
      title: "Pending Orders", 
      icon: "⏳", 
      color: "#d97706"
    },
    { 
      key: "preparingOrders", 
      title: "Preparing", 
      icon: "👨‍🍳", 
      color: "#7c3aed"
    },
    { 
      key: "servedOrders", 
      title: "Served", 
      icon: "🍽️", 
      color: "#0891b2"
    },
    { 
      key: "completedOrders", 
      title: "Completed", 
      icon: "✅", 
      color: "#059669"
    },
    { 
      key: "tables", 
      title: "Total Tables", 
      icon: "🪑", 
      color: "#475569"
    }
  ];

  // Generate chart data from your real stats
  const generateChartData = () => {
    // Order status distribution for pie chart
    const orderStatusData = [
      { name: 'Pending', value: stats.pendingOrders || 0, color: '#d97706' },
      { name: 'Preparing', value: stats.preparingOrders || 0, color: '#7c3aed' },
      { name: 'Served', value: stats.servedOrders || 0, color: '#0891b2' },
      { name: 'Completed', value: stats.completedOrders || 0, color: '#059669' }
    ];

    // Daily trend data (simulated based on your stats)
    const dailyTrendData = [
      { time: '9 AM', orders: Math.floor((stats.orders || 0) * 0.15) },
      { time: '11 AM', orders: Math.floor((stats.orders || 0) * 0.25) },
      { time: '1 PM', orders: Math.floor((stats.orders || 0) * 0.35) },
      { time: '3 PM', orders: Math.floor((stats.orders || 0) * 0.15) },
      { time: '5 PM', orders: Math.floor((stats.orders || 0) * 0.10) }
    ];

    // Performance metrics
    const performanceData = [
      { metric: 'Completion Rate', value: stats.orders ? ((stats.completedOrders || 0) / stats.orders * 100) : 0 },
      { metric: 'Active Staff', value: stats.staff || 0 },
      { metric: 'Table Usage', value: stats.tables ? Math.min(100, ((stats.orders || 0) / stats.tables) * 10) : 0 }
    ];

    return {
      orderStatusData,
      dailyTrendData,
      performanceData
    };
  };

  const chartData = generateChartData();

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard — Loading...">
        <div style={loadingContainerStyle}>
          <div style={loadingSpinnerStyle}></div>
          <p style={loadingTextStyle}>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard — Real-time Statistics">
      <div style={dashboardContainerStyle}>
        {/* Stats Grid */}
        <div style={statsGridStyle}>
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

        {/* Charts Section */}
        <div style={chartsContainerStyle}>
          {/* Order Status Distribution */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>📊 Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Orders Trend */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>📈 Daily Orders Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#4f46e5" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>⚡ Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}${value <= 100 ? '%' : ''}`, 'Value']} />
                <Legend />
                <Bar dataKey="value" fill="#059669" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time Activity */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>🔄 Real-time Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  name="Live Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last Updated */}
        <div style={lastUpdatedStyle}>
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <button 
            onClick={fetchStats} 
            style={refreshButtonStyle}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <div style={statCardStyle}>
    <div style={statHeaderStyle}>
      <div style={{...statIconStyle, backgroundColor: color + '20'}}>
        {icon}
      </div>
    </div>
    <div style={statContentStyle}>
      <h3 style={statTitleStyle}>{title}</h3>
      <p style={statValueStyle}>{value}</p>
    </div>
  </div>
);

// Inline CSS Styles
const dashboardContainerStyle = {
  padding: '20px',
  backgroundColor: '#f8f9fa',
  minHeight: '100vh'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const chartsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '25px',
  marginBottom: '20px'
};

const chartCardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '25px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e9ecef'
};

const chartTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const statCardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: '1px solid #e9ecef',
  cursor: 'pointer'
};

const statHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const statIconStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px'
};

const statContentStyle = {
  textAlign: 'left'
};

const statTitleStyle = {
  fontSize: '14px',
  color: '#6c757d',
  margin: '0 0 8px 0',
  fontWeight: '500'
};

const statValueStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#333',
  margin: '0'
};

const lastUpdatedStyle = {
  textAlign: 'center',
  padding: '15px',
  color: '#6c757d',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px'
};

const refreshButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#4f46e5',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px'
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '50vh',
  padding: '20px'
};

const loadingSpinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #4361ee',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '16px'
};

const loadingTextStyle = {
  color: '#666',
  fontSize: '16px'
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default AdminDashboard;