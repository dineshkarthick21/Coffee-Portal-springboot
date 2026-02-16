import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import "../pages/customer.css";

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation items based on role
  const getNavItems = () => {
    if (user?.role === 'CUSTOMER') {
      return [
        { path: '/customer', icon: '🏠', label: 'Dashboard' },
        { path: '/customer/book-table', icon: '📅', label: 'Book Table' },
        { path: '/customer/menu', icon: '☕', label: 'Menu & Order' },
        { path: '/customer/orders', icon: '📦', label: 'My Orders' },
        { path: '/customer/feedback', icon: '💬', label: 'Give Feedback' },
        { path: '/customer/feedback-history', icon: '📋', label: 'My Feedback' },
        { path: '/customer/profile', icon: '👤', label: 'My Profile' },
      ];
    }
    
    if (user?.role === 'CHEF') {
      return [
        { path: '/chef/', icon: '📊', label: 'Dashboard' },
        { path: '/chef/orders', icon: '👨‍🍳', label: 'Kitchen Orders' },
        { path: '/chef/profile', icon: '👤', label: 'My Profile' },
      ];
    }
    
    if (user?.role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard Analytics' },
        { path: '/admin/staff', icon: '👨‍🍳', label: 'Manage Staff' },
        { path: '/admin/menu', icon: '☕', label: 'Manage Menu' },
        { path: '/admin/orders', icon: '📦', label: 'View Orders' },
        { path: '/admin/customers', icon: '👥', label: 'View Customers' },
        { path: '/admin/tables', icon: '🪑', label: 'Manage Tables' },
        { path: '/admin/feedback', icon: '📊', label: 'Customer Feedback' },
      ];
    }
    
    // ✅ ADD WAITER ROLE NAVIGATION
    if (user?.role === 'WAITER') {
      return [
        { path: '/waiter', icon: '📊', label: 'Dashboard' },
        { path: '/waiter/orders', icon: '🍽️', label: 'Table Orders' },
        { path: '/waiter/profile', icon: '👤', label: 'My Profile' },
      ];
    }
    
    // Add other role-based navigation items here later
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <span className="sidebar-logo-icon">☕</span>
            JavaBite
          </Link>
          
          {user && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name || user.email || 'User'}</div>
              <div className="sidebar-user-role">{user.role || 'Customer'}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="sidebar-nav-icon">🚪</span>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{title}</h1>
        </div>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;