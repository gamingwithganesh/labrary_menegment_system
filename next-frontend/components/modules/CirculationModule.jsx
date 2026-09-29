'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Repeat, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2, User, BookOpen, RefreshCw } from 'lucide-react';

export function CirculationModule() {
  const [activeTab, setActiveTab] = useState('issue');
  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRecords, fetchedMembers, fetchedBooks] = await Promise.all([
        api.getCirculationRecords(),
        api.getMembers(),
        api.getBooks()
      ]);

      const validMembers = Array.isArray(fetchedMembers) ? fetchedMembers : [];
      const validBooks = Array.isArray(fetchedBooks) ? fetchedBooks : [];
      const validRecords = Array.isArray(fetchedRecords) ? fetchedRecords : [];

      setRecords(validRecords);
      setMembers(validMembers);
      setBooks(validBooks);

      if (validMembers.length > 0 && !memberId) {
        setMemberId(validMembers[0].id || validMembers[0]._id);
      }
      if (validBooks.length > 0 && !bookId) {
        setBookId(validBooks[0].id || validBooks[0]._id);
      }
    } catch (err) {
      console.error('Failed to load circulation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = members.find(m => (m.id || m._id) === memberId) || members[0] || {
    name: 'Student Borrower',
    role: 'Student',
    department: 'General',
    id: 'M-101',
    activeLoans: 0,
    fineAmount: 0
  };

  const selectedBook = books.find(b => (b.id || b._id) === bookId) || books[0] || {
    title: 'Select a book',
    location: 'Rack CS-01'
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const newRecord = await api.issueBook({
        bookId: String(selectedBook.id || selectedBook._id),
        memberId: String(selectedMember.id || selectedMember._id),
        memberName: selectedMember.name,
        memberEmail: selectedMember.email || ''
      });

      setMsg(`Issued "${selectedBook.title}" to ${selectedMember.name} (Due: ${newRecord.dueDate}).`);
      setTimeout(() => setMsg(''), 4000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue book');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleReturn = async (recordId) => {
    setErrorMsg('');
    try {
      await api.returnBook(recordId);
      setMsg(`Book returned successfully. Inventory updated.`);
      setTimeout(() => setMsg(''), 4000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to return book');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Circulation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book issue, return processing, member verification, and fines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'issue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'return'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-blue-400" />
            <span>Return / Fines</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 shadow-sm"
            title="Refresh Circulation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Issue / Return Layout */}
      {activeTab === 'issue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl glass-card">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-500" />
              <span>Fast Issue Transaction</span>
            </h2>

            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Select Member</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {members.map(m => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.name} ({m.role} - {m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Select Book to Issue</label>
                <select
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {books.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.title} (Location: {b.location} | Available: {b.availableCopies ?? b.copies})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Confirm Book Issue</span>
                </button>
              </div>
            </form>
          </div>

          {/* Member Card Summary */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedMember.name}</h3>
                  <p className="text-xs text-slate-500">{selectedMember.role} • {selectedMember.department}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Member ID:</span>
                  <span className="font-mono font-bold">{selectedMember.id || selectedMember._id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Loans:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {records.filter(r => (r.memberId === (selectedMember.id || selectedMember._id) || r.memberName === selectedMember.name) && r.status !== 'Returned').length} / 5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Fines:</span>
                  <span className={`font-bold ${(selectedMember.fineAmount || 0) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ₹{selectedMember.fineAmount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-500">
              Loan Policy: Standard return period is 14 days. ₹10/day fine applies to overdue returns.
            </div>
          </div>
        </div>
      ) : null}

      {/* Circulation History & Active Loans Table */}
      <div className="p-6 rounded-3xl glass-card">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Active Loans & Circulation Records ({records.length})
        </h2>

        {records.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No circulation records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="pb-3">Trans ID</th>
                  <th className="pb-3">Book Title</th>
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {records.map((r) => {
                  const isOverdue = r.status === 'Overdue';
                  const isReturned = r.status === 'Returned';
                  const recordId = r.id || r._id;
                  return (
                    <tr key={recordId}>
                      <td className="py-3 font-mono font-bold text-indigo-600">{recordId}</td>
                      <td className="py-3 text-slate-900 dark:text-white font-bold">{r.bookTitle}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{r.memberName}</td>
                      <td className="py-3 text-slate-500">{r.issueDate}</td>
                      <td className="py-3 text-slate-500">{r.dueDate}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isReturned 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' 
                            : isOverdue 
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {!isReturned && (
                          <button
                            onClick={() => handleReturn(recordId)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500"
                          >
                            Process Return
                          </button>
                        )}
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
