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
  CreditCard
} from 'lucide-react';

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen, onOpenBtCard }) {
  const { activeTab, setActiveTab, user } = useAuth();

  const isStudentOrFaculty = user?.role === 'Student' || user?.role === 'Student/Faculty' || user?.role === 'Faculty';
  const isSuperAdmin = user?.role === 'Super Admin';

  let navItems = [];

  if (isStudentOrFaculty) {
    // Restricted Student / Faculty Navigation (BT Pass is Position #1)
    navItems = [
      { id: 'btcard', label: 'My BT Card Pass', icon: CreditCard, badge: 'Student Pass', action: 'btcard' },
      { id: 'mybooks', label: 'My Issued Books', icon: BookOpen, badge: 'Active Loans' },
      { id: 'opac', label: 'OPAC Catalog Search', icon: Search, badge: 'Public Catalog' }
    ];
  } else if (isSuperAdmin) {
    // Clean Super Admin SaaS Master Navigation (College operations removed)
    navItems = [
      { id: 'superadmin', label: 'Super Admin System', icon: ShieldAlert, badge: 'SaaS Master' },
      { id: 'collegeadmin', label: 'College Admin Portal', icon: Building2, badge: 'Governance' }
    ];
  } else {
    // Librarian & College Admin Navigation
    navItems = [
      { id: 'opac', label: 'OPAC Catalog', icon: Search, badge: 'Catalog' },
      { id: 'cataloguing', label: 'Cataloguing & Procurement', icon: BookPlus, badge: 'Accession' },
      { id: 'circulation', label: 'Circulation Desk', icon: Repeat, badge: 'Issue/Return' },
      { id: 'serials', label: 'Serial Control', icon: Newspaper, badge: 'Journals' },
      { id: 'mis', label: 'Executive MIS Analytics', icon: BarChart3, badge: 'Reports' }
    ];

    if (user?.role === 'Admin') {
      navItems.push({ id: 'collegeadmin', label: 'College Admin Portal', icon: Building2, badge: 'Settings' });
    }
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
    <div className="flex flex-col h-full py-4 px-3">
      <div className="mb-4 px-3">
        {user?.collegeName ? (
          <div className="mb-2.5 p-2 rounded-xl bg-indigo-50/80 border border-indigo-100">
            <p className="text-[9px] font-extrabold uppercase text-indigo-700 tracking-wider">Campus Institution</p>
            <h3 className="text-xs font-bold text-slate-900 truncate" title={user.collegeName}>{user.collegeName}</h3>
            {user.collegeCode && <p className="text-[10px] font-mono text-slate-500 font-semibold">{user.collegeCode}</p>}
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isStudentOrFaculty ? 'Student Portal' : isSuperAdmin ? 'SaaS Control Panel' : 'Staff Operations'}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
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
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'
                }`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge && !isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Card */}
      <div className="mt-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold mb-0.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isStudentOrFaculty ? 'Digital BT Pass' : isSuperAdmin ? 'SaaS Master' : 'Library System'}</span>
        </div>
        <p className="text-[11px] text-slate-500">
          {isStudentOrFaculty 
            ? 'Present your digital pass for book issues.' 
            : isSuperAdmin
            ? 'Tenant, subscription & system controls.'
            : 'Active campus library operations.'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-65px)]">
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
