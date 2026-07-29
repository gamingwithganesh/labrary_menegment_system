import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, LogOut, Database, Sparkles, Home, Edit3, Check, Menu, X } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, switchRole, logout, setViewState, updateInstitution } = useAuth();
  const [isEditingCollege, setIsEditingCollege] = useState(false);
  const [collegeInput, setCollegeInput] = useState(user?.institution || 'Agnihotri College of Polytechnic, Naghthana Wardha');

  const handleCollegeSave = (e) => {
    e.preventDefault();
    updateInstitution(collegeInput);
    setIsEditingCollege(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-yono-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 hover:bg-[#a10053] hover:text-white transition"
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#a10053] flex items-center justify-center shadow-md shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">LIB-MAN<sup>®</sup></h1>
            <span className="hidden sm:flex text-[10px] uppercase font-extrabold tracking-widest bg-pink-100 text-[#a10053] border border-pink-300 px-2 py-0.5 rounded-full items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#a10053]" /> College ERP
            </span>
          </div>

          {/* Dynamic College Name Field */}
          {isEditingCollege ? (
            <form onSubmit={handleCollegeSave} className="flex items-center gap-1.5 mt-0.5">
              <input
                type="text"
                value={collegeInput}
                onChange={(e) => setCollegeInput(e.target.value)}
                className="bg-slate-100 border border-[#a10053] rounded px-2 py-0.5 text-xs text-black font-extrabold focus:outline-none"
                placeholder="Type College Name..."
                autoFocus
              />
              <button type="submit" className="p-1 bg-[#a10053] text-white rounded hover:bg-[#880045]">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-700 font-extrabold mt-0.5 group">
              <span className="text-[#a10053] font-black truncate max-w-[180px] sm:max-w-[320px]">
                {user?.institution || 'Agnihotri College of Polytechnic, Naghthana Wardha'}
              </span>
              <button
                onClick={() => {
                  setCollegeInput(user?.institution || 'Agnihotri College of Polytechnic, Naghthana Wardha');
                  setIsEditingCollege(true);
                }}
                className="opacity-60 group-hover:opacity-100 text-slate-500 hover:text-[#a10053] transition shrink-0"
                title="Edit College Name Dynamically"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Database & Desktop/Tablet Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mongo Compass Connection Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-yono-900 text-xs font-mono font-bold">
          <Database className="w-3.5 h-3.5 text-[#a10053] animate-pulse" />
          <span>mongodb://localhost:27017/libman_db</span>
        </div>

        {/* 4-Tier Role Switcher Bar (Responsive Hide on small screens) */}
        <div className="hidden sm:flex items-center bg-slate-100 border border-slate-300 rounded-lg p-1 text-xs">
          <span className="text-slate-700 font-extrabold px-1.5 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#a10053]" />
          </span>
          <button
            onClick={() => switchRole('superadmin')}
            className={`px-2 py-1 rounded-md font-extrabold transition text-[11px] ${user?.role === 'Super Admin' ? 'bg-[#a10053] text-white shadow-sm' : 'text-slate-800 hover:bg-slate-200'}`}
          >
            Super Admin
          </button>
          <button
            onClick={() => switchRole('admin')}
            className={`px-2 py-1 rounded-md font-extrabold transition text-[11px] ${user?.role === 'Admin' ? 'bg-[#a10053] text-white shadow-sm' : 'text-slate-800 hover:bg-slate-200'}`}
          >
            College Admin
          </button>
          <button
            onClick={() => switchRole('librarian')}
            className={`px-2 py-1 rounded-md font-extrabold transition text-[11px] ${user?.role === 'Librarian' || user?.role === 'Library Staff' ? 'bg-[#a10053] text-white shadow-sm' : 'text-slate-800 hover:bg-slate-200'}`}
          >
            Librarian
          </button>
          <button
            onClick={() => switchRole('student')}
            className={`px-2 py-1 rounded-md font-extrabold transition text-[11px] ${user?.role === 'Student/Faculty' ? 'bg-[#a10053] text-white shadow-sm' : 'text-slate-800 hover:bg-slate-200'}`}
          >
            Student
          </button>
        </div>

        {/* Home & Logout Buttons */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <button
            onClick={() => setViewState('landing')}
            title="Public Landing Page"
            className="p-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 transition font-bold"
          >
            <Home className="w-4 h-4 text-[#a10053]" />
          </button>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition font-bold"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
