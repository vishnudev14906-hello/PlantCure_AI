import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('plantcure_access_token') || localStorage.getItem('leafcure_access_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage or fetch profile
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('plantcure_user') || localStorage.getItem('leafcure_user');
      const savedToken = localStorage.getItem('plantcure_access_token') || localStorage.getItem('leafcure_access_token');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh profile in background
          const resp = await api.get('/api/user/profile/');
          setUser(resp.data);
          localStorage.setItem('plantcure_user', JSON.stringify(resp.data));
        } catch (err) {
          console.warn('Could not refresh user session profile');
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth expiration events from Axios interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      toast.warning('Your session has expired. Please log in again.');
    };

    window.addEventListener('plantcure:auth_expired', handleAuthExpired);
    window.addEventListener('leafcure:auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('plantcure:auth_expired', handleAuthExpired);
      window.removeEventListener('leafcure:auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login/', credentials);
      const { user: userData, tokens } = response.data;

      localStorage.setItem('plantcure_access_token', tokens.access);
      localStorage.setItem('plantcure_refresh_token', tokens.refresh);
      localStorage.setItem('plantcure_user', JSON.stringify(userData));

      setToken(tokens.access);
      setUser(userData);
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail || error.response?.data?.message || 'Login failed. Please verify your credentials.';
      toast.error(detail);
      return { success: false, error: detail };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/api/auth/register/', formData);
      const { user: userData, tokens } = response.data;

      localStorage.setItem('plantcure_access_token', tokens.access);
      localStorage.setItem('plantcure_refresh_token', tokens.refresh);
      localStorage.setItem('plantcure_user', JSON.stringify(userData));

      setToken(tokens.access);
      setUser(userData);
      toast.success('Account created successfully! Welcome to PlantCure.');
      return { success: true };
    } catch (error) {
      let errorMsg = 'Registration failed. Please check form errors.';
      if (error.response?.data) {
        const errs = error.response.data;
        if (typeof errs === 'object') {
          const firstKey = Object.keys(errs)[0];
          const val = errs[firstKey];
          errorMsg = Array.isArray(val) ? val[0] : String(val);
        }
      }
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await api.post('/api/auth/google/', googleData);
      const { user: userData, tokens } = response.data;

      localStorage.setItem('plantcure_access_token', tokens.access);
      localStorage.setItem('plantcure_refresh_token', tokens.refresh);
      localStorage.setItem('plantcure_user', JSON.stringify(userData));

      setToken(tokens.access);
      setUser(userData);
      toast.success(`Signed in with Google as ${userData.email}`);
      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail || 'Google sign-in failed.';
      toast.error(detail);
      return { success: false, error: detail };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('plantcure_refresh_token') || localStorage.getItem('leafcure_refresh_token');
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout/', { refresh: refreshToken });
      } catch (err) {
        console.warn('Backend token blacklist error:', err);
      }
    }
    localStorage.removeItem('plantcure_access_token');
    localStorage.removeItem('plantcure_refresh_token');
    localStorage.removeItem('plantcure_user');
    localStorage.removeItem('leafcure_access_token');
    localStorage.removeItem('leafcure_refresh_token');
    localStorage.removeItem('leafcure_user');
    setUser(null);
    setToken(null);
    toast.info('You have been logged out.');
  };

  const updateProfile = async (formData) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await api.put('/api/user/profile/', formData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('plantcure_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      return { success: true, user: updatedUser };
    } catch (error) {
      const detail = error.response?.data?.detail || 'Failed to update profile.';
      toast.error(detail);
      return { success: false, error: detail };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await api.post('/api/user/change-password/', passwordData);
      toast.success(response.data.message || 'Password changed successfully!');
      return { success: true };
    } catch (error) {
      let detail = 'Password change failed.';
      if (error.response?.data) {
        const d = error.response.data;
        const key = Object.keys(d)[0];
        detail = Array.isArray(d[key]) ? d[key][0] : d[key];
      }
      toast.error(detail);
      return { success: false, error: detail };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
