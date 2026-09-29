'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ShieldCheck,
  Search,
  Sparkles,
  CreditCard
} from 'lucide-react';

export function Navbar({ mobileMenuOpen, setMobileMenuOpen, onOpenBtCard }) {
  const { user, logout, activeTab, setActiveTab, viewState, setViewState } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => user ? setViewState('dashboard') : setViewState('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight gradient-text">
                  LIB-MAN
                </span>
                {user?.collegeName ? (
                  <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 truncate max-w-[280px]">
                    {user.collegeName}
                  </span>
                ) : (
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    PRO v2.0
                  </span>
                )}
              </div>
              {user?.collegeName && (
                <p className="text-[10px] font-medium text-slate-500 truncate max-w-[220px] sm:hidden">
                  {user.collegeName}
                </p>
              )}
            </div>
          </div>

          {/* Center search pill */}
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 w-64 cursor-pointer hover:border-indigo-500 transition-colors"
                 onClick={() => setActiveTab('opac')}>
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search OPAC catalog...</span>
              <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">⌘K</kbd>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* User Role Badge */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span className="text-xs font-medium text-slate-500">
                      {user.role} {user.collegeCode ? `• ${user.collegeCode}` : ''}
                    </span>
                  </div>
                </div>

                {/* Digital BT Card Pass Button (Only for Students/Faculty/Librarians, hidden for Super Admin) */}
                {user.role !== 'Super Admin' && (
                  <button
                    onClick={onOpenBtCard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all"
                    title="View Student BT Card Pass"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">My BT Pass</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-sm font-medium transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Mobile Menu Hamburger Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setViewState('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
