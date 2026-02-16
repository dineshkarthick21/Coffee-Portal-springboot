import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  console.log("=== PrivateRoute Check ===");
  console.log("User:", user);
  console.log("Loading:", loading);
  console.log("Required roles:", roles);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log("❌ No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    console.log(`❌ User role ${user.role} not authorized. Required: ${roles.join(', ')}`);
    return <Navigate to="/" replace />;
  }

  console.log("✅ Access granted");
  return children;
};

export default PrivateRoute;