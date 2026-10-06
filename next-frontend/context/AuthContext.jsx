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

  // When a user visits the app, always start fresh on the Landing Page and require password login
  useEffect(() => {
    setMounted(true);
    // Clear any stale persistent tokens so password is asked each visit
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('libman_token');
        localStorage.removeItem('libman_user');
      } catch {}
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('libman_token', data.access_token);
        sessionStorage.setItem('libman_user', JSON.stringify(data.user));
        localStorage.setItem('libman_token', data.access_token);
        localStorage.setItem('libman_user', JSON.stringify(data.user));
      } catch {}
    }
    setViewState('dashboard');

    if (data.user.role === 'Super Admin') setActiveTab('superadmin');
    else setActiveTab('opac');

    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors during logout
    }
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('libman_token');
        sessionStorage.removeItem('libman_user');
        localStorage.removeItem('libman_token');
        localStorage.removeItem('libman_user');
      } catch {}
    }
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
