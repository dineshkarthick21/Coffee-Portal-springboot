import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  // ✅ Load all orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // ✅ Auto-refresh every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="Manage Orders">
      <div style={containerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Items</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={noDataStyle}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={order.id} style={getRowStyle(index)}>
                  <td style={tdStyle}>#{order.id}</td>
                  <td style={tdStyle}>{order.user ? order.user.name : "N/A"}</td>
                  <td style={tdStyle}>{order.orderItems ? order.orderItems.length : 0} items</td>
                  <td style={tdStyle}>₹{order.totalAmount}</td>
                  <td style={getStatusStyle(order.status)}>
                    {order.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

// Inline CSS Styles
const containerStyle = {
  padding: '20px',
  backgroundColor: '#f8f9fa',
  minHeight: '100vh'
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const headerRowStyle = {
  backgroundColor: "#4361ee",
  color: "white"
};

const thStyle = {
  padding: "16px 12px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "14px",
  borderBottom: "2px solid #e9ecef"
};

const tdStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #e9ecef",
  fontSize: "14px",
  color: "#495057"
};

const noDataStyle = {
  textAlign: "center", 
  padding: "40px",
  color: "#666",
  fontSize: "16px"
};

const getRowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
  transition: "background-color 0.2s ease",
  cursor: "pointer",
  ':hover': {
    backgroundColor: "#e9ecef"
  }
});

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center",
    display: "inline-block"
  };

  switch (status) {
    case "PREPARING":
      return {
        ...baseStyle,
        backgroundColor: "#fff3cd",
        color: "#856404"
      };
    case "READY":
      return {
        ...baseStyle,
        backgroundColor: "#d1ecf1",
        color: "#0c5460"
      };
    case "SERVED":
      return {
        ...baseStyle,
        backgroundColor: "#d4edda",
        color: "#155724"
      };
    case "COMPLETED":
      return {
        ...baseStyle,
        backgroundColor: "#d1e7dd",
        color: "#0f5132"
      };
    case "CANCELLED":
      return {
        ...baseStyle,
        backgroundColor: "#f8d7da",
        color: "#721c24"
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: "#e2e3e5",
        color: "#383d41"
      };
  }
};

export default AdminOrdersPage;