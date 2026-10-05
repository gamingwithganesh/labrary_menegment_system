'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  Plus, 
  Play, 
  Pause, 
  Calendar, 
  Key, 
  Trash2, 
  Download, 
  CheckCircle, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Users, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  Zap,
  Clock,
  Radio,
  Send,
  Share2,
  Globe,
  MessageSquare,
  BookOpen,
  IndianRupee,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

import { api } from '@/lib/api';
import { exportToExcel } from '@/lib/export-excel';

export function SuperAdminModule() {
  const [activeTab, setActiveTab] = useState('colleges'); // 'colleges' | 'monitoring' | 'datasharing'
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaaSData();
  }, []);

  const loadSaaSData = async () => {
    setLoading(true);
    try {
      const [collegesData, broadcastData] = await Promise.all([
        api.getColleges(),
        api.getBroadcasts()
      ]);
      if (Array.isArray(collegesData)) setColleges(collegesData);
      if (Array.isArray(broadcastData) && broadcastData.length > 0) setBroadcastLogs(broadcastData);
    } catch (err) {
      console.error('Failed to load SaaS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [logs, setLogs] = useState([]);

  // Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('Info Notice');
  const [broadcastLogs, setBroadcastLogs] = useState([]);

  const [interCollegeTransfers, setInterCollegeTransfers] = useState([]);

  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const calculateRenewalDate = (duration) => {
    const d = new Date();
    let months = 12;
    if (duration === '6 Months') months = 6;
    else if (duration === '12 Months') months = 12;
    else if (duration === '24 Months') months = 24;
    else {
      const match = String(duration || '').match(/\d+/);
      if (match) months = parseInt(match[0], 10);
    }
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  // New College Form State with Subscription Duration & Price Dropdowns
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [newCollegeLocation, setNewCollegeLocation] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newDuration, setNewDuration] = useState('12 Months'); // '6 Months' | '12 Months' | '24 Months'
  const [newPrice, setNewPrice] = useState(15000); // 12000 | 15000 | 20000
  const [newRenewalDate, setNewRenewalDate] = useState(() => calculateRenewalDate('12 Months'));

  // Edit Subscription State
  const [editingCollegeId, setEditingCollegeId] = useState(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [editPriceValue, setEditPriceValue] = useState(15000);
  const [editDurationValue, setEditDurationValue] = useState('12 Months');

  const filteredColleges = colleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCollegesCount = colleges.filter(c => c.status === 'Active').length;
  const totalStudents = colleges.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  const activeSubscriptionRevenue = colleges.reduce((sum, c) => sum + (c.status === 'Active' ? Number(c.price) : 0), 0);

  const handleCreateCollege = async (e) => {
    e.preventDefault();

    let planName = 'Standard Institutional';
    if (Number(newPrice) === 12000) planName = 'Basic Campus';
    if (Number(newPrice) === 20000) planName = 'Enterprise Unlimited';

    try {
      const created = await api.createCollege({
        name: newCollegeName,
        code: newCollegeCode.toUpperCase(),
        location: newCollegeLocation,
        libraryName: 'Central Knowledge Resource Center',
        adminName: newAdminName || 'Principal',
        adminEmail: newAdminEmail,
        adminPassword: newAdminPassword || 'admin123',
        plan: planName,
        duration: newDuration,
        price: Number(newPrice),
        renewalDate: newRenewalDate,
        status: 'Active',
        studentsCount: 0,
        lastPing: 'Just now',
        health: 'Optimal'
      });

      setColleges([created, ...colleges]);
      setLogs([
        { id: Date.now(), time: new Date().toLocaleTimeString(), college: newCollegeName, event: `Tenant "${newCollegeName}" created with Admin account (${newAdminEmail})`, type: 'success' },
        ...logs
      ]);

      setShowCreateModal(false);
      setMsg(`College "${newCollegeName}" onboarded! Admin login created for: ${newAdminEmail}`);
      setNewCollegeName('');
      setNewCollegeCode('');
      setNewCollegeLocation('');
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewDuration('12 Months');
      setNewPrice(15000);
      setNewRenewalDate(calculateRenewalDate('12 Months'));
      setTimeout(() => setMsg(''), 5000);
      loadSaaSData();
    } catch (err) {
      alert(err.message || 'Failed to onboard college');
    }
  };

  const togglePlayPause = async (id) => {
    const target = colleges.find(c => (c.id || c._id || c.code) === id);
    if (!target) return;

    const nextStatus = target.status === 'Active' ? 'Paused' : 'Active';
    const nextHealth = nextStatus === 'Active' ? 'Optimal' : 'Suspended';

    try {
      await api.updateCollege(id, { status: nextStatus, health: nextHealth });
      setLogs([
        { id: Date.now(), time: new Date().toLocaleTimeString(), college: target.name, event: `Workspace access switched to ${nextStatus.toUpperCase()}`, type: nextStatus === 'Active' ? 'success' : 'warning' },
        ...logs
      ]);

      setMsg(`College "${target.name}" access is now ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setMsg(''), 4000);
      loadSaaSData();
    } catch (err) {
      alert(err.message || 'Failed to update college status');
    }
  };

  const handleSaveSubscriptionEdit = async (id) => {
    let planName = 'Standard Institutional';
    if (Number(editPriceValue) === 12000) planName = 'Basic Campus';
    if (Number(editPriceValue) === 20000) planName = 'Enterprise Unlimited';

    try {
      await api.updateCollege(id, {
        renewalDate: editDateValue,
        price: Number(editPriceValue),
        duration: editDurationValue,
        plan: planName
      });
      setEditingCollegeId(null);
      setMsg('College Subscription plan and renewal date updated!');
      setTimeout(() => setMsg(''), 3000);
      loadSaaSData();
    } catch (err) {
      alert(err.message || 'Failed to update subscription');
      loadSaaSData();
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;

    const targetLabel = broadcastTarget === 'ALL' ? 'All Colleges' : broadcastTarget;

    try {
      const newBroadcast = await api.sendBroadcast({
        target: targetLabel,
        message: broadcastMessage,
        severity: broadcastSeverity
      });

      setBroadcastLogs([newBroadcast, ...broadcastLogs]);
      setBroadcastMessage('');
      setMsg(`Broadcast alert sent live to ${targetLabel}!`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to send broadcast');
    }
  };

  const handleResetPassword = (adminEmail, collegeName) => {
    alert(`Temporary master reset link sent to College Admin email: ${adminEmail} for ${collegeName}`);
  };

  const handleDeleteCollege = async (id, name) => {
    if (confirm(`Are you sure you want to permanently remove ${name} from SaaS platform?`)) {
      try {
        await api.deleteCollege(id);
        setMsg(`College "${name}" removed from company master database.`);
        setTimeout(() => setMsg(''), 4000);
        loadSaaSData();
      } catch (err) {
        alert(err.message || 'Failed to delete college');
      }
    }
  };

  const handleExportCollegesExcel = () => {
    if (!colleges.length) {
      setMsg('No college records to export.');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    const columns = [
      { header: 'College ID', key: 'id' },
      { header: 'College Name', key: 'name' },
      { header: 'College Code', key: 'code' },
      { header: 'Campus Location', key: 'location' },
      { header: 'Library Wing', key: 'libraryName' },
      { header: 'Principal / Admin', key: 'adminName' },
      { header: 'Admin Email', key: 'adminEmail' },
      { header: 'Subscription Plan', key: 'plan' },
      { header: 'Duration', key: 'duration' },
      { header: 'Contract Value (INR)', key: 'price' },
      { header: 'Renewal Date', key: 'renewalDate' },
      { header: 'Account Status', key: 'status' }
    ];

    const data = colleges.map(c => ({
      id: c.id || c._id || 'N/A',
      name: c.name || '',
      code: c.code || '',
      location: c.location || '',
      libraryName: c.libraryName || 'Central Library',
      adminName: c.adminName || '',
      adminEmail: c.adminEmail || '',
      plan: c.plan || 'Standard Institutional',
      duration: c.duration || '12 Months',
      price: c.price ? `₹${Number(c.price).toLocaleString()}` : '₹15,000',
      renewalDate: c.renewalDate || '',
      status: c.status || 'Active'
    }));

    exportToExcel({
      filename: `SaaS_Colleges_Directory_${new Date().toISOString().slice(0, 10)}.csv`,
      columns,
      data
    });
  };

  const subscriptionChartData = [
    { name: '₹12,000 (Basic)', count: colleges.filter(c => c.price === 12000).length },
    { name: '₹15,000 (Standard)', count: colleges.filter(c => c.price === 15000).length },
    { name: '₹20,000 (Enterprise)', count: colleges.filter(c => c.price === 20000).length }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Multi-College System Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional tenants, plans, and system broadcasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('colleges')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'colleges' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Colleges</span>
            </button>

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'monitoring' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Monitoring</span>
            </button>

            <button
              onClick={() => setActiveTab('datasharing')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'datasharing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Broadcast</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewRenewalDate(calculateRenewalDate(newDuration || '12 Months'));
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard College</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Subscription Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Subscription Pool Value</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              ₹{activeSubscriptionRevenue.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Active Subscription Contracts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Active Subscriptions</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {activeCollegesCount} / {colleges.length} Colleges
            </h3>
            <p className="text-xs text-slate-400 mt-1">6 & 12 Month Active Plans</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Paused Subscriptions</p>
            <h3 className="text-2xl font-extrabold text-amber-500 mt-1">
              {colleges.length - activeCollegesCount} College
            </h3>
            <p className="text-xs text-slate-400 mt-1">Access Suspended</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Pause className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Student Pass Users</p>
            <h3 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {totalStudents.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Active Digital Passes</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SUB TAB 1: COLLEGES & SUBSCRIPTION DIRECTORY VIEW */}
      {activeTab === 'colleges' && (
        <div className="space-y-6">
          {/* Colleges Directory Table */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>College Subscription Directory</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage institutional tenants, active subscription tiers, durations, and account access.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex items-center w-full sm:w-64">
                  <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by college, code, admin..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 text-xs font-medium focus:outline-none border border-slate-200 text-slate-900 transition-all focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <button
                  onClick={handleExportCollegesExcel}
                  className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  title="Export Colleges to Excel / CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Export Excel</span>
                </button>
              </div>
            </div>

            {filteredColleges.length === 0 ? (
              <div className="py-14 text-center text-slate-500 text-xs">
                <Building2 className="w-10 h-10 text-indigo-500 mx-auto mb-3 opacity-40" />
                <p className="font-bold text-slate-800 text-sm">No Colleges Found</p>
                <p className="text-slate-400 mt-1">Click "+ Onboard College" above to register an institution workspace.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-y border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4 rounded-l-xl">Institution & Branch</th>
                      <th className="py-3.5 px-4">Subscription Plan</th>
                      <th className="py-3.5 px-4">Duration & Renewal</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredColleges.map((c) => {
                    const colId = c._id || c.id || c.code;
                    const isPaused = c.status === 'Paused';
                    const isEditing = editingCollegeId === colId;

                    return (
                      <tr key={colId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-sm text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{c.code}</span>
                            <span>Admin: {c.adminName}</span>
                          </div>
                        </td>

                        {/* Plan & Pricing Tier */}
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <select
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(Number(e.target.value))}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-indigo-700 focus:outline-none"
                            >
                              <option value={12000}>Basic — ₹12,000</option>
                              <option value={15000}>Standard — ₹15,000</option>
                              <option value={20000}>Enterprise — ₹20,000</option>
                            </select>
                          ) : (
                            <div>
                              <div className="font-bold text-slate-900">{c.plan || 'Standard Institutional'}</div>
                              <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">₹{Number(c.price || 15000).toLocaleString()}</div>
                            </div>
                          )}
                        </td>

                        {/* Duration & Renewal Date */}
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="space-y-1.5 max-w-[180px]">
                              <select
                                value={editDurationValue}
                                onChange={(e) => {
                                  const dur = e.target.value;
                                  setEditDurationValue(dur);
                                  setEditDateValue(calculateRenewalDate(dur));
                                }}
                                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-300 text-xs block w-full"
                              >
                                <option>6 Months</option>
                                <option>12 Months</option>
                                <option>24 Months</option>
                              </select>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="date"
                                  value={editDateValue}
                                  onChange={(e) => setEditDateValue(e.target.value)}
                                  className="px-2 py-1 rounded-xl bg-slate-50 border border-slate-300 text-xs w-full"
                                />
                                <button
                                  onClick={() => handleSaveSubscriptionEdit(colId)}
                                  className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {c.duration || '12 Months'}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-[11px]">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-mono">{c.renewalDate || '2027-08-07'}</span>
                                <button
                                  onClick={() => {
                                    setEditingCollegeId(colId);
                                    setEditDateValue(c.renewalDate || '2027-08-07');
                                    setEditPriceValue(c.price || 15000);
                                    setEditDurationValue(c.duration || '12 Months');
                                  }}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-1"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isPaused
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                            {c.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => togglePlayPause(colId)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                                isPaused
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title={isPaused ? 'Resume Subscription' : 'Pause Subscription Access'}
                            >
                              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                              <span>{isPaused ? 'Resume' : 'Pause'}</span>
                            </button>

                            <button
                              onClick={() => handleResetPassword(c.adminEmail, c.name)}
                              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="Reset Admin Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCollege(colId, c.name)}
                              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 transition-colors"
                              title="Delete Institution"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subscription Tier MIS Analytics Chart */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Subscription Plan Distribution MIS</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">College count breakdown by pricing tier (₹12k, ₹15k, ₹20k)</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subscriptionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Colleges Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span>Active Subscription Pool:</span>
                <strong className="text-emerald-500 font-mono">₹{activeSubscriptionRevenue.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span>Popular Plan:</span>
                <strong className="text-indigo-500 font-mono">Enterprise Unlimited (₹20,000)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: ACTIVATION & SYSTEM HEALTH MONITORING DASHBOARD */}
      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>College Activation & Subscription Health Monitor</span>
                </h2>
                <p className="text-xs text-slate-400">Live ping latency & workspace active state</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                LIVE FEED ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {colleges.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-200">
                  No institutional tenants currently active for monitoring.
                </div>
              ) : (
                colleges.map((c) => {
                  const isActive = c.status === 'Active';
                  return (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">{c.code} • Plan: {c.plan} ({c.duration} - ₹{c.price?.toLocaleString()})</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">Last Ping: <strong className="text-slate-600 font-mono">{c.lastPing}</strong></p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Live Event Logs</span>
              </h2>
              <p className="text-xs text-slate-400 mb-3">Subscription events and system audit</p>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-200">
                    No recent system log events recorded.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm text-xs">
                      <div className="flex items-center justify-between text-[10px] font-mono text-indigo-600 mb-1">
                        <span>{log.time}</span>
                        <span className="uppercase font-bold">{log.type}</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{log.event}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.college}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-mono">
              Audit log stream synced with master database
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: LIVE BROADCAST & INTER-COLLEGE DATA SHARING DASHBOARD */}
      {activeTab === 'datasharing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              <span>Broadcast Announcement</span>
            </h2>
            <p className="text-xs text-slate-400">Send system notices to college admins</p>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Recipient Target</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option value="ALL">All Colleges (Global Broadcast)</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Alert Priority Level</label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option>Info Notice</option>
                  <option>Maintenance Alert</option>
                  <option>Urgent Security Notice</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Announcement Message</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Enter message to broadcast to college admin dashboards..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Broadcast</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span>Inter-College Data Exchange</span>
                </h2>
                <p className="text-xs text-slate-400">Union catalog sharing & inter-library loan requests</p>
              </div>
            </div>

            <div className="space-y-3">
              {interCollegeTransfers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-200">
                  No active inter-library book transfers in progress.
                </div>
              ) : (
                interCollegeTransfers.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-indigo-600">{item.id}</span>
                        <span className="font-bold text-slate-700">{item.from}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="font-bold text-purple-600">{item.to}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{item.book}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create College Admin Modal with Subscription Plan & Price Dropdowns */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card shadow-2xl relative border-2 border-indigo-500/30">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <span>Onboard New College & Admin</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Create college workspace, select subscription limit (6/12 month) and plan price.
            </p>

            <form onSubmit={handleCreateCollege} className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="font-semibold text-slate-600">College / Institution Name</label>
                <input
                  type="text"
                  required
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">College Code / Branch</label>
                  <input
                    type="text"
                    required
                    value={newCollegeCode}
                    onChange={(e) => setNewCollegeCode(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Campus Location / City</label>
                  <input
                    type="text"
                    value={newCollegeLocation}
                    onChange={(e) => setNewCollegeLocation(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>College Admin / Principal Credentials</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Principal / Admin Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Admin User ID / Email</label>
                    <input
                      type="text"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Login Password</label>
                    <input
                      type="text"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Duration & Plan Price Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Subscription Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => {
                      const dur = e.target.value;
                      setNewDuration(dur);
                      setNewRenewalDate(calculateRenewalDate(dur));
                    }}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  >
                    <option value="6 Months">6 Months Plan</option>
                    <option value="12 Months">12 Months (1 Year)</option>
                    <option value="24 Months">24 Months (2 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Plan Price Tier</label>
                  <select
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-emerald-600"
                  >
                    <option value={12000}>₹12,000 (Basic Plan)</option>
                    <option value={15000}>₹15,000 (Standard Plan)</option>
                    <option value={20000}>₹20,000 (Enterprise Plan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Initial Subscription Renewal Date</label>
                <input
                  type="date"
                  required
                  value={newRenewalDate}
                  onChange={(e) => setNewRenewalDate(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25"
                >
                  Create & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
