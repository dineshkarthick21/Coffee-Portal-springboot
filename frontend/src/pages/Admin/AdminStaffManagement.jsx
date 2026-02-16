import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";

const AdminStaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CHEF" });

  const fetchStaff = async () => {
    try {
      const res = await api.get("/admin/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      alert("Failed to load staff data");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/create-staff", form);
      alert("✅ Staff created successfully!");
      setForm({ name: "", email: "", password: "", role: "CHEF" });
      fetchStaff();
    } catch {
      alert("❌ Error creating staff");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      alert("🗑️ Staff member deleted");
      fetchStaff();
    } catch (err) {
      alert("Failed to delete staff member");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <DashboardLayout title="Manage Staff">
      {/* Create Staff Form */}
      <div style={formContainerStyle}>
        <h3 style={sectionTitleStyle}>Create New Staff Member</h3>
        <form onSubmit={handleCreate} style={formStyle}>
          <div style={inputGroupStyle}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={inputStyle}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={selectStyle}
            >
              <option value="CHEF">👨‍🍳 Chef</option>
              <option value="WAITER">💁 Waiter</option>
            </select>
            <button type="submit" style={submitButtonStyle}>
              👥 Create Staff
            </button>
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div style={staffContainerStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Existing Staff Members</h3>
          <span style={countBadgeStyle}>{staffList.length} staff members</span>
        </div>

        {staffList.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyStateTextStyle}>No staff members found. Create your first staff member above.</p>
          </div>
        ) : (
          <div style={staffGridStyle}>
            {staffList.map((staff) => (
              <div key={staff.id} style={staffCardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={avatarStyle}>
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={staffInfoStyle}>
                    <h4 style={staffNameStyle}>{staff.name}</h4>
                    <p style={staffEmailStyle}>{staff.email}</p>
                  </div>
                </div>
                <div style={cardFooterStyle}>
                  <span style={getRoleBadgeStyle(staff.role)}>
                    {getRoleIcon(staff.role)} {staff.role}
                  </span>
                  <button 
                    onClick={() => handleDelete(staff.id)}
                    style={deleteButtonStyle}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Helper functions
const getRoleIcon = (role) => {
  switch (role) {
    case "CHEF": return "👨‍🍳";
    case "WAITER": return "💁";
    default: return "👤";
  }
};

const getRoleBadgeStyle = (role) => {
  const baseStyle = {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize"
  };

  switch (role) {
    case "CHEF":
      return { ...baseStyle, backgroundColor: "#ffedd5", color: "#9a3412" };
    case "WAITER":
      return { ...baseStyle, backgroundColor: "#dbeafe", color: "#1e40af" };
    case "MANAGER":
      return { ...baseStyle, backgroundColor: "#f3e8ff", color: "#7e22ce" };
    case "CASHIER":
      return { ...baseStyle, backgroundColor: "#dcfce7", color: "#166534" };
    default:
      return { ...baseStyle, backgroundColor: "#f1f5f9", color: "#475569" };
  }
};

// CSS Styles
const formContainerStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #e5e7eb"
};

const formStyle = {
  width: "100%"
};

const inputGroupStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "12px",
  alignItems: "end"
};

const inputStyle = {
  padding: "12px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#f9fafb",
  transition: "all 0.2s ease",
  fontFamily: "inherit"
};

const selectStyle = {
  padding: "12px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: "#f9fafb",
  cursor: "pointer",
  fontFamily: "inherit"
};

const submitButtonStyle = {
  padding: "12px 24px",
  backgroundColor: "#4361ee",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "all 0.2s ease",
  fontFamily: "inherit"
};

const staffContainerStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "1px solid #e5e7eb"
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  flexWrap: "wrap",
  gap: "10px"
};

const sectionTitleStyle = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0"
};

const countBadgeStyle = {
  backgroundColor: "#f3f4f6",
  color: "#6b7280",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "500"
};

const staffGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "16px"
};

const staffCardStyle = {
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  padding: "16px",
  border: "1px solid #e5e7eb",
  transition: "all 0.2s ease"
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#4361ee",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  fontSize: "14px"
};

const staffInfoStyle = {
  flex: "1"
};

const staffNameStyle = {
  margin: "0 0 4px 0",
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600"
};

const staffEmailStyle = {
  margin: "0",
  color: "#6b7280",
  fontSize: "14px"
};

const cardFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px"
};

const deleteButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  transition: "all 0.2s ease"
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "40px 20px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "2px dashed #d1d5db"
};

const emptyStateTextStyle = {
  color: "#6b7280",
  fontSize: "16px",
  margin: "0"
};

// Hover effects
inputStyle[":hover"] = {
  borderColor: "#4361ee",
  backgroundColor: "white"
};

selectStyle[":hover"] = {
  borderColor: "#4361ee",
  backgroundColor: "white"
};

submitButtonStyle[":hover"] = {
  backgroundColor: "#3730a3",
  transform: "translateY(-1px)"
};

staffCardStyle[":hover"] = {
  transform: "translateY(-2px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  backgroundColor: "white"
};

deleteButtonStyle[":hover"] = {
  backgroundColor: "#dc2626",
  transform: "translateY(-1px)"
};

export default AdminStaffManagement;