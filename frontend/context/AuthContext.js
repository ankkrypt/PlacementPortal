'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { getToken, setToken, removeToken, setUser, getUser, removeToken as clearAuth } from '@/lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const stored = getUser();

      if (stored && stored.id === decoded.id) {
        setUserState(stored);
      } else {
        // Fetch from API
        const res = await api.get('/auth/me');
        const userData = res.data.data;
        setUserState(userData);
        setUser(userData);
      }
    } catch (error) {
      clearAuth();
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data.data;
    setToken(token);
    setUser(userData);
    setUserState(userData);
    return userData;
  };

  const logout = () => {
    clearAuth();
    setUserState(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const getRedirectPath = (role) => {
    const paths = {
      student: '/student/dashboard',
      company: '/company/dashboard',
      admin: '/admin/dashboard',
      faculty: '/faculty/dashboard',
    };
    return paths[role] || '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getRedirectPath, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
