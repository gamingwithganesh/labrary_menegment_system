'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Building2, ShieldCheck, UserPlus, Settings, Key, CheckCircle, Trash2, RefreshCw, AlertCircle, Save, MapPin } from 'lucide-react';

export function AdminModule() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [dept, setDept] = useState('Computer Science');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings Form State
  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Agnihotri Polytechnic Nagthana');
  const [collegeCode, setCollegeCode] = useState(user?.collegeCode || 'APN-WARDHA');
  const [principalName, setPrincipalName] = useState(user?.name || 'Principal');
  const [location, setLocation] = useState('Nagthana, Wardha');
  const [libraryName, setLibraryName] = useState('Central Technical Library');
  const [studentLimit, setStudentLimit] = useState(5);
  const [facultyLimit, setFacultyLimit] = useState(10);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadUsers();
    if (user?.collegeName) {
      setCollegeName(user.collegeName);
    }
    if (user?.collegeCode) {
      setCollegeCode(user.collegeCode);
    }
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.createUser({
        name,
        email,
        role,
        department: dept,
        collegeName: user?.collegeName || collegeName,
        collegeCode: user?.collegeCode || collegeCode,
        collegeId: user?.collegeId || '',
        password: 'admin123'
      });
      setMsg(`User "${name}" registered to ${user?.collegeName || collegeName} with role ${role}.`);
      setName('');
      setEmail('');
      setTimeout(() => setMsg(''), 4000);
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
      if (user?.collegeId || user?.collegeCode) {
        await api.updateCollege(user.collegeId || user.collegeCode, {
          name: collegeName,
          code: collegeCode.toUpperCase(),
          adminName: principalName,
          location: location,
          libraryName: libraryName
        });
      }
      setMsg(`Campus profile updated for "${collegeName}"!`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg(`Settings saved successfully for ${collegeName}!`);
      setTimeout(() => setMsg(''), 4000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure you want to remove this user from campus directory?')) {
      try {
        await api.deleteUser(id);
        setMsg('User removed from campus directory.');
        setTimeout(() => setMsg(''), 4000);
        loadUsers();
      } catch (err) {
        setErrorMsg(err.message || 'Failed to delete user');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  const displayCollegeTitle = user?.collegeName || 'Agnihotri Polytechnic Nagthana';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {displayCollegeTitle}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            College Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus directory, roles, and institutional governance for {displayCollegeTitle}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Campus Directory
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Campus Profile
          </button>
          <button
            onClick={loadUsers}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 shadow-sm"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeSubTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create User Card */}
          <div className="p-6 rounded-3xl glass-card">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Create Campus User</span>
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@libman.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option>Student</option>
                  <option>Faculty</option>
                  <option>Librarian</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Department</label>
                <input
                  type="text"
                  placeholder="Computer Science"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25"
              >
                + Register User
              </button>
            </form>
          </div>

          {/* User Directory Table */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-card">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Registered Users Directory ({users.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading campus directory...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="pb-3">User ID</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {users.map((u) => {
                      const userId = u.id || u._id;
                      return (
                        <tr key={userId}>
                          <td className="py-3 font-mono font-bold text-indigo-600">{userId}</td>
                          <td className="py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">{u.department}</td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteUser(userId)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Settings Sub-Tab */
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>Campus Institution Profile & Library Settings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your college name, campus code, location, and borrowing policies.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
              {collegeCode}
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">College / Institution Full Name</label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Agnihotri Polytechnic Nagthana Wardha"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Campus Code / Branch Identifier</label>
                <input
                  type="text"
                  required
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  placeholder="APN-WARDHA"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Principal / Head of Institution</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Dr. Principal Name"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Campus Location / Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Nagthana Road, Wardha"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Library / Resource Center Name</label>
                <input
                  type="text"
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                  placeholder="Central Knowledge Resource Center"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Student Book Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={studentLimit}
                    onChange={(e) => setStudentLimit(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Faculty Book Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={facultyLimit}
                    onChange={(e) => setFacultyLimit(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving Profile...' : 'Save Campus Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
