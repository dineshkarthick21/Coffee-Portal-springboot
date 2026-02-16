import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "../customer.css";

const CustomerMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [addedItemId, setAddedItemId] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});
  
  // New states for categories and search
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);

  // Show toast notification
  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Load menu from backend
  const loadMenu = async () => {
    try {
      setLoadingMenu(true);
      const res = await api.get("/customer/menu");
      const menuData = res.data;
      setMenu(menuData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(menuData.map(item => item.category).filter(Boolean))];
      setCategories(['all', ...uniqueCategories]);
      
      // Initialize quantities for all menu items
      const initialQuantities = {};
      menuData.forEach(item => {
        initialQuantities[item.id] = 1;
      });
      setItemQuantities(initialQuantities);
    } catch (err) {
      console.error("Menu load error:", err);
      showToastMessage("❌ Error loading menu. Please try again.");
    } finally {
      setLoadingMenu(false);
    }
  };

  // Load recent orders
  const loadRecentOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get(`/customer/orders/${user.id}`);
      setRecentOrders(res.data.slice(0, 3));
    } catch (err) {
      console.error("Recent orders load error:", err);
      showToastMessage("❌ Error loading recent orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Filter menu items based on category and search
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group menu items by category for display
  const menuByCategory = filteredMenu.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Update quantity for a menu item
  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // Cart functions
  const addToCart = (item) => {
    const quantity = itemQuantities[item.id] || 1;
    
    if (quantity < 1) {
      showToastMessage("⚠️ Please select at least 1 quantity");
      return;
    }

    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(cart.map((c) => 
        c.id === item.id 
          ? { ...c, qty: c.qty + quantity } 
          : c
      ));
    } else {
      setCart([...cart, { ...item, qty: quantity }]);
    }
    
    // Show toast and highlight the added item
    setAddedItemId(item.id);
    showToastMessage(`✅ Added ${quantity} ${item.name}${quantity > 1 ? 's' : ''} to cart!`);
    
    // Reset quantity to 1 after adding to cart
    updateItemQuantity(item.id, 1);
    
    // Reset highlight after 2 seconds
    setTimeout(() => {
      setAddedItemId(null);
    }, 2000);
  };

  const removeFromCart = (id) => {
    const item = cart.find((c) => c.id === id);
    setCart(cart.filter((c) => c.id !== id));
    if (item) {
      showToastMessage(`🗑️ Removed ${item.name} from cart`);
    }
  };

  const incrementCart = (id) => {
    setCart(cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)));
  };

  const decrementCart = (id) => {
    setCart(
      cart
        .map((c) => c.id === id ? { ...c, qty: Math.max(1, c.qty - 1) } : c)
        .filter((c) => c.qty > 0)
    );
  };

  // ✅ UPDATED: Checkout - Now redirects to payment page
  const checkout = async () => {
    if (cart.length === 0) {
      showToastMessage("⚠️ Cart is empty");
      return;
    }

    try {
      const payload = {
        userId: user.id,
        specialInstructions: specialInstructions,
        orderItems: cart.map((c) => ({
          menuItemId: c.id,
          quantity: c.qty,
          specialInstructions: ""
        })),
      };

      const res = await api.post("/customer/order", payload);
      const orderData = res.data;
      
      showToastMessage("✅ Order Created! Redirecting to payment...");
      
      // ✅ Redirect to payment page with order data
      setTimeout(() => {
        navigate('/payment', { 
          state: { 
            orderData: {
              id: orderData.id,
              totalAmount: orderData.totalAmount,
              items: cart,
              specialInstructions: specialInstructions,
              user: user
            }
          }
        });
      }, 1500);
      
    } catch (err) {
      console.error("Checkout error:", err);
      showToastMessage("❌ Cannot place order: " + (err.response?.data?.message || err.message));
    }
  };

  // Get status color
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

  // Clear cart
  const clearCart = () => {
    if (cart.length > 0) {
      setCart([]);
      showToastMessage("🗑️ Cart cleared");
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Coffee': '☕',
      'Tea': '🍵',
      'Beverages': '🥤',
      'Appetizers': '🍤',
      'Main Course': '🍛',
      'Desserts': '🍰',
      'Snacks': '🍟',
      'Breakfast': '🥞',
      'Lunch': '🍽️',
      'Dinner': '🍲'
    };
    return icons[category] || '🍴';
  };

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${user.id}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    loadMenu();
    loadRecentOrders();
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
  }, [cart, user.id]);

  return (
    <DashboardLayout title="Menu & Orders">
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "50px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            fontWeight: "600"
          }}>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: "2px solid rgba(139, 69, 19, 0.2)",
        paddingBottom: '1rem'
      }}>
        <button
          className={`btn ${activeTab === "menu" ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab("menu")}
        >
          🍕 Browse Menu
        </button>
        <button
          className={`btn ${activeTab === "orders" ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab("orders")}
        >
          📋 Recent Orders
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        display: "flex", 
        gap: '2rem',
        minHeight: '500px'
      }}>
        
        {/* LEFT COLUMN - CONTENT BASED ON ACTIVE TAB */}
        <div style={{ 
          flex: activeTab === "menu" ? 2 : 1,
          minWidth: 0
        }}>
          {activeTab === "menu" ? (
            /* MENU CONTENT */
            <div>
              {/* Search and Filter Section */}
              <div style={{
                background: 'linear-gradient(135deg, #fff8f0 0%, #f5ebe0 100%)',
                border: '2px solid rgba(139, 69, 19, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 15px rgba(139, 69, 19, 0.1)'
              }}>
                {/* Search Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    position: 'relative',
                    maxWidth: '500px'
                  }}>
                    <input
                      type="text"
                      placeholder="🔍 Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        border: '2px solid rgba(139, 69, 19, 0.3)',
                        borderRadius: '50px',
                        fontSize: '1rem',
                        background: '#ffffff',
                        color: '#5d4037',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '1.2rem',
                      color: '#8b4513'
                    }}>
                      🔍
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#8b4513',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      marginRight: '0.5rem'
                    }}>
                      Categories:
                    </span>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: `2px solid ${selectedCategory === category ? '#8b4513' : 'rgba(139, 69, 19, 0.3)'}`,
                          borderRadius: '25px',
                          background: selectedCategory === category 
                            ? 'linear-gradient(135deg, #8b4513, #a0826d)' 
                            : 'rgba(255, 255, 255, 0.8)',
                          color: selectedCategory === category ? '#ffffff' : '#5d4037',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {category !== 'all' && getCategoryIcon(category)}
                        {category === 'all' ? '🍽️ All Items' : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 style={{ 
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                color: '#8b4513',
                marginBottom: '1.5rem'
              }}>
                {selectedCategory === 'all' ? '☕ Our Menu' : `${getCategoryIcon(selectedCategory)} ${selectedCategory}`}
                <span style={{
                  fontSize: '1rem',
                  color: '#a0826d',
                  marginLeft: '1rem',
                  fontWeight: 'normal'
                }}>
                  ({filteredMenu.length} items)
                </span>
              </h3>

              {loadingMenu ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p className="loading-text">Loading menu...</p>
                </div>
              ) : filteredMenu.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3 className="empty-state-title">No Menu Items Found</h3>
                  <p className="empty-state-description">
                    {searchTerm 
                      ? `No items found for "${searchTerm}"${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}`
                      : `No items available${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}`
                    }
                  </p>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      style={{ marginTop: '1rem' }}
                    >
                      Show All Items
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {/* Group by Category */}
                  {Object.entries(menuByCategory).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: '3rem' }}>
                      {selectedCategory === 'all' && (
                        <h4 style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '1.5rem',
                          color: '#8b4513',
                          marginBottom: '1rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '2px solid rgba(139, 69, 19, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {getCategoryIcon(category)} {category}
                          <span style={{
                            fontSize: '1rem',
                            color: '#a0826d',
                            fontWeight: 'normal'
                          }}>
                            ({items.length} items)
                          </span>
                        </h4>
                      )}
                      
                      <div className="menu-grid">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className="menu-item"
                            style={{
                              animation: addedItemId === item.id ? 'highlightPulse 2s ease-in-out' : 'none',
                              border: addedItemId === item.id ? '2px solid #22c55e' : '2px solid rgba(139, 69, 19, 0.15)'
                            }}
                          >
                            {/* Menu Item Image */}
                            <div style={{
                              width: '100%',
                              height: '200px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              marginBottom: '1rem',
                              background: 'linear-gradient(135deg, #f5ebe0, #e6d5c3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {item.imageUrl ? (
                                <img
                                  src={`http://localhost:8080/${
                                    item.imageUrl.startsWith("uploads/")
                                      ? item.imageUrl
                                      : "uploads/menu/" + item.imageUrl
                                  }`} 
                                  alt={item.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div style={{
                                display: item.imageUrl ? 'none' : 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#8b4513',
                                fontSize: '3rem'
                              }}>
                                {getCategoryIcon(item.category)}
                                <span style={{
                                  fontSize: '0.8rem',
                                  marginTop: '0.5rem',
                                  color: '#a0826d'
                                }}>
                                  No Image
                                </span>
                              </div>
                            </div>
                            
                            <div className="menu-item-content">
                              <div className="menu-item-header">
                                <h4 className="menu-item-name">
                                  {item.name}
                                </h4>
                                <div className="menu-item-price">
                                  ₹{item.price}
                                </div>
                              </div>
                              
                              {item.description && (
                                <p className="menu-item-description">
                                  {item.description}
                                </p>
                              )}
                              
                              {item.preparationTime && (
                                <div className="menu-item-prep-time">
                                  ⏱️ {item.preparationTime} mins
                                </div>
                              )}

                              {/* Quantity Selector for Menu Item */}
                              <div className="menu-item-actions">
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '1rem',
                                  justifyContent: 'space-between',
                                  width: '100%'
                                }}>
                                  <label style={{ 
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                  }}>
                                    Quantity:
                                  </label>
                                  <div className="quantity-controls">
                                    <button 
                                      className="quantity-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateItemQuantity(item.id, Math.max(1, (itemQuantities[item.id] || 1) - 1));
                                      }}
                                    >
                                      −
                                    </button>
                                    <span className="quantity-display">
                                      {itemQuantities[item.id] || 1}
                                    </span>
                                    <button 
                                      className="quantity-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateItemQuantity(item.id, (itemQuantities[item.id] || 1) + 1);
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                className="btn btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                style={{ 
                                  width: '100%', 
                                  marginTop: '1rem'
                                }}
                              >
                                {addedItemId === item.id ? '✓ Added!' : `🛒 Add ${itemQuantities[item.id] || 1} to Cart`}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ORDERS CONTENT */
            <div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: '1.5rem' 
              }}>
                <h3 style={{ 
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  color: '#8b4513',
                  margin: 0
                }}>
                  📦 Recent Orders
                </h3>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate("/customer/orders")}
                >
                  View All Orders
                </button>
              </div>

              {loadingOrders ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p className="loading-text">Loading orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3 className="empty-state-title">No Recent Orders</h3>
                  <p className="empty-state-description">
                    You haven't placed any orders yet.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab("menu")}
                    style={{ marginTop: '1rem' }}
                  >
                    Start Your First Order
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="order-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/customer/order/${order.id}`)}
                    >
                      <div className="order-header">
                        <div>
                          <div className="order-id">Order #{order.id}</div>
                          <div className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}
                          </div>
                        </div>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - CART (ONLY ON MENU TAB) */}
        {activeTab === "menu" && (
          <div className="cart-container">
            <div className="cart-header">
              <h3 className="cart-title">
                🛒 Your Cart ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button 
                  className="btn btn-clear"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: '2rem 0', opacity: 0.7 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#8b4513' }}>🛒</div>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#5d4037' }}>Your cart is empty</p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(93, 64, 55, 0.7)' }}>
                  Add items from the menu to get started
                </p>
              </div>
            ) : (
              <div>
                {/* Cart Items */}
                <div className="cart-items">
                  {cart.map((c) => (
                    <div key={c.id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">
                          {c.name}
                        </div>
                        <div className="cart-item-price">
                          ₹{c.price} × {c.qty} = ₹{(c.price * c.qty).toFixed(2)}
                        </div>
                      </div>
                      <div className="cart-item-quantity">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn"
                            onClick={() => decrementCart(c.id)}
                          >
                            −
                          </button>
                          <span className="quantity-display">
                            {c.qty}
                          </span>
                          <button 
                            className="quantity-btn"
                            onClick={() => incrementCart(c.id)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-danger"
                          onClick={() => removeFromCart(c.id)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.9rem', 
                    color: '#8b4513', 
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontWeight: '600'
                  }}>
                    Special Instructions:
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests, allergies, or preferences..."
                    className="form-textarea"
                  />
                </div>

                {/* Cart Total & Checkout */}
                <div className="cart-summary">
                  <div className="summary-row">
                    <span className="summary-label">Subtotal:</span>
                    <span className="summary-value">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Total:</span>
                    <span className="summary-value">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="cart-actions">
                    {/* ✅ UPDATED: Button now says "Proceed to Payment" */}
                    <button
                      className="btn btn-checkout"
                      onClick={checkout}
                    >
                      💳 Proceed to Payment (₹{cartTotal.toFixed(2)})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes highlightPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CustomerMenu;