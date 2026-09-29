'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [viewState, setViewState] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [activeTab, setActiveTab] = useState('opac');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const savedToken = localStorage.getItem('libman_token');
        const savedUser = localStorage.getItem('libman_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setViewState('dashboard');
          
          if (parsedUser.role === 'Super Admin') setActiveTab('superadmin');
          else if (parsedUser.role === 'Admin') setActiveTab('collegeadmin');
          else setActiveTab('opac');
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('libman_token', data.access_token);
    localStorage.setItem('libman_user', JSON.stringify(data.user));
    setViewState('dashboard');

    if (data.user.role === 'Super Admin') setActiveTab('superadmin');
    else if (data.user.role === 'Admin') setActiveTab('collegeadmin');
    else setActiveTab('opac');

    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors during logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('libman_token');
    localStorage.removeItem('libman_user');
    setViewState('landing');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      viewState,
      setViewState,
      activeTab,
      setActiveTab,
      loading,
      login,
      logout
    }}>
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
