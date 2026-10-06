'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { exportToExcel } from '@/lib/export-excel';
import { copyToClipboard } from '@/lib/clipboard';
import { 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  Settings, 
  Key, 
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Save, 
  MapPin, 
  Upload, 
  Clock, 
  Calendar, 
  ClipboardList, 
  Sliders, 
  Users, 
  IndianRupee, 
  BookOpen, 
  Sparkles, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Copy, 
  Check, 
  KeyRound, 
  Shield, 
  Mail, 
  User as UserIcon, 
  AlertTriangle, 
  Search, 
  UserX, 
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';

export function AdminModule({ defaultTab = 'settings' }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState(defaultTab); // 'settings' | 'users' | 'import' | 'audit'
  
  // Appoint User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Librarian');
  const [dept, setDept] = useState('Central Library');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [appointedOfficerCreds, setAppointedOfficerCreds] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Officer Management & Deletion State
  const [officerSearch, setOfficerSearch] = useState('');
  const [officerToDelete, setOfficerToDelete] = useState(null);
  const [isDeletingOfficer, setIsDeletingOfficer] = useState(false);

  // Settings & Fine Policy State
  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Agnihotri Polytechnic Nagthana');
  const [collegeCode, setCollegeCode] = useState(user?.collegeCode || 'APN-WARDHA');
  const [principalName, setPrincipalName] = useState(user?.name || 'Principal');
  const [location, setLocation] = useState('Nagthana, Wardha');
  const [libraryName, setLibraryName] = useState('Central Technical Knowledge Resource Center');
  const [finePerDay, setFinePerDay] = useState(10);
  const [gracePeriod, setGracePeriod] = useState(2);
  const [maxFineCap, setMaxFineCap] = useState(500);
  const [studentLimit, setStudentLimit] = useState(5);
  const [facultyLimit, setFacultyLimit] = useState(10);
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [workingHours, setWorkingHours] = useState('8:00 AM - 8:00 PM');
  const [savingSettings, setSavingSettings] = useState(false);

  // Bulk Import State
  const [userJsonText, setUserJsonText] = useState('');
  const [importSummary, setImportSummary] = useState(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Sync with defaultTab prop changes from sidebar navigation
  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getMembers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = 'Lib@';
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += Math.floor(10 + Math.random() * 90);
    setPassword(generated);
  };

  const handleCopyCredentials = async (creds) => {
    const text = `Institutional Library Officer Login Credentials\n=========================================\nFull Name: ${creds.name}\nRole: ${creds.role}\nDepartment / Desk: ${creds.department}\nLogin ID / Email: ${creds.email}\nPassword: ${creds.password}\n\nSign in at: Portal Login\n=========================================`;
    await copyToClipboard(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const loadSettings = async () => {
    try {
      const s = await api.getSettings();
      if (s) {
        if (s.finePerDay) setFinePerDay(s.finePerDay);
        if (s.gracePeriodDays) setGracePeriod(s.gracePeriodDays);
        if (s.maxFinePerBook) setMaxFineCap(s.maxFinePerBook);
        if (s.maxBorrowStudent) setStudentLimit(s.maxBorrowStudent);
        if (s.maxBorrowFaculty) setFacultyLimit(s.maxBorrowFaculty);
        if (s.academicYear) setAcademicYear(s.academicYear);
        if (s.libraryName) setLibraryName(s.libraryName);
        if (s.workingHours) setWorkingHours(s.workingHours);
      }
      const logs = await api.getAuditLogs();
      if (Array.isArray(logs)) setAuditLogs(logs);
    } catch (e) {
      console.error('Failed to load settings or logs:', e);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const finalPassword = password.trim() || 'admin123';
    if (finalPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    try {
      await api.createUser({
        name: name.trim(),
        email: email.trim(),
        role,
        department: dept,
        collegeName: user?.collegeName || collegeName,
        collegeCode: user?.collegeCode || collegeCode,
        collegeId: user?.collegeId || '',
        password: finalPassword
      });
      setAppointedOfficerCreds({
        name: name.trim(),
        email: email.trim(),
        role,
        department: dept,
        password: finalPassword,
        createdAt: new Date().toLocaleTimeString()
      });
      setMsg(`Staff member "${name}" registered with role ${role}.`);
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => setMsg(''), 5000);
      loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.updateSettings({
        collegeCode: user?.collegeCode || collegeCode,
        libraryName,
        finePerDay: Number(finePerDay),
        gracePeriodDays: Number(gracePeriod),
        maxFinePerBook: Number(maxFineCap),
        maxBorrowStudent: Number(studentLimit),
        maxBorrowFaculty: Number(facultyLimit),
        academicYear,
        workingHours
      });
      setMsg(`Policies and fine rules saved successfully!`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleBulkImportUsers = async () => {
    setErrorMsg('');
    try {
      const parsed = JSON.parse(userJsonText);
      const res = await api.bulkImport('users', Array.isArray(parsed) ? parsed : [parsed]);
      setImportSummary(res);
      setMsg(res.message || 'Users imported');
      loadUsers();
    } catch (e) {
      setErrorMsg('Invalid JSON array of user objects.');
    }
  };

  const handleConfirmDeleteOfficer = async () => {
    if (!officerToDelete) return;
    setIsDeletingOfficer(true);
    setErrorMsg('');
    try {
      const id = officerToDelete.id || officerToDelete._id;
      await api.deleteUser(id);
      setMsg(`Appointment for "${officerToDelete.name}" (${officerToDelete.role}) has been revoked and removed.`);
      setOfficerToDelete(null);
      setTimeout(() => setMsg(''), 5000);
      loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete officer');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsDeletingOfficer(false);
    }
  };

  const handleExportStaffExcel = () => {
    if (!librariansList.length) {
      setErrorMsg('No staff records to export.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const columns = [
      { header: 'Officer ID', key: 'id' },
      { header: 'Full Name', key: 'name' },
      { header: 'Login Email', key: 'email' },
      { header: 'Role Authority', key: 'role' },
      { header: 'Department / Desk', key: 'department' },
      { header: 'Institution', key: 'collegeName' },
      { header: 'College Code', key: 'collegeCode' },
      { header: 'Status', key: 'status' }
    ];

    const data = librariansList.map((u) => ({
      id: u.id || u._id || 'N/A',
      name: u.name || 'Unnamed',
      email: u.email || '',
      role: u.role || 'Staff',
      department: u.department || 'Central Stack',
      collegeName: u.collegeName || collegeName,
      collegeCode: u.collegeCode || collegeCode,
      status: u.isArchived ? 'Inactive' : 'Active'
    }));

    exportToExcel({
      filename: `Library_Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`,
      columns,
      data
    });
  };

  const handleExportAuditLogsExcel = () => {
    if (!auditLogs.length) {
      setErrorMsg('No audit logs to export.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const columns = [
      { header: 'Log ID', key: 'id' },
      { header: 'Action Event', key: 'action' },
      { header: 'Actor Role', key: 'userRole' },
      { header: 'Operation Details', key: 'details' },
      { header: 'Date & Time', key: 'timestamp' }
    ];

    const data = auditLogs.map((l) => ({
      id: l.id || l._id || 'N/A',
      action: l.action || 'ACTIVITY',
      userRole: l.userRole || 'System',
      details: l.details || '',
      timestamp: new Date(l.timestamp || l.createdAt || Date.now()).toLocaleString()
    }));

    exportToExcel({
      filename: `Library_Audit_Trails_${new Date().toISOString().slice(0, 10)}.csv`,
      columns,
      data
    });
  };

  const librariansList = users.filter(u => (u.role === 'Librarian' || u.role === 'Staff') && !u.isArchived);
  const filteredLibrarians = librariansList.filter(u => {
    if (!officerSearch.trim()) return true;
    const term = officerSearch.toLowerCase().trim();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term)) ||
      ((u.id || u._id) && String(u.id || u._id).toLowerCase().includes(term))
    );
  });
  const allBorrowersList = users.filter(u => (u.role === 'Student' || u.role === 'Faculty') && !u.isArchived);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Campus Principal Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fine Engine & Institutional Policy Controls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campus fine rules, borrowing quotas, appoint librarians, and inspect audit trails.
          </p>
        </div>

        {/* Sub-tab Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeSubTab === 'settings'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fine Rules & Policies
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'users'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Librarians ({librariansList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeSubTab === 'import'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk User Import
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeSubTab === 'audit'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trails
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Policy Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Daily Fine Rate</p>
            <h3 className="text-xl font-black text-rose-600 mt-0.5">₹{finePerDay} / day</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{gracePeriod} Days Grace Period</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Borrow Quota</p>
            <h3 className="text-xl font-black text-indigo-600 mt-0.5">{studentLimit} / {facultyLimit}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Student / Faculty Limit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Academic Session</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{academicYear}</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Current Active Year</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Appointed Librarians</p>
            <h3 className="text-xl font-black text-purple-600 mt-0.5">{librariansList.length} Officers</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Library Desk Staff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: FINE ENGINE & POLICIES */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fine Rules Matrix */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Fine Engine & Circulation Limits</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Set daily overdue rates, grace periods, and book loan limits.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Overdue Fine Per Day (₹)</label>
                  <input
                    type="number"
                    required
                    value={finePerDay}
                    onChange={(e) => setFinePerDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-black text-rose-600 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default rate charged per overdue day</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grace Period Threshold (Days)</label>
                  <input
                    type="number"
                    required
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Days allowed before fines start</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Maximum Fine Cap Per Book (₹)</label>
                  <input
                    type="number"
                    value={maxFineCap}
                    onChange={(e) => setMaxFineCap(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Upper ceiling for accumulated fines</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Max Borrow Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={studentLimit}
                    onChange={(e) => setStudentLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Simultaneous active loans for students</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty Max Borrow Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={facultyLimit}
                    onChange={(e) => setFacultyLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Simultaneous active loans for professors</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Active Academic Session</label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-black text-indigo-700 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">e.g. 2026-27</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Apply Institutional Policies'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Campus Operating Rules Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Library Operating Schedule</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Working Hours</span>
                </div>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold text-xs"
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-2">
                <span className="font-extrabold text-[10px] uppercase text-indigo-700 tracking-wider block">Institutional Profile</span>
                <p className="font-bold text-slate-900">{collegeName}</p>
                <p className="text-[11px] text-slate-500 font-mono">Code: {collegeCode}</p>
                <p className="text-[11px] text-slate-600">Principal / Incharge: <strong className="text-slate-900">{principalName}</strong></p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 mt-4">
              💡 Fines are automatically calculated during circulation return based on these active rules.
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LIBRARIAN & STAFF APPOINTMENTS */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Newly Generated Credentials Card (if an officer was just appointed) */}
          {appointedOfficerCreds && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/30 shadow-xl shadow-indigo-950/30 animate-fadeIn relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black text-white tracking-wide">
                      Library Officer Appointed & Login Credentials Issued
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Share these login credentials with <strong className="text-white">{appointedOfficerCreds.name}</strong> to sign in to the Library Portal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCredentials(appointedOfficerCreds)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied to Clipboard!' : 'Copy Login Details'}</span>
                  </button>
                  <button
                    onClick={() => setAppointedOfficerCreds(null)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Staff Name</span>
                  <span className="font-bold text-white text-xs">{appointedOfficerCreds.name}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Role Authority</span>
                  <span className="font-bold text-indigo-300 text-xs">{appointedOfficerCreds.role}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Login ID / Email</span>
                  <span className="font-mono font-bold text-amber-300 text-xs break-all">{appointedOfficerCreds.email}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Login Password</span>
                    <span className="font-mono font-bold text-emerald-300 text-xs">{appointedOfficerCreds.password}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await copyToClipboard(appointedOfficerCreds.password);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    title="Copy Password Only"
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appoint Librarian Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>Appoint Library Officer</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create librarian credentials with custom password to grant circulation and catalog management access.
                </p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                {/* Name */}
                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Librarian Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Login ID / Email */}
                <div>
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Login ID / Official Email</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Used to Sign In</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="librarian@apnwardha.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Password Creation Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Create Account Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Set login password (e.g. Lib@APN2026)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Minimum 4 characters. The librarian will use their Login ID & this password to sign in.
                  </p>
                </div>

                {/* Role and Branch */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Role Authority</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-indigo-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Librarian">Librarian</option>
                      <option value="Staff">Library Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Desk / Branch</label>
                    <input
                      type="text"
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      placeholder="e.g. Central Stack"
                      className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Appoint Officer & Issue Login</span>
                </button>
              </form>
            </div>

            {/* Active Librarians List */}
            <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Appointed Library Officers & Staff ({librariansList.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized staff members with login credentials for operational workflows.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search officers..."
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-52"
                    />
                    {officerSearch && (
                      <button
                        onClick={() => setOfficerSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleExportStaffExcel}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                    title="Export Staff to Excel / CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export Staff</span>
                  </button>

                  <button 
                    onClick={loadUsers} 
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shrink-0"
                    title="Refresh appointed staff list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {librariansList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-600" />
                  <p className="font-bold text-slate-700">No Librarians Appointed Yet</p>
                  <p className="mt-0.5">Use the form on the left to appoint your first campus librarian.</p>
                </div>
              ) : filteredLibrarians.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                  <UserX className="w-8 h-8 mx-auto opacity-30 text-slate-500" />
                  <p className="font-bold text-slate-700">No officers found matching &quot;{officerSearch}&quot;</p>
                  <button
                    onClick={() => setOfficerSearch('')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Staff Name</th>
                        <th className="p-3">Login ID / Email</th>
                        <th className="p-3">Role Authority</th>
                        <th className="p-3">Library Desk</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLibrarians.map((u) => (
                        <tr key={u.id || u._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{u.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id || u._id || 'OFFICER'}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 font-semibold">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              u.role === 'Librarian'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{u.department || 'Central Stack'}</td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setOfficerToDelete(u)}
                              className="p-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 transition-all font-bold text-xs inline-flex items-center gap-1.5 shadow-sm hover:shadow"
                              title={`Revoke appointment for ${u.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BULK USER IMPORT */}
      {activeSubTab === 'import' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Mass Student & Faculty Enrollment (JSON/CSV)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Paste a JSON array of student or faculty profiles to bulk enroll them with active digital BT Passes into the system.
          </p>

          <textarea
            rows="7"
            placeholder='[ { "name": "Aditya Rao", "email": "aditya@apnwardha.edu", "role": "Student", "department": "Computer Science" }, { "name": "Prof. Meera Joshi", "email": "meera@apnwardha.edu", "role": "Faculty", "department": "Physics" } ]'
            value={userJsonText}
            onChange={(e) => setUserJsonText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleBulkImportUsers}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25"
          >
            Process Bulk Enrollment
          </button>

          {importSummary && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-emerald-700 font-bold">Successful: {importSummary.data?.successful}</span> • 
              <span className="text-rose-700 font-bold ml-2">Failed: {importSummary.data?.failed}</span>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: AUDIT TRAILS */}
      {activeSubTab === 'audit' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <span>Immutable Institutional Audit Trail ({auditLogs.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed activity logs tracking administrative events, loan transactions, and policy updates.
              </p>
            </div>

            <button
              onClick={handleExportAuditLogsExcel}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 self-start sm:self-auto"
              title="Export Audit Trail to Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Actor Role</th>
                  <th className="p-3">Operation Details</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-indigo-600">{log.action}</td>
                    <td className="p-3 text-slate-700">{log.userRole}</td>
                    <td className="p-3 font-sans text-slate-800">{log.details}</td>
                    <td className="p-3 text-slate-500">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revoke Appointment & Delete Officer Confirmation Modal */}
      {officerToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Revoke Officer Appointment</h3>
                  <p className="text-xs text-slate-500">Remove library officer credentials</p>
                </div>
              </div>
              <button
                onClick={() => setOfficerToDelete(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Officer Name:</span>
                <span className="font-bold text-slate-900">{officerToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Login ID / Email:</span>
                <span className="font-mono font-bold text-slate-800">{officerToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Role Authority:</span>
                <span className="font-bold text-indigo-700">{officerToDelete.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Desk:</span>
                <span className="font-medium text-slate-700">{officerToDelete.department || 'Central Stack'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
              ⚠️ <strong>Warning:</strong> Revoking this appointment will permanently remove this officer from the active staff directory and immediately terminate their portal login privileges.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingOfficer}
                onClick={() => setOfficerToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Keep Officer
              </button>
              <button
                type="button"
                disabled={isDeletingOfficer}
                onClick={handleConfirmDeleteOfficer}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeletingOfficer ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke & Delete Officer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
