'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  BookPlus, 
  Repeat, 
  Newspaper, 
  BarChart3, 
  Building2, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  CreditCard,
  UserCheck,
  PackageCheck,
  Sliders
} from 'lucide-react';

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen, onOpenBtCard }) {
  const { activeTab, setActiveTab, user } = useAuth();

  const isStudentOrFaculty = user?.role === 'Student' || user?.role === 'Student/Faculty' || user?.role === 'Faculty' || user?.role === 'Staff';
  const isSuperAdmin = user?.role === 'Super Admin';
  const isCollegeAdmin = user?.role === 'Admin';

  let navItems = [];

  if (isStudentOrFaculty) {
    // 3rd Level: Student & Staff Portal
    navItems = [
      { id: 'btcard', label: 'My Digital BT Pass', icon: CreditCard, action: 'btcard' },
      { id: 'mybooks', label: 'My Issued Books & Loans', icon: BookOpen },
      { id: 'opac', label: 'OPAC Catalog & Holds', icon: Search }
    ];
  } else if (isSuperAdmin) {
    // 1st Level: Super Admin (SaaS Multi-Tenant Master)
    navItems = [
      { id: 'superadmin', label: 'Super Admin System', icon: ShieldAlert, badge: 'SaaS' }
    ];
  } else if (isCollegeAdmin) {
    // 2nd Level: College Admin / Principal (Governance, Appointing Librarians, Policies, Analytics)
    navItems = [
      { id: 'finepolicy', label: 'Fine Engine & Policies', icon: Sliders, badge: 'Rules' },
      { id: 'librarians', label: 'Librarian & Staff Users', icon: UserCheck, badge: 'Staff' },
      { id: 'mis', label: 'Executive MIS Analytics', icon: BarChart3, badge: 'Reports' },
      { id: 'opac', label: 'OPAC Catalog Overview', icon: Search }
    ];
  } else {
    // Operational Core: Librarian Desk
    navItems = [
      { id: 'circulation', label: 'Circulation Desk', icon: Repeat, badge: 'Issue Requests' },
      { id: 'cataloguing', label: 'Cataloguing & Accession', icon: BookPlus, badge: 'Catalog' },
      { id: 'btpasses', label: 'Student & Staff BT Passes', icon: CreditCard, badge: 'Passes' },
      { id: 'inventory', label: 'Stock Inventory Audit', icon: PackageCheck, badge: 'Audit' },
      { id: 'opac', label: 'OPAC Catalog Search', icon: Search },
      { id: 'serials', label: 'Serials & Periodicals', icon: Newspaper },
      { id: 'mis', label: 'Executive MIS Reports', icon: BarChart3 }
    ];
  }

  const handleTabClick = (item) => {
    if (item.action === 'btcard') {
      onOpenBtCard();
    } else {
      setActiveTab(item.id);
    }
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full py-5 px-3.5">
      <div className="mb-4 px-1.5">
        {user?.collegeName ? (
          <div className="mb-3 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100">
            <p className="text-[9px] font-extrabold uppercase text-indigo-700 tracking-wider">Campus Institution</p>
            <h3 className="text-xs font-bold text-slate-900 leading-tight mt-0.5" title={user.collegeName}>{user.collegeName}</h3>
            {user.collegeCode && <p className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">{user.collegeCode}</p>}
          </div>
        ) : null}
        
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {isStudentOrFaculty 
              ? 'Student / Staff' 
              : isSuperAdmin 
              ? 'SaaS Master' 
              : isCollegeAdmin 
              ? 'Principal Admin' 
              : 'Librarian Desk'}
          </h2>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold whitespace-nowrap">
            {user?.role || 'Guest'}
          </span>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && item.action !== 'btcard';
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'
                }`} />
                <span className="text-left leading-normal">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.badge && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Card */}
      <div className="mt-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold mb-0.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isStudentOrFaculty ? 'Digital BT Pass' : isSuperAdmin ? 'SaaS Master' : isCollegeAdmin ? 'Principal Governance' : 'Library System'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          {isStudentOrFaculty 
            ? 'Present digital pass for book issues & renewals.' 
            : isSuperAdmin
            ? 'Tenant, subscription & system controls.'
            : isCollegeAdmin
            ? 'Appoint librarians & configure fine policies.'
            : 'Active circulation & catalog management.'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-72 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-65px)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {navContent}
      </aside>
    </>
  );
}
