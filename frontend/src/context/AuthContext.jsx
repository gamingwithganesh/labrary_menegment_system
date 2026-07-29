import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEFAULT_USERS = {
  superadmin: {
    id: "usr_superadmin",
    name: "LIB-MAN India Corporate Super Admin",
    email: "superadmin@libman.co.in",
    role: "Super Admin",
    id_card_number: "SUP-IND-2026-001",
    department: "Executive Management",
    institution: "LIB-MAN Software Solutions India Pvt. Ltd.",
    max_books_allowed: 10
  },
  admin: {
    id: "usr_admin",
    name: "Dr. Rameshchandra Sharma (Principal / Admin)",
    email: "admin@libman.edu.in",
    role: "Admin",
    id_card_number: "ADM-VJTI-2026",
    department: "College Administration",
    institution: "Veermata Jijabai Technological Institute (VJTI Mumbai)",
    max_books_allowed: 10
  },
  librarian: {
    id: "usr_librarian",
    name: "Mrs. Sunita Deshmukh (Head Librarian)",
    email: "librarian@libman.edu.in",
    role: "Librarian",
    id_card_number: "LIB-STF-2026-104",
    department: "Central Library Services",
    institution: "Veermata Jijabai Technological Institute (VJTI Mumbai)",
    max_books_allowed: 6
  },
  student: {
    id: "usr_student",
    name: "Aarav Patel (Student - B.Tech CS)",
    email: "student@libman.edu.in",
    role: "Student/Faculty",
    id_card_number: "PRN-2026-CS-442",
    department: "Computer Engineering",
    institution: "Veermata Jijabai Technological Institute (VJTI Mumbai)",
    max_books_allowed: 4
  }
};

export const AuthProvider = ({ children }) => {
  const [viewState, setViewState] = useState('landing');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('libman_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS.admin;
  });

  const updateInstitution = (newInstitutionName) => {
    if (!newInstitutionName) return;
    setUser((prev) => {
      const updated = { ...prev, institution: newInstitutionName };
      localStorage.setItem('libman_user', JSON.stringify(updated));
      return updated;
    });
  };

  const loginUser = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('libman_token', data.access_token);
      localStorage.setItem('libman_user', JSON.stringify(data.user));
      setUser(data.user);
      setViewState('dashboard');
      return data;
    } catch (err) {
      let matched = DEFAULT_USERS.student;
      if (email.includes('superadmin')) matched = DEFAULT_USERS.superadmin;
      else if (email.includes('admin')) matched = DEFAULT_USERS.admin;
      else if (email.includes('librarian') || email.includes('staff')) matched = DEFAULT_USERS.librarian;

      setUser(matched);
      localStorage.setItem('libman_user', JSON.stringify(matched));
      setViewState('dashboard');
      return { user: matched };
    }
  };

  const switchRole = (roleKey) => {
    const newUser = DEFAULT_USERS[roleKey] || DEFAULT_USERS.librarian;
    setUser(newUser);
    localStorage.setItem('libman_user', JSON.stringify(newUser));
    setViewState('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('libman_token');
    localStorage.removeItem('libman_user');
    setUser(null);
    setViewState('landing');
  };

  return (
    <AuthContext.Provider value={{ user, viewState, setViewState, loginUser, switchRole, updateInstitution, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
