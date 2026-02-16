import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../api/apiClient";

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    preparationTime: 5,
    available: true,
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  // ✅ Fetch menu items
  const fetchMenuItems = async () => {
    try {
      const res = await api.get("/admin/menu");
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  // ✅ Add or Update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category.toUpperCase());
      formData.append("preparationTime", newItem.preparationTime);
      if (file) formData.append("image", file);

      if (editingId) {
        await api.put(`/admin/menu/update/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Menu item updated successfully!");
      } else {
        await api.post("/admin/menu/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Menu item added successfully!");
      }

      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        preparationTime: 5,
        available: true,
      });
      setFile(null);
      setEditingId(null);
      fetchMenuItems();
    } catch (err) {
      console.error("❌ Error saving menu item:", err);
      alert("❌ Failed to save menu item. Check backend logs.");
    }
  };

  // ✅ Edit
  const handleEdit = (item) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      preparationTime: item.preparationTime,
      available: item.available,
    });
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/admin/menu/delete/${id}`);
      alert("🗑️ Menu item deleted.");
      fetchMenuItems();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // Get unique categories from menu items
  const categories = ["ALL", ...new Set(menuItems.map(item => item.category))];

  // Filter menu items by active category
  const filteredItems = activeCategory === "ALL" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return (
    <DashboardLayout title="Manage Menu Items">
      {/* ====== Form ====== */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Category (e.g., TEA, COFFEE, SNACKS)"
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
          required
          style={inputStyle}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={fileInputStyle}
        />
        <button type="submit" style={submitButtonStyle}>
          {editingId ? "Update Item" : "Add Item"}
        </button>
        
        {editingId && (
          <button 
            type="button" 
            onClick={() => {
              setEditingId(null);
              setNewItem({
                name: "",
                description: "",
                price: "",
                category: "",
                preparationTime: 5,
                available: true,
              });
              setFile(null);
            }}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
        )}
      </form>

      <div style={dividerStyle}></div>
      
      {/* ====== Category Tabs ====== */}
      <div style={tabsContainerStyle}>
        <h3 style={sectionTitleStyle}>Menu Categories</h3>
        <div style={tabsStyle}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                ...tabStyle,
                ...(activeCategory === category ? activeTabStyle : {})
              }}
            >
              {category}
              <span style={itemCountStyle}>
                ({category === "ALL" ? menuItems.length : menuItems.filter(item => item.category === category).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ====== Menu List ====== */}
      <div style={menuGridStyle}>
        {filteredItems.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyStateTextStyle}>
              {activeCategory === "ALL" 
                ? "No menu items found. Add your first item above!" 
                : `No items found in ${activeCategory} category.`}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} style={menuCardStyle}>
              {item.imageUrl && (
                <img
                  src={`http://localhost:8080/${
                    item.imageUrl.startsWith("uploads/")
                      ? item.imageUrl
                      : "uploads/menu/" + item.imageUrl
                  }`}
                  alt={item.name}
                  style={imageStyle}
                />
              )}
              <div style={cardContentStyle}>
                <div style={categoryBadgeStyle}>
                  {item.category}
                </div>
                <h4 style={itemNameStyle}>{item.name}</h4>
                <p style={itemDescriptionStyle}>{item.description}</p>
                <div style={itemDetailsStyle}>
                  <span style={priceStyle}>₹{item.price}</span>
                  <span style={timeStyle}>{item.preparationTime} mins</span>
                </div>
                <div style={buttonGroupStyle}>
                  <button onClick={() => handleEdit(item)} style={editButtonStyle}>
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={deleteButtonStyle}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

// Inline CSS Styles for Menu Management
const formStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
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

const fileInputStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "14px",
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

const dividerStyle = {
  height: "1px",
  backgroundColor: "#e0e0e0",
  margin: "20px 0"
};

const sectionTitleStyle = {
  color: "#333",
  marginBottom: "15px",
  fontSize: "20px",
  fontWeight: "600"
};

const tabsContainerStyle = {
  marginBottom: "25px"
};

const tabsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  padding: "10px 0"
};

const tabStyle = {
  padding: "10px 20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "white",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const activeTabStyle = {
  backgroundColor: "#4361ee",
  color: "white",
  borderColor: "#4361ee"
};

const itemCountStyle = {
  fontSize: "12px",
  opacity: "0.7"
};

const menuGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px"
};

const menuCardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: "1px solid #f0f0f0"
};

const imageStyle = {
  width: "100%",
  height: "200px",
  objectFit: "cover",
  borderRadius: "6px 6px 0 0"
};

const cardContentStyle = {
  padding: "16px",
  position: "relative"
};

const categoryBadgeStyle = {
  position: "absolute",
  top: "-10px",
  right: "16px",
  backgroundColor: "#4361ee",
  color: "white",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: "600"
};

const itemNameStyle = {
  margin: "0 0 8px 0",
  color: "#333",
  fontSize: "18px",
  fontWeight: "600"
};

const itemDescriptionStyle = {
  margin: "0 0 12px 0",
  color: "#666",
  fontSize: "14px",
  lineHeight: "1.4",
  minHeight: "40px"
};

const itemDetailsStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  gap: "10px"
};

const priceStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#4361ee"
};

const timeStyle = {
  fontSize: "12px",
  color: "#6c757d",
  backgroundColor: "#f8f9fa",
  padding: "4px 8px",
  borderRadius: "6px"
};

const buttonGroupStyle = {
  display: "flex",
  gap: "8px"
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

const emptyStateStyle = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "60px 20px",
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const emptyStateTextStyle = {
  color: "#666",
  fontSize: "16px",
  margin: "0"
};

export default AdminMenuManagement;