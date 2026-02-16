// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RegisterPage from "./pages/RegisterPage";

// Admin Dashboard
import AdminHome from "./pages/Admin/AdminHome";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAuthPage from "./pages/Admin/AdminAuthPage";

// Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import CustomerBookTable from "./pages/Customer/CustomerBookTable";
import CustomerMenu from "./pages/Customer/CustomerMenu"; 
import CustomerOrders from "./pages/Customer/CustomerOrders";
import CustomerProfile from "./pages/Customer/CustomerProfile";

// Customer Feedback Pages
import FeedbackForm from "./pages/Customer/FeedbackForm";
import FeedbackHistory from "./pages/Customer/FeedbackHistory";

// Chef Pages
import ChefDashboard from "./pages/Chef/chefDashboard";
import ChefOrders from "./pages/Chef/ChefOrders";
import ChefProfile from "./pages/Chef/ChefProfile";

// Waiter Pages
import WaiterOrders from "./pages/Waiter/WaiterOrders";
import WaiterProfile from "./pages/Waiter/WaiterProfile"; // NEW: Add WaiterProfile import

// Payment Pages
import PaymentPage from "./pages/Payment/PaymentPage";
import OrderSuccess from "./pages/Payment/OrderSuccess";

// Admin Management
import AdminStaffManagement from "./pages/Admin/AdminStaffManagement";
import AdminMenuManagement from "./pages/Admin/AdminMenuManagement";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminTableManagement from "./pages/Admin/AdminTableManagement";
import FeedbackDashboard from "./pages/Admin/FeedbackDashboard";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/auth" element={<AdminAuthPage />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/tables"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminTableManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminStaffManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminMenuManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminCustomers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <FeedbackDashboard />
              </PrivateRoute>
            }
          />

          {/* CUSTOMER ROUTES */}
          <Route
            path="/customer"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <CustomerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/book-table"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <CustomerBookTable />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/menu"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <CustomerMenu />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <CustomerOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <CustomerProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/feedback"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <FeedbackForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/feedback-history"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <FeedbackHistory />
              </PrivateRoute>
            }
          />

          {/* PAYMENT ROUTES */}
          <Route
            path="/payment"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <PaymentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <PrivateRoute roles={["CUSTOMER"]}>
                <OrderSuccess />
              </PrivateRoute>
            }
          />

          {/* CHEF ROUTES */}
          <Route
            path="/chef"
            element={
              <PrivateRoute roles={["CHEF"]}>
                <ChefDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/chef/orders"
            element={
              <PrivateRoute roles={["CHEF"]}>
                <ChefOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/chef/profile"
            element={
              <PrivateRoute roles={["CHEF"]}>
                <ChefProfile />
              </PrivateRoute>
            }
          />

          {/* WAITER ROUTES */}
          <Route
            path="/waiter"
            element={
              <PrivateRoute roles={["WAITER"]}>
                <WaiterOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/waiter/orders"
            element={
              <PrivateRoute roles={["WAITER"]}>
                <WaiterOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/waiter/profile"
            element={
              <PrivateRoute roles={["WAITER"]}>
                <WaiterProfile />
              </PrivateRoute>
            }
          />

          {/* 404 NOT FOUND ROUTE */}
          <Route
            path="*"
            element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                background: '#fef7f0',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <h1 style={{ 
                  fontSize: '3rem', 
                  color: '#8b4513',
                  marginBottom: '1rem'
                }}>
                  404
                </h1>
                <p style={{ 
                  fontSize: '1.2rem', 
                  color: '#5d4037',
                  marginBottom: '2rem'
                }}>
                  Page Not Found
                </p>
                <a 
                  href="/"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #8b4513, #a0826d)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  Go Home
                </a>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;