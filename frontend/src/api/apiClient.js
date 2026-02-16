import axios from 'axios';

// Use environment variable or default to production backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://coffee-portal.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token and user ID
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 API Request Interceptor - URL:', config.url);
    console.log('🔐 Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added to request');
    } else {
      console.warn('❌ No token found in localStorage');
    }
    
    // ADD THIS: Get user ID and add to feedback requests
    if (config.url.includes('/feedback')) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        
        if (userId) {
          config.headers['X-User-Id'] = userId;
          console.log('✅ Added X-User-Id header:', userId);
        } else {
          console.error('❌ No user ID found for feedback request!');
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
    
    console.log('🔐 Full headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    const originalRequest = error.config;
    
    // Only handle 401 errors if we have a token (otherwise it's expected)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = localStorage.getItem('token');
      
      // If no token exists, don't try to refresh - let React Router handle redirect
      if (!token) {
        console.log('401 error but no token - letting auth handle it');
        return Promise.reject(error);
      }
      
      console.log('🔄 Attempting token refresh...');
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('http://localhost:8080/api/auth/refresh', {
            refreshToken: refreshToken
          });
          
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          // Store new tokens
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          console.log('✅ Token refreshed successfully, retrying request');
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          console.log('No refresh token available');
          // Clear storage but let React Router handle redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear storage but let React Router handle redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Don't force redirect here - let PrivateRoute handle it
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;