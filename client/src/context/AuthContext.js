import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Configure axios to send cookies
  axios.defaults.withCredentials = true;

  /**
   * Refresh access token using refresh token cookie
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  /**
   * Get current user info
   */
  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Fetch user failed:', error);
      setUser(null);
      return null;
    }
  }, []);

  /**
   * Initialize auth on app load
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token (will use httpOnly cookie)
        const token = await refreshAccessToken();
        
        if (token) {
          // Fetch user info
          await fetchUser();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshAccessToken, fetchUser]);

  /**
   * Setup axios interceptor for automatic token refresh on 401
   */
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await refreshAccessToken();
          
          if (newToken) {
            // Retry original request
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshAccessToken]);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  /**
   * Signup user
   */
  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  /**
   * Forgot password - send OTP
   */
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send OTP' 
      };
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      return { success: true, resetToken: response.data.resetToken };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid OTP' 
      };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email, newPassword, resetToken) => {
    try {
      const response = await axios.post('/api/auth/reset-password', { 
        email, 
        newPassword, 
        resetToken 
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    accessToken,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshAccessToken,
    forgotPassword,
    verifyOTP,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
