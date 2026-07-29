import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Building2, Plus, Users, CheckCircle, Server, Activity, Database, KeyRound, Globe, FileText, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const SuperAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    institution: 'St. Xavier College of Engineering',
    department: 'Library Administration',
    id_card_number: 'ADM-2026-088'
  });

  const loadAdmins = async () => {
    try {
      const data = await api.fetchJSON('/auth/users');
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.fetchJSON('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...adminForm, role: 'Admin' })
      });
      setShowAddAdmin(false);
      loadAdmins();
    } catch (err) {
      alert("Failed to register College Admin: " + err.message);
    }
  };

  const admins = users.filter((u) => u.role === 'Admin' || u.role === 'Super Admin');

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#a10053] bg-pink-100 px-3 py-1 rounded-full border border-pink-300 mb-2.5">
            <Shield className="w-4 h-4 text-[#a10053]" /> TIER 1: COMPANY VENDOR PORTAL
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Company & Vendor Super Admin</h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Provision new college client subscriptions, manage institution College Admins, and monitor SaaS ERP deployments.
          </p>
        </div>

        <button
          onClick={() => setShowAddAdmin(true)}
          className="px-6 py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-900/30 transition flex items-center gap-2 self-start md:self-auto border border-[#880045]"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white font-black">Provision New College Admin</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Subscribed Colleges" value="18" subtitle="Active ERP Institutional Clients" icon={Building2} color="yono" />
        <StatCard title="College Admins" value={admins.length.toString()} subtitle="Tier 2 Administrators" icon={Users} color="indigo" />
        <StatCard title="Global Cluster Uptime" value="99.98%" subtitle="SaaS SLA Standard" icon={Server} color="emerald" />
        <StatCard title="MongoDB Atlas DB" value="Connected" subtitle="mongodb://localhost:27017" icon={Database} color="amber" />
      </div>

      {/* Institutional Admins Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#a10053]" /> Provisioned Institution Admins & Colleges
            </h3>
            <p className="text-xs text-slate-600 font-bold mt-0.5">List of deployed college ERP accounts and designated administrators</p>
          </div>
          <span className="text-xs font-mono font-bold bg-pink-100 text-[#a10053] px-3 py-1 rounded-full border border-pink-300">
            {admins.length} Admins Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-900 uppercase font-mono text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 font-black">Institution / College</th>
                <th className="p-4 font-black">Designated Administrator</th>
                <th className="p-4 font-black">Email / User ID</th>
                <th className="p-4 font-black">ID Card No</th>
                <th className="p-4 font-black text-center">ERP Tier</th>
                <th className="p-4 font-black text-right">Subscription Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {admins.map((adm, idx) => (
                <tr key={idx} className="hover:bg-pink-50/50 transition">
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#a10053]" />
                      {adm.institution || 'Central College of Engineering'}
                    </div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">{adm.name}</td>
                  <td className="p-4 font-mono font-bold text-[#a10053]">{adm.email}</td>
                  <td className="p-4 font-mono text-slate-700">{adm.id_card_number}</td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-black bg-pink-100 text-[#a10053] border border-pink-300">
                      {adm.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-3 py-1 rounded-lg text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active Enterprise License
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Multi-Tenant Audit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#a10053]" /> Real-Time Database Connection
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-bold text-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-mono text-slate-900">MongoDB Atlas / Local Compass</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Connection URI:</span>
              <span className="font-mono text-[#a10053]">mongodb://localhost:27017/libman_db</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Collections:</span>
              <span className="font-mono text-slate-900">users, books, circulations, serials, mis_logs</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#a10053]" /> License Provisioning Guidelines
          </h3>
          <p className="text-xs text-slate-700 font-bold leading-relaxed">
            Super Admins represent the vendor enterprise. Provisions created here generate a Tier 2 College Admin account capable of appointing librarians and managing internal institution settings.
          </p>
        </div>
      </div>

      {/* Provision Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAdmin} className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#a10053]" /> Provision College Admin Account
              </h3>
              <button type="button" onClick={() => setShowAddAdmin(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-black font-black mb-1">College / Institution Name *</label>
                <input
                  type="text"
                  value={adminForm.institution}
                  onChange={(e) => setAdminForm({ ...adminForm, institution: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Email / User ID *</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Initial Password *</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAdmin(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">Provision Admin</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
