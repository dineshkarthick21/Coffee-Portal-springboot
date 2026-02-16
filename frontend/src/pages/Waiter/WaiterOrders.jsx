  import React, { useEffect, useState } from "react";
  import api from "../../api/apiClient";
  import DashboardLayout from "../../layout/DashboardLayout";
  import { useAuth } from "../../auth/AuthContext";

  const WaiterOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ready"); // ready, served, all
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState("all");

    // Load waiter orders
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/waiter/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Orders load error:", err);
        alert("Error loading orders: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    // Load available tables
    const loadTables = async () => {
      try {
        const res = await api.get("/waiter/tables");
        setTables(res.data);
      } catch (err) {
        console.error("Tables load error:", err);
        // If tables endpoint doesn't exist, try admin tables endpoint
        try {
          const adminRes = await api.get("/admin/tables");
          setTables(adminRes.data);
        } catch (adminErr) {
          console.error("Admin tables error:", adminErr);
        }
      }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        await api.put(`/waiter/orders/${orderId}/status?status=${newStatus}`);
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        alert(`Order marked as ${newStatus.toLowerCase()}`);
      } catch (err) {
        console.error("Status update error:", err);
        alert("Error updating order status: " + (err.response?.data?.message || err.message));
      }
    };

    // Filter orders based on current filter and table
    const filteredOrders = orders.filter(order => {
      // Status filter
      let statusMatch = true;
      if (filter === "ready") statusMatch = order.status === "READY";
      if (filter === "served") statusMatch = order.status === "SERVED";
      if (filter === "all") statusMatch = true;

      // Table filter
      let tableMatch = true;
      if (selectedTable !== "all") {
        tableMatch = order.table && order.table.tableNumber === selectedTable;
      }

      return statusMatch && tableMatch;
    });

    // Get status color
    const getStatusColor = (status) => {
      switch (status) {
        case 'READY': return '#4CAF50';
        case 'SERVED': return '#2196F3';
        case 'COMPLETED': return '#607D8B';
        default: return '#666';
      }
    };

    // Get table status color
    const getTableStatusColor = (status) => {
      switch (status) {
        case 'OCCUPIED': return '#ffa500';
        case 'AVAILABLE': return '#4CAF50';
        case 'RESERVED': return '#2196F3';
        default: return '#666';
      }
    };

    // Auto-refresh orders every 30 seconds
    useEffect(() => {
      loadOrders();
      loadTables();
      
      const interval = setInterval(() => {
        loadOrders();
        loadTables();
      }, 30000);

      return () => clearInterval(interval);
    }, []);

    return (
      <DashboardLayout title="Waiter Dashboard">
        <div style={{ color: "#fff" }}>
          
          {/* Header */}
          <div style={{ marginBottom: 30 }}>
            <h1 style={{ margin: "0 0 10px 0" }}>Table Service</h1>
            <p style={{ opacity: 0.7, margin: 0 }}>Manage orders and table service</p>
          </div>

          {/* Quick Stats */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: 15, 
            marginBottom: 30 
          }}>
            <div style={{
              background: "#1e1e1e",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #333",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#4CAF50", margin: "0 0 5px 0" }}>
                {orders.filter(o => o.status === "READY").length}
              </h3>
              <p style={{ opacity: 0.7, margin: 0, fontSize: "0.8em" }}>Ready to Serve</p>
            </div>
            
            <div style={{
              background: "#1e1e1e",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #333",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#2196F3", margin: "0 0 5px 0" }}>
                {orders.filter(o => o.status === "SERVED").length}
              </h3>
              <p style={{ opacity: 0.7, margin: 0, fontSize: "0.8em" }}>Served</p>
            </div>
            
            <div style={{
              background: "#1e1e1e",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #333",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#ffa500", margin: "0 0 5px 0" }}>
                {tables.filter(t => t.status === "OCCUPIED").length}
              </h3>
              <p style={{ opacity: 0.7, margin: 0, fontSize: "0.8em" }}>Occupied Tables</p>
            </div>
            
            <div style={{
              background: "#1e1e1e",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #333",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#4CAF50", margin: "0 0 5px 0" }}>
                {tables.filter(t => t.status === "AVAILABLE").length}
              </h3>
              <p style={{ opacity: 0.7, margin: 0, fontSize: "0.8em" }}>Available Tables</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30 }}>
            
            {/* Left Column - Tables Overview */}
            <div>
              <h2 style={{ marginBottom: 20 }}>Tables Overview</h2>
              
              {tables.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, opacity: 0.7 }}>
                  <p>No tables data available</p>
                </div>
              ) : (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(2, 1fr)", 
                  gap: 15,
                  marginBottom: 20
                }}>
                  {tables.map(table => (
                    <div key={table.id} style={{
                      background: "#1e1e1e",
                      padding: 15,
                      borderRadius: 8,
                      border: "2px solid " + getTableStatusColor(table.status),
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onClick={() => setSelectedTable(table.tableNumber)}
                    onMouseEnter={(e) => e.target.style.background = "#2a2a2a"}
                    onMouseLeave={(e) => e.target.style.background = "#1e1e1e"}
                    >
                      <h3 style={{ margin: "0 0 5px 0" }}>Table {table.tableNumber}</h3>
                      <div style={{ 
                        display: "inline-block",
                        padding: "2px 8px",
                        background: getTableStatusColor(table.status),
                        color: "#fff",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        marginBottom: 5
                      }}>
                        {table.status}
                      </div>
                      {table.orders > 0 && (
                        <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", opacity: 0.7 }}>
                          {table.orders} order{table.orders !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Table Filter */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  Filter by Table:
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #444",
                    background: "#2a2a2a",
                    color: "#fff",
                    fontSize: "14px"
                  }}
                >
                  <option value="all">All Tables</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.tableNumber}>
                      Table {table.tableNumber} ({table.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Orders */}
            <div>
              {/* Filters */}
              <div style={{ 
                display: "flex", 
                gap: 10, 
                marginBottom: 20,
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => setFilter("ready")}
                  style={{
                    background: filter === "ready" ? "#4CAF50" : "transparent",
                    color: "#fff",
                    border: "1px solid #4CAF50",
                    padding: "8px 16px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Ready to Serve
                </button>
                <button
                  onClick={() => setFilter("served")}
                  style={{
                    background: filter === "served" ? "#2196F3" : "transparent",
                    color: "#fff",
                    border: "1px solid #2196F3",
                    padding: "8px 16px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Served
                </button>
                <button
                  onClick={() => setFilter("all")}
                  style={{
                    background: filter === "all" ? "#666" : "transparent",
                    color: "#fff",
                    border: "1px solid #666",
                    padding: "8px 16px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  All Orders
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <p style={{ opacity: 0.7 }}>Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, opacity: 0.7 }}>
                  <p>No orders found</p>
                  <p>Orders ready for service will appear here</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 15 }}>
                  {filteredOrders.map((order) => (
                    <div key={order.id} style={{
                      background: "#1e1e1e",
                      borderRadius: 8,
                      border: "1px solid #333",
                      overflow: "hidden"
                    }}>
                      {/* Order Header */}
                      <div style={{
                        padding: "15px 20px",
                        background: "#2a2a2a",
                        borderBottom: "1px solid #333",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10
                      }}>
                        <div>
                          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                            Order #{order.id}
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: 20,
                              background: getStatusColor(order.status),
                              color: "#fff",
                              fontSize: "0.8em",
                              fontWeight: "bold"
                            }}>
                              {order.status}
                            </span>
                          </h3>
                          <p style={{ opacity: 0.7, margin: "5px 0 0 0", fontSize: "0.9em" }}>
                            Table {order.table?.tableNumber || "N/A"} • {new Date(order.createdAt).toLocaleTimeString()} • ₹ {order.totalAmount}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {order.status === "READY" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "SERVED")}
                              style={{
                                background: "#2196F3",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold"
                              }}
                            >
                              Mark as Served
                            </button>
                          )}
                          {order.status === "SERVED" && (
                            <button
                              onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                              style={{
                                background: "#4CAF50",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold"
                              }}
                            >
                              Mark as Completed
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div style={{ padding: "15px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
                          <div>
                            <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                              Customer: {order.user?.name || "N/A"}
                            </p>
                            <p style={{ margin: 0, opacity: 0.7, fontSize: "0.9em" }}>
                              Order Time: {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: "grid", gap: 10 }}>
                          {order.orderItems?.map((item, index) => (
                            <div key={index} style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                              borderBottom: "1px solid #333"
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <strong>{item.menuItemName}</strong>
                                  <span style={{
                                    padding: "2px 8px",
                                    background: "#333",
                                    borderRadius: 12,
                                    fontSize: "0.8em"
                                  }}>
                                    ×{item.quantity}
                                  </span>
                                </div>
                                {item.specialInstructions && (
                                  <p style={{ 
                                    opacity: 0.7, 
                                    margin: "2px 0 0 0", 
                                    fontSize: "0.8em",
                                    fontStyle: "italic"
                                  }}>
                                    📝 {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                              <span style={{ fontWeight: "bold" }}>
                                ₹ {(item.unitPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Special Instructions */}
                        {order.specialInstructions && (
                          <div style={{
                            marginTop: 15,
                            padding: 10,
                            background: "#2a2a2a",
                            borderRadius: 6,
                            borderLeft: "3px solid #2196F3"
                          }}>
                            <p style={{ margin: 0, fontSize: "0.9em", opacity: 0.9 }}>
                              <strong>Customer Note:</strong> {order.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  };

  export default WaiterOrders;