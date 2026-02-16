import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import "../customer.css";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      icon: "📅",
      title: "Book a Table",
      description: "Reserve your spot at JavaBite. Choose your preferred date, time slot, and table.",
      path: "/customer/book-table"
    },
    {
      icon: "☕",
      title: "View Menu / Order",
      description: "Explore our delicious coffee menu and place your order for delivery or pickup.",
      path: "/customer/menu"
    },
    {
      icon: "📦",
      title: "My Orders",
      description: "Track your current orders and view your complete order history.",
      path: "/customer/orders"
    },
    {
      icon: "👤",
      title: "My Profile",
      description: "Manage your personal information, preferences, and account settings.",
      path: "/customer/profile"
    }
  ];

  return (
    <DashboardLayout title="Customer Dashboard">
      <div className="dashboard-subtitle" style={{ marginBottom: '2rem' }}>
        Welcome back! What would you like to do today?
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="dashboard-card-icon">{card.icon}</div>
            <h3 className="dashboard-card-title">{card.title}</h3>
            <p className="dashboard-card-description">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '1.8rem', 
          marginBottom: '1.5rem',
          color: '#d4a574'
        }}>
          Quick Actions
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/customer/book-table")}
            style={{ padding: '1.2rem' }}
          >
            🎉 Book Now
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate("/customer/menu")}
            style={{ padding: '1.2rem' }}
          >
            ☕ Order Coffee
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate("/customer/orders")}
            style={{ padding: '1.2rem' }}
          >
            📋 View Orders
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
