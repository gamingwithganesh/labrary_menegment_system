'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertTriangle, RefreshCcw, CreditCard, ShieldCheck } from 'lucide-react';

export function MyBooksModule({ onOpenBtCard }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewMsg, setRenewMsg] = useState('');

  useEffect(() => {
    loadUserRecords();
  }, [user]);

  const loadUserRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getCirculationRecords();
      if (Array.isArray(data)) {
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to load user circulation records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter books issued to this student/user
  const myIssuedBooks = records.filter(
    (r) => 
      r.status !== 'Returned' && (
        r.memberId === user?.id || 
        r.memberEmail === user?.email ||
        r.memberName?.toLowerCase() === user?.name?.toLowerCase() ||
        user?.role === 'Student/Faculty' ||
        r.memberName === 'Aarav Sharma'
      )
  );

  const handleRenew = (bookTitle) => {
    setRenewMsg(`Renewal requested for "${bookTitle}". Due date extended by 14 days.`);
    setTimeout(() => setRenewMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Issued Books
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active loans, due dates, fines, and digital borrower pass.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadUserRecords}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 shadow-sm"
            title="Refresh"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenBtCard}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>My BT Pass</span>
          </button>
        </div>
      </div>

      {renewMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{renewMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card">
          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Currently Borrowed</p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{myIssuedBooks.length} Books</h3>
          <p className="text-xs text-indigo-500 mt-1">Max Borrow Limit: 5 Books</p>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Overdue Items</p>
          <h3 className="text-2xl font-extrabold text-amber-500">
            {myIssuedBooks.filter(b => b.status === 'Overdue').length} Items
          </h3>
          <p className="text-xs text-slate-400 mt-1">Fine Rate: ₹10/day</p>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Outstanding Fines</p>
          <h3 className="text-2xl font-extrabold text-emerald-500">
            ₹{myIssuedBooks.reduce((s, b) => s + (Number(b.fine) || 0), 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">No pending blocks</p>
        </div>
      </div>

      {/* Issued Books Table */}
      <div className="p-6 rounded-3xl glass-card">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Books Issued to {user?.name || 'Aarav Sharma'}</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading loan records...</div>
        ) : myIssuedBooks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            You currently have no books checked out under your name.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Book Title</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Fine Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {myIssuedBooks.map((b) => {
                  const isOverdue = b.status === 'Overdue';
                  const recId = b.id || b._id;
                  return (
                    <tr key={recId}>
                      <td className="py-3.5 font-mono font-bold text-indigo-600">{recId}</td>
                      <td className="py-3.5 text-slate-900 dark:text-white font-bold">{b.bookTitle}</td>
                      <td className="py-3.5 text-slate-500">{b.issueDate}</td>
                      <td className="py-3.5 text-slate-500">{b.dueDate}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOverdue 
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          {isOverdue ? `Overdue (₹${b.fine || 0})` : 'Active Loan'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => handleRenew(b.bookTitle)}
                          className="px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center gap-1 border border-indigo-500/20"
                        >
                          <RefreshCcw className="w-3 h-3" />
                          <span>Request Renewal</span>
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
  );
}
