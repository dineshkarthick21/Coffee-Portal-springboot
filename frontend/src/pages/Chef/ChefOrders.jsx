import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAuth } from "../../auth/AuthContext";

const ChefOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, preparing, ready
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load orders for chef
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chef/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Orders load error:", err);
      alert("Error loading orders: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/chef/orders/${orderId}/status?status=${newStatus}`);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // If selected order is updated, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update error:", err);
      alert("Error updating order status: " + (err.response?.data?.message || err.message));
    }
  };

  // Filter orders based on current filter
  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    if (filter === "pending") return order.status === "PENDING";
    if (filter === "preparing") return order.status === "PREPARING";
    if (filter === "ready") return order.status === "READY";
    return true;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ff9800';
      case 'CONFIRMED': return '#2196F3';
      case 'PREPARING': return '#9C27B0';
      case 'READY': return '#4CAF50';
      case 'COMPLETED': return '#757575';
      case 'CANCELLED': return '#f44336';
      default: return '#666';
    }
  };

  // Get status background color
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'PENDING': return '#fff3e0';
      case 'CONFIRMED': return '#e3f2fd';
      case 'PREPARING': return '#f3e5f5';
      case 'READY': return '#e8f5e8';
      case 'COMPLETED': return '#f5f5f5';
      case 'CANCELLED': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  // Get next status action
  const getNextStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING': return { action: 'Start Preparing', nextStatus: 'PREPARING' };
      case 'CONFIRMED': return { action: 'Start Preparing', nextStatus: 'PREPARING' };
      case 'PREPARING': return { action: 'Mark as Ready', nextStatus: 'READY' };
      case 'READY': return { action: 'Mark as Completed', nextStatus: 'COMPLETED' };
      default: return null;
    }
  };

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    loadOrders();
    
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="Chef Orders">
      <div style={{ color: "#333", background: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
        
        {/* Header with Filters */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 30,
          flexWrap: "wrap",
          gap: 20,
          padding: "25px",
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "28px", 
              fontWeight: "700",
              color: "#2c3e50",
              marginBottom: "5px"
            }}>
              Kitchen Orders
            </h1>
            <p style={{ 
              margin: 0, 
              color: "#666", 
              fontSize: "14px" 
            }}>
              Manage and track all kitchen orders
            </p>
          </div>
          
          <div style={{ 
            display: "flex", 
            gap: 8, 
            flexWrap: "wrap",
            background: "#f8f9fa",
            padding: "8px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0"
          }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "#2196F3" : "transparent",
                color: filter === "all" ? "#fff" : "#666",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: filter === "all" ? "0 2px 4px rgba(33, 150, 243, 0.3)" : "none"
              }}
              onMouseEnter={(e) => {
                if (filter !== "all") {
                  e.target.style.background = "#e3f2fd";
                  e.target.style.color = "#2196F3";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== "all") {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#666";
                }
              }}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter("pending")}
              style={{
                background: filter === "pending" ? "#ff9800" : "transparent",
                color: filter === "pending" ? "#fff" : "#666",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: filter === "pending" ? "0 2px 4px rgba(255, 152, 0, 0.3)" : "none"
              }}
              onMouseEnter={(e) => {
                if (filter !== "pending") {
                  e.target.style.background = "#fff3e0";
                  e.target.style.color = "#ff9800";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== "pending") {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#666";
                }
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("preparing")}
              style={{
                background: filter === "preparing" ? "#9C27B0" : "transparent",
                color: filter === "preparing" ? "#fff" : "#666",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: filter === "preparing" ? "0 2px 4px rgba(156, 39, 176, 0.3)" : "none"
              }}
              onMouseEnter={(e) => {
                if (filter !== "preparing") {
                  e.target.style.background = "#f3e5f5";
                  e.target.style.color = "#9C27B0";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== "preparing") {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#666";
                }
              }}
            >
              Preparing
            </button>
            <button
              onClick={() => setFilter("ready")}
              style={{
                background: filter === "ready" ? "#4CAF50" : "transparent",
                color: filter === "ready" ? "#fff" : "#666",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: filter === "ready" ? "0 2px 4px rgba(76, 175, 80, 0.3)" : "none"
              }}
              onMouseEnter={(e) => {
                if (filter !== "ready") {
                  e.target.style.background = "#e8f5e8";
                  e.target.style.color = "#4CAF50";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== "ready") {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#666";
                }
              }}
            >
              Ready
            </button>
          </div>
        </div>

        {/* Orders Count */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 30
        }}>
          <div style={{
            padding: "20px",
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }} onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }} onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#2c3e50" }}>
              {filteredOrders.length}
            </div>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Total Orders
            </div>
          </div>
          <div style={{
            padding: "20px",
            background: "#ffffff",
            borderRadius: 12,
            border: "2px solid #ff9800",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(255,152,0,0.1)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }} onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(255,152,0,0.2)";
          }} onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(255,152,0,0.1)";
          }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#ff9800" }}>
              {orders.filter(o => o.status === "PENDING").length}
            </div>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Pending
            </div>
          </div>
          <div style={{
            padding: "20px",
            background: "#ffffff",
            borderRadius: 12,
            border: "2px solid #9C27B0",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(156,39,176,0.1)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }} onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(156,39,176,0.2)";
          }} onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(156,39,176,0.1)";
          }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#9C27B0" }}>
              {orders.filter(o => o.status === "PREPARING").length}
            </div>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Preparing
            </div>
          </div>
          <div style={{
            padding: "20px",
            background: "#ffffff",
            borderRadius: 12,
            border: "2px solid #4CAF50",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(76,175,80,0.1)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }} onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(76,175,80,0.2)";
          }} onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(76,175,80,0.1)";
          }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#4CAF50" }}>
              {orders.filter(o => o.status === "READY").length}
            </div>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
              Ready
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #f0f0f0",
              borderTop: "3px solid #2196F3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p style={{ color: "#666", margin: 0, fontSize: "16px" }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "48px", color: "#e0e0e0", marginBottom: "20px" }}>📋</div>
            <p style={{ color: "#666", margin: "0 0 10px 0", fontSize: "18px" }}>No orders found</p>
            <p style={{ color: "#999", margin: 0, fontSize: "14px" }}>New orders will appear here automatically</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e0e0e0",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }} onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }} onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}>
                {/* Order Header */}
                <div style={{
                  padding: "20px",
                  background: getStatusBackgroundColor(order.status),
                  borderBottom: "1px solid #e0e0e0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 15
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: 0, 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12,
                      fontSize: "20px",
                      color: "#2c3e50"
                    }}>
                      Order #{order.id}
                      <span style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        background: getStatusColor(order.status),
                        color: "#fff",
                        fontSize: "0.75em",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}>
                        {order.status}
                      </span>
                    </h3>
                    <p style={{ 
                      color: "#666", 
                      margin: "8px 0 0 0", 
                      fontSize: "0.9em",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      <span>📅 {new Date(order.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>💰 ₹ {order.totalAmount}</span>
                    </p>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    gap: 10, 
                    flexWrap: "wrap",
                    justifyContent: "flex-end"
                  }}>
                    {getNextStatusAction(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order.id, getNextStatusAction(order.status).nextStatus)}
                        style={{
                          background: getStatusColor(getNextStatusAction(order.status).nextStatus),
                          color: "#fff",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                        }}
                      >
                        {getNextStatusAction(order.status).action}
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      style={{
                        background: selectedOrder?.id === order.id ? "#2196F3" : "transparent",
                        color: selectedOrder?.id === order.id ? "#fff" : "#2196F3",
                        border: "1px solid #2196F3",
                        padding: "10px 20px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrder?.id !== order.id) {
                          e.target.style.background = "#2196F3";
                          e.target.style.color = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrder?.id !== order.id) {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#2196F3";
                        }
                      }}
                    >
                      {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {/* Order Items - Always visible */}
                <div style={{ padding: "20px" }}>
                  <h4 style={{ 
                    margin: "0 0 15px 0", 
                    fontSize: "16px",
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <span>🍽️</span>
                    Order Items
                  </h4>
                  <div style={{ display: "grid", gap: 12 }}>
                    {order.orderItems?.map((item, index) => (
                      <div key={index} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        padding: "12px 0",
                        borderBottom: "1px solid #f0f0f0",
                        transition: "background 0.2s ease"
                      }} onMouseEnter={(e) => {
                        e.target.style.background = "#f8f9fa";
                        e.target.style.borderRadius = "6px";
                        e.target.style.padding = "12px";
                        e.target.style.margin = "0 -12px";
                      }} onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.borderRadius = "0";
                        e.target.style.padding = "12px 0";
                        e.target.style.margin = "0";
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12,
                            marginBottom: "4px"
                          }}>
                            <strong style={{ fontSize: "15px", color: "#2c3e50" }}>{item.menuItemName}</strong>
                            <span style={{
                              padding: "4px 10px",
                              background: "#e3f2fd",
                              color: "#2196F3",
                              borderRadius: 12,
                              fontSize: "0.8em",
                              fontWeight: "600"
                            }}>
                              ×{item.quantity}
                            </span>
                          </div>
                          {item.specialInstructions && (
                            <p style={{ 
                              color: "#666", 
                              margin: "8px 0 0 0", 
                              fontSize: "0.85em",
                              fontStyle: "italic",
                              background: "#e3f2fd",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              borderLeft: "3px solid #2196F3"
                            }}>
                              📝 {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <span style={{ 
                          fontWeight: "700", 
                          fontSize: "15px",
                          color: "#4CAF50"
                        }}>
                          ₹ {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions for entire order */}
                  {order.specialInstructions && (
                    <div style={{
                      marginTop: 20,
                      padding: 15,
                      background: "#e3f2fd",
                      borderRadius: 8,
                      borderLeft: "4px solid #2196F3"
                    }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "0.9em", 
                        color: "#2c3e50",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8
                      }}>
                        <span style={{ fontSize: "16px" }}>📋</span>
                        <span>
                          <strong style={{ color: "#2196F3" }}>Order Note:</strong> {order.specialInstructions}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Info - Show when expanded */}
                {selectedOrder?.id === order.id && (
                  <div style={{
                    padding: "20px",
                    background: "#f8f9fa",
                    borderTop: "1px solid #e0e0e0",
                    animation: "slideDown 0.3s ease"
                  }}>
                    <h4 style={{ 
                      margin: "0 0 15px 0",
                      fontSize: "16px",
                      color: "#2c3e50",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      <span>👤</span>
                      Customer Information
                    </h4>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                      gap: 20 
                    }}>
                      <div style={{
                        padding: "15px",
                        background: "#ffffff",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}>
                        <label style={{ 
                          display: "block", 
                          color: "#666", 
                          fontSize: "0.85em",
                          marginBottom: "5px",
                          fontWeight: "500"
                        }}>
                          Customer Name
                        </label>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: "600", 
                          fontSize: "16px",
                          color: "#2c3e50"
                        }}>
                          {order.user?.name || "N/A"}
                        </p>
                      </div>
                      <div style={{
                        padding: "15px",
                        background: "#ffffff",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}>
                        <label style={{ 
                          display: "block", 
                          color: "#666", 
                          fontSize: "0.85em",
                          marginBottom: "5px",
                          fontWeight: "500"
                        }}>
                          Contact
                        </label>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: "600", 
                          fontSize: "16px",
                          color: "#2c3e50"
                        }}>
                          {order.user?.phone || order.user?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    {order.table && (
                      <div style={{ 
                        marginTop: 15,
                        padding: "15px",
                        background: "#e8f5e8",
                        borderRadius: 8,
                        border: "1px solid #4CAF50",
                        boxShadow: "0 1px 3px rgba(76,175,80,0.2)"
                      }}>
                        <label style={{ 
                          display: "block", 
                          color: "#666", 
                          fontSize: "0.85em",
                          marginBottom: "5px",
                          fontWeight: "500"
                        }}>
                          Table Number
                        </label>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: "700", 
                          fontSize: "16px",
                          color: "#2e7d32",
                          display: "flex",
                          alignItems: "center",
                          gap: 8
                        }}>
                          <span>🪑</span>
                          Table {order.table.tableNumber}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default ChefOrders;