import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "../customer.css";

const CustomerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await api.get(`/customer/orders/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Orders load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'PREPARING': return 'status-confirmed';
      case 'READY': return 'status-completed';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="My Orders">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">Loading your orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Orders">
      {/* Header with Button */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.8rem',
          color: '#d4a574',
          margin: 0
        }}>
          📦 Order History
        </h3>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/customer/menu")}
        >
          ☕ Order More
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
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
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#d4a574' }}>
            {orders.length}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Total Orders
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#4ade80' }}>
            {orders.filter(o => o.status === 'COMPLETED').length}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Completed
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.1))',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '15px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
            ₹{orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Total Spent
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3 className="empty-state-title">No Orders Yet</h3>
          <p className="empty-state-description">
            You haven't placed any orders yet. Start by exploring our menu!
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/customer/menu")}
            style={{ marginTop: '1rem' }}
          >
            ☕ View Menu
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="order-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/customer/order/${order.id}`)}
            >
              {/* Order Header */}
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">
                    {formatDate(order.createdAt)}
                  </div>
                  <div style={{ 
                    marginTop: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    ₹{order.totalAmount}
                  </div>
                </div>
                <div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              {order.orderItems && order.orderItems.length > 0 && (
                <div className="order-items">
                  <h4 style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    marginBottom: '1rem',
                    fontSize: '1.1rem'
                  }}>
                    Items Ordered:
                  </h4>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <div>
                        <span className="order-item-name">
                          {item.menuItemName || `Item ${index + 1}`}
                        </span>
                        <span className="order-item-quantity">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="order-item-price">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: 'rgba(33, 150, 243, 0.1)', 
                  borderRadius: '8px',
                  borderLeft: '3px solid #2196F3'
                }}>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                    <strong>Special Instructions:</strong> {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* Order Footer */}
              <div className="order-footer">
                <div>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: 'rgba(255, 255, 255, 0.6)' 
                  }}>
                    {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="order-total">
                  Total: <span className="order-total-amount">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};


export default CustomerOrders;
