'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Newspaper, Plus, AlertCircle, CheckCircle, Calendar, RefreshCw } from 'lucide-react';

export function SerialModule() {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIssn, setNewIssn] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSerials();
  }, []);

  const loadSerials = async () => {
    setLoading(true);
    try {
      const data = await api.getSerials();
      if (Array.isArray(data)) {
        setSerials(data);
      }
    } catch (err) {
      console.error('Failed to load serials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.createSerial({
        title: newTitle,
        issn: newIssn || '2049-3630',
        frequency: 'Monthly',
        vendor: 'Direct Publisher',
        subscriptionEnd: '2027-01-01',
        status: 'Active',
        lastReceivedIssue: 'Vol 1 Issue 1'
      });
      setMsg(`Journal "${newTitle}" registered successfully.`);
      setShowAddForm(false);
      setNewTitle('');
      setNewIssn('');
      setTimeout(() => setMsg(''), 4000);
      loadSerials();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add serial');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Serial Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Journal subscriptions, arrival logs, and renewal tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSerials}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
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

      {/* Add Subscription Modal */}
      {showAddForm && (
        <div className="p-6 rounded-3xl glass-card border-2 border-pink-500/30 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Journal / Periodical</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Journal Title (e.g. Science Robotics)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="ISSN Code (e.g. 2470-9476)"
              value={newIssn}
              onChange={(e) => setNewIssn(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
            />
            <div className="flex gap-2">
              <button type="submit" className="w-1/2 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-1/2 py-2 rounded-xl border text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Serials Table */}
      <div className="p-6 rounded-3xl glass-card">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading periodicals and serials...</div>
        ) : serials.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No active serials or journals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">

              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="pb-3">Journal Title</th>
                  <th className="pb-3">ISSN</th>
                  <th className="pb-3">Frequency</th>
                  <th className="pb-3">Vendor / Publisher</th>
                  <th className="pb-3">Latest Issue</th>
                  <th className="pb-3">Expiry Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {serials.map((s) => {
                  const isRenewalPending = s.status === 'Renewal Pending';
                  const serialId = s.id || s._id;
                  return (
                    <tr key={serialId}>
                      <td className="py-3.5 text-slate-900 dark:text-white font-bold flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-pink-500 shrink-0" />
                        <span>{s.title}</span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500">{s.issn}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-300">{s.frequency}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-300">{s.vendor}</td>
                      <td className="py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{s.lastReceivedIssue}</td>
                      <td className="py-3.5 text-slate-500">{s.subscriptionEnd}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isRenewalPending 
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          {s.status}
                        </span>
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
