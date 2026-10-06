'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  BookOpen, 
  Search, 
  Repeat, 
  BarChart3, 
  ArrowRight,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';

export function LandingPage() {
  const { user, setViewState } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight gradient-text">
              LIB-MAN
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            {user ? (
              <button
                onClick={() => setViewState('dashboard')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Dashboard ({user.name})</span>
              </button>
            ) : (
              <button
                onClick={() => setViewState('login')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-4 shadow-sm">
            Library Management System
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Agnihotri Polytechnic <span className="gradient-text">Nagthana</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium">
            Fast cataloguing, real-time circulation tracking, borrower management, and executive analytics on any device.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setViewState(user ? 'dashboard' : 'login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{user ? 'Launch Library Portal' : 'Access Library Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">OPAC Catalog</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Instant search across titles, authors, categories, and shelf locations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Circulation Desk</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Quick issue, return, and renewals with automated fine tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Analytics & MIS</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Live reports on inventory holdings, active loans, and trends.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-500">
        Developed by Z INTECH Private Limited, Nagpur
      </footer>
    </div>
  );
}
