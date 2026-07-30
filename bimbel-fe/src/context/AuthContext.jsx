import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse auth_user:', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const { access_token, user: userData } = response.data?.data || {};

      if (!access_token || !userData) {
        throw new Error('Response data login tidak valid.');
      }

      // Save to localStorage FIRST before state update
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);

      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Login gagal. Periksa kembali email dan password.';
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const isAdmin = user?.role === 'admin';
  const isGuru = user?.role === 'guru';

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, isAdmin, isGuru }}>
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
