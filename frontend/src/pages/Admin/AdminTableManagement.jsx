import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";

const AdminTableManagement = () => {
  const [tables, setTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);

  const [form, setForm] = useState({
    tableNumber: "",
    capacity: "",
    location: "",
    description: "",
  });

  // ✅ Fetch all tables
  const fetchTables = async () => {
    try {
      const res = await api.get("/admin/tables");
      setTables(res.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
      alert("Failed to load tables");
    }
  };

  // ✅ Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add table (correct endpoint)
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("admin/tables/add", {
        ...form,
        status: "AVAILABLE",
      });

      alert("✅ Table added!");
      setForm({
        tableNumber: "",
        capacity: "",
        location: "",
        description: "",
      });

      fetchTables();
    } catch (err) {
      alert("Failed to add table");
      console.error(err);
    }
  };

  // ✅ Start editing a table
  const handleEdit = (table) => {
    setEditingTable(table);
    setForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location,
      description: table.description,
    });
  };

  // ✅ Update table (correct endpoint)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`admin/tables/update/${editingTable.id}`, {
        ...editingTable,
        capacity: form.capacity,
        location: form.location,
        description: form.description,
        status: editingTable.status,
      });

      alert("✅ Table updated!");
      setEditingTable(null);
      setForm({
        tableNumber: "",
        capacity: "",
        location: "",
        description: "",
      });

      fetchTables();
    } catch (err) {
      alert("Failed to update table");
      console.error(err);
    }
  };

  // ✅ Delete table (correct endpoint)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this table?")) return;

    try {
      await api.delete(`/admin/tables/delete/${id}`);
      alert("🗑️ Table deleted");
      fetchTables();
    } catch (err) {
      alert("Failed to delete");
      console.error(err);
    }
  };

  // ✅ Toggle Maintenance
  const toggleMaintenance = async (table) => {
    try {
      const newStatus =
        table.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";

      await api.put(`/admin/tables/update/${table.id}`, {
        ...table,
        status: newStatus,
      });

      fetchTables();
    } catch (err) {
      alert("Failed to toggle maintenance");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <DashboardLayout title="Manage Coffee Tables">
      {/* ✅ Table Form */}
      <form onSubmit={editingTable ? handleUpdate : handleAdd} style={formStyle}>
        <input
          type="text"
          name="tableNumber"
          placeholder="Table Number"
          value={form.tableNumber}
          disabled={editingTable !== null}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={inputStyle}
        />

        <button type="submit" style={submitButtonStyle}>
          {editingTable ? "Update Table" : "Add Table"}
        </button>
        
        {editingTable && (
          <button 
            type="button" 
            onClick={() => {
              setEditingTable(null);
              setForm({
                tableNumber: "",
                capacity: "",
                location: "",
                description: "",
              });
            }}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
        )}
      </form>

      <h3 style={sectionTitleStyle}>Existing Tables</h3>

      {tables.length === 0 ? (
        <p style={noDataStyle}>No tables found.</p>
      ) : (
        <div style={tableGridStyle}>
          {tables.map((t) => (
            <div key={t.id} style={getTableCardStyle(t.status)}>
              <div style={tableHeaderStyle}>
                <h4 style={tableNumberStyle}>Table {t.tableNumber}</h4>
                <span style={getStatusBadgeStyle(t.status)}>{t.status}</span>
              </div>
              
              <div style={tableInfoStyle}>
                <p><strong>Capacity:</strong> {t.capacity} people</p>
                <p><strong>Location:</strong> {t.location}</p>
                {t.description && <p><strong>Description:</strong> {t.description}</p>}
              </div>

              <div style={buttonGroupStyle}>
                <button onClick={() => handleEdit(t)} style={editButtonStyle}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(t.id)} style={deleteButtonStyle}>
                  🗑️ Delete
                </button>
                <button
                  onClick={() => toggleMaintenance(t)}
                  style={getMaintenanceButtonStyle(t.status)}
                >
                  {t.status === "MAINTENANCE" ? "🛠️ Restore" : "🛠️ Maintenance"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

// Inline CSS Styles
const formStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "30px",
  flexWrap: "wrap",
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "14px",
  flex: "1",
  minWidth: "150px",
  backgroundColor: "#f8f9fa"
};

const submitButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#4361ee",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};

const cancelButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px"
};

const sectionTitleStyle = {
  color: "#333",
  marginBottom: "20px",
  fontSize: "20px",
  fontWeight: "600"
};

const noDataStyle = {
  textAlign: "center",
  color: "#666",
  fontSize: "16px",
  padding: "40px"
};

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px"
};

const getTableCardStyle = (status) => ({
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  border: status === "MAINTENANCE" ? "2px solid #ff9800" : "1px solid #e0e0e0",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
});

const tableHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  paddingBottom: "10px",
  borderBottom: "1px solid #f0f0f0"
};

const tableNumberStyle = {
  margin: "0",
  color: "#333",
  fontSize: "18px",
  fontWeight: "600"
};

const getStatusBadgeStyle = (status) => ({
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  backgroundColor: status === "AVAILABLE" ? "#4caf50" : "#ff9800",
  color: "white"
});

const tableInfoStyle = {
  marginBottom: "15px"
};

const tableInfoStyleP = {
  margin: "8px 0",
  color: "#555",
  fontSize: "14px"
};

const buttonGroupStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const editButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#2196f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  flex: "1"
};

const deleteButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  flex: "1"
};

const getMaintenanceButtonStyle = (status) => ({
  padding: "8px 12px",
  backgroundColor: status === "MAINTENANCE" ? "#4caf50" : "#ff9800",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  flex: "1"
});

export default AdminTableManagement;