import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <DashboardLayout title="Registered Customers">
      <div style={containerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, index) => (
              <tr key={c.id} style={getRowStyle(index)}>
                <td style={tdStyle}>{c.id}</td>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.phone}</td>
                <td style={tdStyle}>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
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

const getRowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
  transition: "background-color 0.2s ease",
  cursor: "pointer",
  ':hover': {
    backgroundColor: "#e9ecef"
  }
});

export default AdminCustomers;