import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/apiClient";

// Create context first
const AuthContext = createContext();

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      console.log("=== INITIALIZING AUTH ===");
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const userData = localStorage.getItem("user");
      
      console.log("Token exists:", !!token);
      console.log("RefreshToken exists:", !!refreshToken);
      console.log("UserData exists:", !!userData);
      
      if (!token) {
        console.log("No token found, user not authenticated");
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        console.log("Token expiry:", new Date(decoded.exp * 1000));
        console.log("Current time:", new Date(currentTime * 1000));
        console.log("Token expired:", decoded.exp < currentTime);
        
        if (decoded.exp < currentTime) {
          console.log("Token expired, attempting refresh...");
          
          // Try to refresh token if we have a refresh token
          if (refreshToken) {
            refreshAuthToken(refreshToken)
              .then(newToken => {
                console.log("✅ Token refreshed successfully");
              })
              .catch(error => {
                console.log("❌ Token refresh failed, logging out:", error);
                logout();
              })
              .finally(() => {
                setLoading(false);
              });
            return;
          } else {
            console.log("No refresh token available, logging out");
            logout();
            setLoading(false);
            return;
          }
        }

        console.log("Token valid, restoring user session");
        
        // Use stored user data or decode from token
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log("✅ User restored from localStorage:", parsedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error("Error parsing user data:", e);
            // Fallback to token data
            const userFromToken = {
              id: decoded.userId,
              email: decoded.sub,
              role: decoded.role,
              name: decoded.name,
            };
            console.log("✅ User restored from token:", userFromToken);
            setUser(userFromToken);
          }
        } else {
          const userFromToken = {
            id: decoded.userId,
            email: decoded.sub,
            role: decoded.role,
            name: decoded.name,
          };
          console.log("✅ User restored from token:", userFromToken);
          localStorage.setItem("user", JSON.stringify(userFromToken));
          setUser(userFromToken);
        }
      } catch (error) {
        console.error("❌ Token validation error:", error);
        logout();
      } finally {
        setLoading(false);
      }
      
      console.log("=== AUTH INITIALIZATION COMPLETE ===");
    };

    initializeAuth();

    // Listen for storage changes (e.g., when apiClient clears tokens)
    const handleStorageChange = (e) => {
      console.log("=== STORAGE CHANGE DETECTED ===", e.key);
      
      // If token was removed, log out
      if (e.key === 'token' && !e.newValue) {
        console.log("Token removed from storage, logging out user");
        setUser(null);
      }
      
      // If user data was removed, log out
      if (e.key === 'user' && !e.newValue) {
        console.log("User data removed from storage, logging out user");
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Refresh token method
  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await api.post("/auth/refresh", { refreshToken });
      const { token, refreshToken: newRefreshToken, id, name, email, role } = response.data;
      
      // Store new tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify({ id, name, email, role }));
      
      // Update user state
      setUser({ id, name, email, role });
      
      console.log("Token refreshed successfully");
      return token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  // Accept refresh token and user data
  const login = (token, refreshToken, userData = null) => {
    console.log("=== LOGIN CALLED ===");
    console.log("Token received:", !!token);
    console.log("RefreshToken received:", !!refreshToken);
    console.log("UserData received:", userData);
    
    // Store tokens
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("Setting user from userData:", userData);
      setUser(userData);
    } else {
      // Fallback to decoding token
      try {
        const decoded = jwtDecode(token);
        const userFromToken = {
          id: decoded.userId,
          email: decoded.sub,
          role: decoded.role,
          name: decoded.name,
        };
        localStorage.setItem("user", JSON.stringify(userFromToken));
        console.log("Setting user from token:", userFromToken);
        setUser(userFromToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    
    console.log("=== LOGIN COMPLETE ===");
  };

  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Get current token (for API calls)
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>Loading...</div>
        <small>Checking authentication...</small>
      </div>
    );
  }

  const value = {
    user,
    login,
    logout,
    loading,
    refreshAuthToken,
    isAuthenticated,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ FIXED: Export ONLY as named exports (remove default export)
export { AuthContext, AuthProvider };