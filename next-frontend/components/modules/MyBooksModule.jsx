'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCcw, 
  CreditCard, 
  Sparkles, 
  X, 
  ArrowUpRight, 
  Hourglass, 
  MapPin, 
  CheckCheck,
  Check
} from 'lucide-react';

export function MyBooksModule({ onOpenBtCard }) {
  const { user, setActiveTab } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('loans'); // 'loans' | 'requests'
  const [records, setRecords] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewMsg, setRenewMsg] = useState('');
  const [renewError, setRenewError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadUserRecords();
  }, [user]);

  const loadUserRecords = async () => {
    setLoading(true);
    try {
      const [circData, resData] = await Promise.all([
        api.getCirculationRecords(),
        api.getReservations({ memberEmail: user?.email })
      ]);
      if (Array.isArray(circData)) {
        setRecords(circData);
      }
      if (Array.isArray(resData)) {
        setReservations(resData);
      }
    } catch (err) {
      console.error('Failed to load user records:', err);
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

  // Filter reservations made by this student/user
  const myReservations = reservations.filter(
    (r) => 
      r.memberEmail === user?.email || 
      r.memberId === user?.id || 
      r.memberName?.toLowerCase() === user?.name?.toLowerCase() ||
      user?.role === 'Student/Faculty' ||
      !r.memberEmail
  );

  const handleRenew = async (circ) => {
    setRenewError('');
    setRenewMsg('');
    try {
      const circId = circ.id || circ._id;
      const res = await api.renewBook(circId);
      setRenewMsg(`Renewal confirmed for "${circ.bookTitle}". New due date: ${res.dueDate || '14 days extended'}.`);
      setTimeout(() => setRenewMsg(''), 5000);
      loadUserRecords();
    } catch (err) {
      setRenewError(err.message || 'Renewal limit reached for this loan');
      setTimeout(() => setRenewError(''), 5000);
    }
  };

  const handleCancelRequest = async (resId) => {
    if (!confirm('Are you sure you want to cancel this book request?')) return;
    setCancellingId(resId);
    try {
      await api.cancelReservation(resId);
      setRenewMsg('Book request cancelled.');
      setTimeout(() => setRenewMsg(''), 4000);
      await loadUserRecords();
    } catch (err) {
      setRenewError(err.message || 'Failed to cancel request');
      setTimeout(() => setRenewError(''), 4000);
    } finally {
      setCancellingId(null);
    }
  };

  const pendingRequests = myReservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Fulfilled');
  const readyCount = myReservations.filter(r => r.status === 'Ready for Pickup').length;
  const maxBorrow = user?.role === 'Faculty' ? 10 : 5;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>My Library Cart & Loans</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active book loans, pickup readiness, and requested titles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUserRecords}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenBtCard}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Digital BT Pass</span>
          </button>
        </div>
      </div>

      {/* Minimal Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 max-w-sm border border-slate-200/80">
        <button
          onClick={() => setActiveSubTab('loans')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'loans'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Loans ({myIssuedBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            activeSubTab === 'requests'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Requests ({pendingRequests.length})</span>
          {readyCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Messages */}
      {renewMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{renewMsg}</span>
        </div>
      )}
      {renewError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{renewError}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. ACTIVE LOANS VIEW                                     */}
      {/* ======================================================== */}
      {activeSubTab === 'loans' && (
        <div className="space-y-4">
          {/* Minimal Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Borrowed</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{myIssuedBooks.length} / {maxBorrow}</span>
              <span className="text-[10px] text-slate-500">Active Books</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Overdue</span>
              <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">
                {myIssuedBooks.filter(b => b.status === 'Overdue').length}
              </span>
              <span className="text-[10px] text-slate-500">Requires Return</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Fines</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">₹{user?.fineAmount || 0}</span>
              <span className="text-[10px] text-slate-500">Account Clear</span>
            </div>
          </div>

          {/* Loans Card List */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Borrowed Books
            </h2>

            {myIssuedBooks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-30 text-indigo-600" />
                <p className="text-xs font-bold text-slate-700">No active book loans</p>
                <p className="text-[11px] text-slate-500">Find books in OPAC to request physical issues.</p>
                <button
                  onClick={() => setActiveTab('opac')}
                  className="mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Browse OPAC
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myIssuedBooks.map((record) => (
                  <div
                    key={record.id || record._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                          {record.accessionNumber || 'ACC'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                          {record.status}
                        </span>
                        {record.renewedCount > 0 && (
                          <span className="text-[10px] text-slate-400">
                            Renewed {record.renewedCount}x
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{record.bookTitle}</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Due Date: <strong className="text-indigo-600">{record.dueDate}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRenew(record)}
                        disabled={(record.renewedCount || 0) >= 2}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        <span>{(record.renewedCount || 0) >= 2 ? 'Max Renewals' : 'Renew Loan'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BOOK REQUESTS & HOLDS VIEW                            */}
      {/* ======================================================== */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Requested Books & Queue Status ({myReservations.length})
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Librarian reviews and issues books upon counter presentation.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('opac')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Request Book</span>
              </button>
            </div>

            {myReservations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-30 text-indigo-600" />
                <p className="text-xs font-bold text-slate-700">No active book requests</p>
                <p className="text-[11px] text-slate-500">Explore OPAC to place requests or hold reservations.</p>
                <button
                  onClick={() => setActiveTab('opac')}
                  className="mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Explore OPAC
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myReservations.map((res) => {
                  const resId = res.id || res._id;
                  const isReady = res.status === 'Ready for Pickup';
                  const isPending = res.status === 'Pending';
                  const isFulfilled = res.status === 'Fulfilled';

                  return (
                    <div
                      key={resId}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isReady
                          ? 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                          : isPending
                          ? 'bg-slate-50 border-slate-200/80'
                          : 'bg-slate-50/50 border-slate-100 opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : isFulfilled
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {isReady ? 'Ready for Pickup' : res.status}
                          </span>
                          {res.queuePosition > 0 && isPending && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Queue Pos #{res.queuePosition}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{res.bookTitle}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Rack: {res.rackLocation || 'CS-01'}</span>
                          <span>•</span>
                          <span>{res.reservationDate || 'Recent'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isReady && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" />
                            <span>Collect at Counter</span>
                          </span>
                        )}

                        {(isPending || isReady) && (
                          <button
                            onClick={() => handleCancelRequest(resId)}
                            disabled={cancellingId === resId}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition-colors"
                          >
                            {cancellingId === resId ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
