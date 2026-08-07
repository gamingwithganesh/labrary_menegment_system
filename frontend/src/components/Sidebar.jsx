import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, BookPlus, Repeat, Newspaper, BarChart3, Layers, Shield, Building2, UserCheck, X } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, switchRole } = useAuth();
  const role = user?.role || 'Student/Faculty';

  const allNavItems = [
    {
      id: 'superadmin',
      label: 'Super Admin Workspace',
      subtitle: 'Company Vendor Management',
      icon: Shield,
      badge: 'Tier 1',
      roles: ['Super Admin']
    },
    {
      id: 'collegeadmin',
      label: 'College Admin Portal',
      subtitle: 'Librarians & Budget Management',
      icon: Building2,
      badge: 'Tier 2',
      roles: ['Super Admin', 'Admin']
    },
    {
      id: 'opac',
      label: 'OPAC Search Catalogue',
      subtitle: 'Online Public Access',
      icon: Search,
      badge: 'Public',
      roles: ['Super Admin', 'Admin', 'Librarian', 'Library Staff', 'Student/Faculty']
    },
    {
      id: 'cataloguing',
      label: 'Acquisition & Cataloguing',
      subtitle: 'Inventory & Vendor POs',
      icon: BookPlus,
      badge: 'Module 1',
      roles: ['Super Admin', 'Admin', 'Librarian', 'Library Staff']
    },
    {
      id: 'circulation',
      label: 'Circulation & Fines',
      subtitle: 'Issue, Return & Overdue',
      icon: Repeat,
      badge: 'Module 2',
      roles: ['Super Admin', 'Admin', 'Librarian', 'Library Staff', 'Student/Faculty']
    },
    {
      id: 'serials',
      label: 'Serial Control',
      subtitle: 'Journals & Newspapers',
      icon: Newspaper,
      badge: 'Module 4',
      roles: ['Super Admin', 'Admin', 'Librarian', 'Library Staff']
    },
    {
      id: 'mis',
      label: 'MIS Reports & Analytics',
      subtitle: 'Accession & Utilization',
      icon: BarChart3,
      badge: 'Module 5',
      roles: ['Super Admin', 'Admin', 'Librarian', 'Library Staff']
    }
  ];

  const filteredItems = allNavItems.filter((item) =>
    item.roles.some((r) => r.toLowerCase() === role.toLowerCase() || (role === 'Admin' && r === 'Admin'))
  );

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Responsive Drawer Container */}
      <aside
        className={`fixed lg:static top-[61px] bottom-0 left-0 z-50 w-full sm:w-80 lg:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 max-h-screen overflow-y-auto shadow-2xl lg:shadow-sm transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header Mobile Quick Role Selector Bar */}
          <div className="sm:hidden p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="text-[10px] font-black uppercase text-slate-500 flex items-center justify-between">
              <span>Switch Role (Mobile):</span>
              <Shield className="w-3.5 h-3.5 text-[#a10053]" />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] font-extrabold">
              <button
                onClick={() => switchRole('superadmin')}
                className={`py-1 rounded px-1.5 text-center ${user?.role === 'Super Admin' ? 'bg-[#a10053] text-white' : 'bg-white text-slate-900 border border-slate-300'}`}
              >
                Super Admin
              </button>
              <button
                onClick={() => switchRole('admin')}
                className={`py-1 rounded px-1.5 text-center ${user?.role === 'Admin' ? 'bg-[#a10053] text-white' : 'bg-white text-slate-900 border border-slate-300'}`}
              >
                College Admin
              </button>
              <button
                onClick={() => switchRole('librarian')}
                className={`py-1 rounded px-1.5 text-center ${user?.role === 'Librarian' || user?.role === 'Library Staff' ? 'bg-[#a10053] text-white' : 'bg-white text-slate-900 border border-slate-300'}`}
              >
                Librarian
              </button>
              <button
                onClick={() => switchRole('student')}
                className={`py-1 rounded px-1.5 text-center ${user?.role === 'Student/Faculty' ? 'bg-[#a10053] text-white' : 'bg-white text-slate-900 border border-slate-300'}`}
              >
                Student
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] uppercase font-black tracking-wider text-slate-500 px-3 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-yono-600" /> {role} Tools
            </h2>
            <nav className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#a10053] text-white shadow-md shadow-pink-900/20'
                        : 'text-slate-800 hover:bg-pink-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isActive ? 'bg-[#880045] text-white' : 'bg-pink-100 text-[#a10053]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-black ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {item.label}
                        </div>
                        <div className={`text-[10px] font-bold ${isActive ? 'text-pink-100' : 'text-slate-500'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Account Info Footer */}
        <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-extrabold">
            <span className="flex items-center gap-1.5 text-yono-900 font-black">
              <UserCheck className="w-3.5 h-3.5 text-[#a10053]" /> Active Session
            </span>
            <span className="text-[10px] bg-[#a10053] text-white px-1.5 py-0.5 rounded font-black">
              {role}
            </span>
          </div>
          <div className="text-slate-900 font-black text-[11px] truncate">{user?.name}</div>
          <div className="text-[10px] text-slate-600 font-mono font-bold truncate">{user?.email}</div>
        </div>
      </aside>
    </>
  );
};
