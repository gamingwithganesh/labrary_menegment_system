'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { exportToExcel } from '@/lib/export-excel';
import { copyToClipboard } from '@/lib/clipboard';
import { 
  CreditCard, 
  UserPlus, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Eye, 
  EyeOff, 
  Lock, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  QrCode, 
  SlidersHorizontal,
  Users,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  X,
  Mail,
  User as UserIcon,
  Phone,
  Calendar,
  Layers,
  PauseCircle,
  PlayCircle,
  Edit3,
  FileSpreadsheet,
  Download
} from 'lucide-react';

export function BTPassModule({ onOpenBtCard }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All' | 'Student' | 'Faculty'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Suspended'
  
  // New BT Pass Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('Student');
  const [department, setDepartment] = useState('Computer Science');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [btCardNumber, setBtCardNumber] = useState(() => `BT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('2027-06-30');
  
  // Feedback & Credentials State
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdPassCreds, setCreatedPassCreds] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Edit Dates Modal State
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editValidUntil, setEditValidUntil] = useState('');
  const [editBtCardNumber, setEditBtCardNumber] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deletion Modal State
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getMembers();
      if (Array.isArray(data)) {
        // Exclude Librarian, Admin, Super Admin from BT Pass borrower list
        const borrowerOnly = data.filter(u => 
          u.role === 'Student' || 
          u.role === 'Faculty' || 
          u.role === 'Student/Faculty'
        );
        setMembers(borrowerOnly);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const prefix = role === 'Faculty' ? 'Fac@' : 'Stu@';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setPassword(`${prefix}${randNum}`);
  };

  const handleCreateBTPass = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const finalPassword = password.trim() || (role === 'Faculty' ? 'Fac@2026' : 'Stu@2026');

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        role,
        department: department.trim(),
        phone: phone.trim(),
        password: finalPassword,
        btCardNumber: btCardNumber.trim() || `BT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        btCardIssueDate: issueDate || new Date().toISOString().split('T')[0],
        btCardValidUntil: validUntil || '2027-06-30',
        collegeName: user?.collegeName || '',
        collegeCode: user?.collegeCode || '',
        collegeId: user?.collegeId || ''
      };

      await api.createUser(payload);

      setCreatedPassCreds({
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
        studentId: studentId.trim(),
        btCardNumber: payload.btCardNumber,
        issueDate: payload.btCardIssueDate,
        validUntil: payload.btCardValidUntil,
        password: finalPassword
      });

      setMsg(`Digital BT Pass successfully issued for ${name} (${role})!`);
      // Reset form
      setName('');
      setEmail('');
      setStudentId('');
      setPhone('');
      setPassword('');
      setBtCardNumber(`BT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setIssueDate(new Date().toISOString().split('T')[0]);
      setValidUntil('2027-06-30');
      setIsFormOpen(false);
      setTimeout(() => setMsg(''), 5000);
      loadMembers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create BT Pass');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleOpenEditModal = (member) => {
    setMemberToEdit(member);
    setEditIssueDate(member.btCardIssueDate || member.createdAt?.split('T')[0] || '2026-10-05');
    setEditValidUntil(member.btCardValidUntil || '2027-06-30');
    setEditBtCardNumber(member.btCardNumber || `BT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSaveEditDates = async (e) => {
    e.preventDefault();
    if (!memberToEdit) return;
    setIsSavingEdit(true);
    try {
      const id = memberToEdit.id || memberToEdit._id;
      await api.updateUser(id, {
        btCardIssueDate: editIssueDate,
        btCardValidUntil: editValidUntil,
        btCardNumber: editBtCardNumber
      });
      setMsg(`Updated BT Pass validity dates for "${memberToEdit.name}".`);
      setTimeout(() => setMsg(''), 4000);
      setMemberToEdit(null);
      await loadMembers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update pass validity dates');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleActivity = async (member) => {
    const id = member.id || member._id;
    const isCurrentlyActive = member.status !== 'Suspended';
    const newStatus = isCurrentlyActive ? 'Suspended' : 'Active';

    try {
      await api.updateUser(id, { status: newStatus });
      setMsg(`Borrower "${member.name}" status updated to ${newStatus === 'Active' ? 'Active (Resumed)' : 'Paused (Suspended)'}.`);
      setTimeout(() => setMsg(''), 4000);
      loadMembers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle borrower status');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      const id = memberToDelete.id || memberToDelete._id;
      await api.deleteUser(id);
      setMsg(`BT Pass for "${memberToDelete.name}" revoked.`);
      setTimeout(() => setMsg(''), 4000);
      setMemberToDelete(null);
      loadMembers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to revoke BT Pass');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCredentials = async (creds) => {
    const text = `=== DIGITAL BT PASS & LIBRARY CREDENTIALS ===\nName: ${creds.name}\nRole: ${creds.role} (${creds.department})\nStudent/Roll ID: ${creds.studentId || 'N/A'}\nBT Pass Number: ${creds.btCardNumber}\nIssue Date: ${creds.issueDate || '2026-10-05'}\nValid Thru: ${creds.validUntil}\nLogin ID / Email: ${creds.email}\nPassword: ${creds.password}\nPortal URL: ${window.location.origin}\n===========================================`;
    await copyToClipboard(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleExportBTPassesExcel = () => {
    const headers = [
      { label: 'Borrower Name', key: 'name' },
      { label: 'Roll / Employee ID', key: 'studentId' },
      { label: 'Login Email', key: 'email' },
      { label: 'Role', key: 'role' },
      { label: 'Department', key: 'department' },
      { label: 'BT Pass Number', key: 'btCardNumber' },
      { label: 'Pass Issue Date', key: 'btCardIssueDate' },
      { label: 'Pass Valid Thru (Expiry)', key: 'btCardValidUntil' },
      { label: 'Status', key: 'status' },
      { label: 'Active Loans', key: 'activeLoans' },
      { label: 'Max Limit', key: 'maxBorrowLimit' },
      { label: 'Fine (INR)', key: 'fineAmount' },
      { label: 'Phone', key: 'phone' }
    ];
    exportToExcel('BT_Passes_Borrower_Directory', headers, members);
    setMsg('Borrower BT passes directory exported in Excel (.csv) format.');
    setTimeout(() => setMsg(''), 4000);
  };

  const filteredMembers = members.filter(m => {
    if (roleFilter !== 'All' && m.role !== roleFilter) return false;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && m.status === 'Suspended') return false;
      if (statusFilter === 'Suspended' && m.status !== 'Suspended') return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q) ||
        m.studentId?.toLowerCase().includes(q) ||
        m.employeeId?.toLowerCase().includes(q) ||
        m.btCardNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const studentCount = members.filter(m => m.role === 'Student').length;
  const facultyCount = members.filter(m => m.role === 'Faculty' || m.role === 'Staff').length;
  const activeCount = members.filter(m => m.status !== 'Suspended').length;
  const suspendedCount = members.filter(m => m.status === 'Suspended').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>Student & Staff Digital BT Passes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue borrower passes, configure issue & expiry dates, monitor borrowing activity, and manage credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel Button */}
          <button
            onClick={handleExportBTPassesExcel}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            title="Download BT passes directory in Excel format"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isFormOpen ? 'Close Form' : 'Issue New BT Pass'}</span>
          </button>

          <button
            onClick={loadMembers}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 shadow-sm transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Total BT Passes</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{members.length}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Registered Borrowers</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Student Passes</p>
            <h3 className="text-xl font-black text-blue-600 mt-0.5">{studentCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">5 Books Quota</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Faculty Passes</p>
            <h3 className="text-xl font-black text-purple-600 mt-0.5">{facultyCount}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">10 Books Quota</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Pass Status</p>
            <h3 className="text-xl font-black text-emerald-600 mt-0.5">{activeCount} Active</h3>
            <p className="text-[11px] text-rose-500 font-bold mt-0.5">{suspendedCount} Paused</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Newly Generated Credentials Card */}
      {createdPassCreds && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-500/40 shadow-xl relative animate-fadeIn overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-white">
                  Digital BT Pass Created & Credentials Ready
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Share these credentials and pass dates with <strong className="text-white">{createdPassCreds.name}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCredentials(createdPassCreds)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Credentials Copied!' : 'Copy All Details'}</span>
              </button>
              <button
                onClick={() => setCreatedPassCreds(null)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Borrower Name</span>
              <span className="font-bold text-white text-xs">{createdPassCreds.name}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">BT Pass & Validity</span>
              <span className="font-mono font-bold text-indigo-300 text-xs block">{createdPassCreds.btCardNumber}</span>
              <span className="text-[10px] text-emerald-300 font-mono mt-0.5 block">Valid: {createdPassCreds.validUntil}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Login ID</span>
              <span className="font-mono font-bold text-amber-300 text-xs break-all">{createdPassCreds.email}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Personal Password</span>
                <span className="font-mono font-bold text-emerald-300 text-xs">{createdPassCreds.password}</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await copyToClipboard(createdPassCreds.password);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                title="Copy Password"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ISSUE BT PASS COLLAPSIBLE FORM (WITH ISSUE & EXPIRY DATES) */}
      {/* ======================================================== */}
      {isFormOpen && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-lg animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Issue Student & Faculty Digital BT Pass</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure borrower identity, issue date, expiry date, and credentials.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateBTPass} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Full Name */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Borrower Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role Type */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Borrower Role & Quota</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Student">Student (5 Books Max)</option>
                  <option value="Faculty">Faculty / Teacher (10 Books Max)</option>
                </select>
              </div>

              {/* Student/Staff ID */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student / Employee ID</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-089"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Login Email */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Login ID / Email</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rohit@libman.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Portal Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Gen</span>
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Auto or custom password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="font-bold text-slate-700">Department / Branch</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* BT Card Number */}
              <div>
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>BT Pass Number</span>
                  <span className="text-[10px] text-slate-400">Auto-Generated</span>
                </label>
                <input
                  type="text"
                  value={btCardNumber}
                  onChange={(e) => setBtCardNumber(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pass Issue Date</span>
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pass Expiry Date (Valid Thru)</span>
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md shadow-indigo-500/25 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Issue BT Pass & Save Credentials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Registered Student & Staff Borrower Passes ({filteredMembers.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitoring of borrower passes, issue and expiry dates, and borrowing status.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, ID, BT card..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Roles</option>
              <option value="Student">Students</option>
              <option value="Faculty">Faculty / Staff</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Paused</option>
            </select>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-xs space-y-2">
            <CreditCard className="w-10 h-10 mx-auto opacity-30 text-indigo-600" />
            <p className="font-bold text-slate-700 text-sm">No Student or Staff BT Passes Issued Yet</p>
            <p className="text-slate-500">Click &quot;Issue New BT Pass&quot; above to create borrower credentials.</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs space-y-2">
            <Search className="w-8 h-8 mx-auto opacity-30 text-slate-500" />
            <p className="font-bold text-slate-700">No borrowers found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Borrower & ID</th>
                  <th className="p-3">Login ID / BT Pass</th>
                  <th className="p-3">Issue & Expiry Dates</th>
                  <th className="p-3">Role & Dept</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Loans</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const isSuspended = m.status === 'Suspended';
                  const activeLoans = m.activeLoans || 0;
                  const maxLimit = m.maxBorrowLimit || (m.role === 'Faculty' ? 10 : 5);
                  const fine = m.fineAmount || 0;
                  const memberIssueDate = m.btCardIssueDate || m.createdAt?.split('T')[0] || '2026-10-05';
                  const memberExpiryDate = m.btCardValidUntil || '2027-06-30';

                  return (
                    <tr key={m.id || m._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & ID */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {m.studentId || m.employeeId || m.id || m._id || 'N/A'}
                        </div>
                      </td>

                      {/* Login ID & BT Pass Number */}
                      <td className="p-3">
                        <div className="font-mono text-slate-700 font-semibold">{m.email}</div>
                        <div className="text-[10px] font-mono font-bold text-indigo-600 mt-0.5">
                          {m.btCardNumber || 'BT-PENDING'}
                        </div>
                      </td>

                      {/* Issue & Expiry Dates */}
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5 text-[11px] font-mono">
                          <span className="text-slate-600 flex items-center gap-1">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Issued:</span> {memberIssueDate}
                          </span>
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Expires:</span> {memberExpiryDate}
                          </span>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.role === 'Faculty'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {m.role}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{m.department || 'General'}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <PauseCircle className="w-3 h-3 text-rose-600" />
                            <span>Paused</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <PlayCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Loans */}
                      <td className="p-3 text-center">
                        <div className="font-bold text-slate-800">
                          {activeLoans} / {maxLimit}
                        </div>
                        {fine > 0 ? (
                          <span className="text-[10px] font-bold text-rose-600">₹{fine} Fine</span>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Dates Button */}
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white text-slate-600 hover:text-indigo-600 transition-colors"
                            title="Set & Edit Issue / Expiry Dates"
                          >
                            <Calendar className="w-4 h-4 text-indigo-600" />
                          </button>

                          {/* Pause / Play Activity Button */}
                          <button
                            onClick={() => handleToggleActivity(m)}
                            className={`px-2 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                              isSuspended
                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                            }`}
                            title={isSuspended ? 'Resume pass' : 'Pause pass'}
                          >
                            {isSuspended ? (
                              <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            ) : (
                              <Pause className="w-3 h-3 fill-amber-700 text-amber-700" />
                            )}
                          </button>

                          {/* View Digital BT Card Modal */}
                          <button
                            onClick={() => onOpenBtCard && onOpenBtCard(m)}
                            className="p-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                            title="View Digital BT Pass Card"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Delete / Revoke Pass */}
                          <button
                            onClick={() => setMemberToDelete(m)}
                            className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Revoke pass"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ======================================================== */}
      {/* EDIT DATES & VALIDITY MODAL                              */}
      {/* ======================================================== */}
      {memberToEdit && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Set Pass Issue & Expiry Dates</h3>
                  <p className="text-xs text-slate-500">Update validity period for {memberToEdit.name}</p>
                </div>
              </div>
              <button
                onClick={() => setMemberToEdit(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDates} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">BT Pass Number</label>
                <input
                  type="text"
                  required
                  value={editBtCardNumber}
                  onChange={(e) => setEditBtCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pass Issue Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={editIssueDate}
                  onChange={(e) => setEditIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pass Expiry Date (Valid Thru)</span>
                </label>
                <input
                  type="date"
                  required
                  value={editValidUntil}
                  onChange={(e) => setEditValidUntil(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Quick Expiry Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditValidUntil('2027-06-30')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-semibold"
                  >
                    June 2027 (1 Yr)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditValidUntil('2028-06-30')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-semibold"
                  >
                    June 2028 (2 Yrs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditValidUntil('2029-06-30')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-semibold"
                  >
                    June 2029 (3 Yrs)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMemberToEdit(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Validity Dates</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke / Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Revoke Borrower BT Pass</h3>
                  <p className="text-xs text-slate-500">Remove student / faculty borrower pass</p>
                </div>
              </div>
              <button
                onClick={() => setMemberToDelete(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-bold text-slate-900">{memberToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login ID / Email:</span>
                <span className="font-mono font-bold text-slate-800">{memberToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BT Card No:</span>
                <span className="font-mono font-bold text-indigo-600">{memberToDelete.btCardNumber}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
              ⚠️ Revoking this pass will remove their borrowing authorization and prevent them from checking out library materials.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Pass</span>
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
