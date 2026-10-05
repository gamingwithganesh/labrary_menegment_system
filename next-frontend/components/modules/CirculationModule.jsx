'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { exportToExcel } from '@/lib/export-excel';
import { 
  Repeat, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  BookOpen, 
  RefreshCw, 
  Trash2, 
  Inbox, 
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCheck,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Search,
  Filter,
  Check,
  UserCheck,
  Zap,
  FileSpreadsheet,
  Download
} from 'lucide-react';

export function CirculationModule() {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'issue' | 'return'
  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [requestFilter, setRequestFilter] = useState('All'); // 'All' | 'Pending' | 'Ready for Pickup' | 'Fulfilled'
  const [requestSearch, setRequestSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRecords, fetchedMembers, fetchedBooks, fetchedReservations] = await Promise.all([
        api.getCirculationRecords(),
        api.getMembers(),
        api.getBooks(),
        api.getReservations()
      ]);

      const validMembers = Array.isArray(fetchedMembers) ? fetchedMembers : [];
      const validBooks = Array.isArray(fetchedBooks) ? fetchedBooks : [];
      const validRecords = Array.isArray(fetchedRecords) ? fetchedRecords : [];
      const validRes = Array.isArray(fetchedReservations) ? fetchedReservations : [];

      setRecords(validRecords);
      setMembers(validMembers);
      setBooks(validBooks);
      setReservations(validRes);

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
    if (e) e.preventDefault();
    setErrorMsg('');
    try {
      const newRecord = await api.issueBook({
        bookId: String(selectedBook.id || selectedBook._id),
        memberId: String(selectedMember.id || selectedMember._id),
        memberName: selectedMember.name,
        memberEmail: selectedMember.email || '',
        memberRole: selectedMember.role || 'Student'
      });

      setMsg(`Successfully issued "${selectedBook.title}" to ${selectedMember.name}. Due on ${newRecord.dueDate || '14 days'}.`);
      setTimeout(() => setMsg(''), 5000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue book');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // Primary action: Issue the requested book directly to the student
  const handleApproveAndIssue = async (res) => {
    setProcessingId(res.id || res._id);
    setErrorMsg('');
    try {
      const matchingBook = books.find(b => 
        (b.id || b._id)?.toString() === res.bookId?.toString() ||
        b.title?.toLowerCase() === res.bookTitle?.toLowerCase()
      );

      const targetBookId = matchingBook ? String(matchingBook.id || matchingBook._id) : String(res.bookId);

      // 1. Issue book to student
      const newRecord = await api.issueBook({
        bookId: targetBookId,
        memberId: String(res.memberId || res.studentId || 'STU-101'),
        memberName: res.memberName || 'Student Borrower',
        memberEmail: res.memberEmail || '',
        memberRole: res.department?.toLowerCase().includes('faculty') ? 'Faculty' : 'Student'
      });

      // 2. Mark reservation as fulfilled
      await api.updateReservation(res.id || res._id, {
        status: 'Fulfilled'
      });

      setMsg(`✓ Book "${res.bookTitle}" successfully issued to ${res.memberName}! Return due: ${newRecord.dueDate || '14 days'}.`);
      setTimeout(() => setMsg(''), 6000);
      await loadData();
    } catch (err) {
      console.error('Issue error:', err);
      setErrorMsg(err.message || 'Failed to issue book to student');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkReadyForPickup = async (resId) => {
    setProcessingId(resId);
    setErrorMsg('');
    try {
      await api.updateReservation(resId, {
        status: 'Ready for Pickup',
        pickupDeadline: '48 Hours from now'
      });
      setMsg('Status marked as Ready for Pickup. Student notified.');
      setTimeout(() => setMsg(''), 4000);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update request status');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!confirm('Are you sure you want to cancel or reject this request?')) return;
    setProcessingId(resId);
    try {
      await api.cancelReservation(resId);
      setMsg('Request cancelled and removed from active queue.');
      setTimeout(() => setMsg(''), 3000);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove request');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReturn = async (recordId) => {
    setErrorMsg('');
    try {
      await api.returnBook(recordId);
      setMsg(`Book returned successfully. Stock inventory updated.`);
      setTimeout(() => setMsg(''), 4000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to return book');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this circulation record?')) return;
    try {
      await api.deleteCirculationRecord(recordId);
      setMsg('Circulation record deleted.');
      setTimeout(() => setMsg(''), 3000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete record');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleClearAllRecords = async () => {
    if (!confirm('Are you sure you want to remove all circulation records?')) return;
    try {
      await api.clearCirculationRecords();
      setMsg('All circulation records have been removed.');
      setTimeout(() => setMsg(''), 3000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to clear records');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // EXCEL EXPORT HANDLERS
  const handleExportCirculationExcel = () => {
    const headers = [
      { label: 'Transaction ID', key: 'id' },
      { label: 'Book Title', key: 'bookTitle' },
      { label: 'Accession No', key: 'accessionNumber' },
      { label: 'Borrower Name', key: 'memberName' },
      { label: 'Borrower Email', key: 'memberEmail' },
      { label: 'Member Role', key: 'memberRole' },
      { label: 'Issue Date', key: 'issueDate' },
      { label: 'Due Date', key: 'dueDate' },
      { label: 'Return Date', key: 'returnDate' },
      { label: 'Status', key: 'status' },
      { label: 'Fine (INR)', key: 'fine' },
      { label: 'Renewals', key: 'renewedCount' }
    ];
    exportToExcel('Circulation_Records', headers, records);
    setMsg('Circulation records downloaded in Excel (.csv) format.');
    setTimeout(() => setMsg(''), 4000);
  };

  const handleExportRequestsExcel = () => {
    const headers = [
      { label: 'Request ID', key: 'id' },
      { label: 'Book Title', key: 'bookTitle' },
      { label: 'Rack Location', key: 'rackLocation' },
      { label: 'Student Borrower', key: 'memberName' },
      { label: 'Student Email', key: 'memberEmail' },
      { label: 'Department', key: 'department' },
      { label: 'Queue Position', key: 'queuePosition' },
      { label: 'Request Date', key: 'reservationDate' },
      { label: 'Status', key: 'status' },
      { label: 'Pickup Deadline', key: 'pickupDeadline' }
    ];
    exportToExcel('Student_Issue_Requests_Queue', headers, reservations);
    setMsg('Student requests queue downloaded in Excel (.csv) format.');
    setTimeout(() => setMsg(''), 4000);
  };

  // Quick autofill from a request into Fast Issue tab
  const handleSelectRequestForFastIssue = (res) => {
    const matchingMember = members.find(m => 
      (m.id || m._id) === res.memberId || 
      m.email === res.memberEmail || 
      m.name?.toLowerCase() === res.memberName?.toLowerCase()
    );
    if (matchingMember) setMemberId(matchingMember.id || matchingMember._id);

    const matchingBook = books.find(b => 
      (b.id || b._id) === res.bookId || 
      b.title?.toLowerCase() === res.bookTitle?.toLowerCase()
    );
    if (matchingBook) setBookId(matchingBook.id || matchingBook._id);

    setActiveTab('issue');
  };

  const pendingRequests = reservations.filter(r => r.status !== 'Fulfilled' && r.status !== 'Cancelled');
  const pendingCount = pendingRequests.length;

  const filteredRequests = reservations.filter(r => {
    if (requestFilter !== 'All' && r.status !== requestFilter) return false;
    if (requestSearch) {
      const q = requestSearch.toLowerCase();
      return (
        r.bookTitle?.toLowerCase().includes(q) ||
        r.memberName?.toLowerCase().includes(q) ||
        r.memberEmail?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        (r.id || r._id)?.toString().toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-indigo-600" />
            <span>Circulation & Book Issue Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve student book requests, issue physical copies, and process book returns.
          </p>
        </div>

        {/* Action Controls & Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel Button */}
          <button
            onClick={handleExportCirculationExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            title="Download circulation records in Excel format"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'requests'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Student Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('issue')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'issue'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fast Issue</span>
            </button>

            <button
              onClick={() => setActiveTab('return')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'return'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500" />
              <span>Return & Fines</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Action Pending Requests Banner if in another tab */}
      {activeTab !== 'requests' && pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {pendingCount}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {pendingCount} Student Book {pendingCount === 1 ? 'Request' : 'Requests'} Waiting for Issue
              </p>
              <p className="text-[11px] text-slate-500">
                Students have submitted issue requests from OPAC. Approve & issue them with 1-click.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('requests')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 shrink-0"
          >
            <span>Review & Issue Requests</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: STUDENT BOOK REQUESTS & 1-CLICK ISSUE QUEUE       */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Filter, Export Requests */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, book, department, or request ID..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {requestSearch && (
                  <button
                    onClick={() => setRequestSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {['All', 'Pending', 'Ready for Pickup', 'Fulfilled'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRequestFilter(f)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      requestFilter === f
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportRequestsExcel}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Export Student Requests Queue to Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Queue (Excel)</span>
              </button>
            </div>
          </div>

          {/* Requests Content */}
          {reservations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <Clock className="w-10 h-10 mx-auto opacity-30 text-indigo-600" />
              <p className="font-bold text-slate-800 text-sm">No Student Book Requests in Queue</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When students request books via OPAC or digital BT pass, they will instantly appear here for 1-click librarian approval and issue.
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-500">
              No requests matching current filter &quot;{requestFilter}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((res) => {
                const resId = res.id || res._id;
                const isReady = res.status === 'Ready for Pickup';
                const isPending = res.status === 'Pending';
                const isFulfilled = res.status === 'Fulfilled';
                const isCancelled = res.status === 'Cancelled';
                const isProcessing = processingId === resId;

                const matchingBook = books.find(b => 
                  (b.id || b._id)?.toString() === res.bookId?.toString() ||
                  b.title?.toLowerCase() === res.bookTitle?.toLowerCase()
                );
                const availableCopies = matchingBook ? (matchingBook.availableCopies ?? matchingBook.copies) : 'Available';

                return (
                  <div
                    key={resId}
                    className={`p-5 rounded-2xl border transition-all ${
                      isFulfilled 
                        ? 'bg-slate-50/70 border-slate-200 opacity-80' 
                        : isReady
                        ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                        : 'bg-white border-slate-200/90 shadow-sm hover:border-indigo-300'
                    }`}
                  >
                    {/* Top Row: Request ID, Date, Status */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono font-bold text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {resId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {res.reservationDate || 'Recent'}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isReady
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : isFulfilled
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    {/* Book Information */}
                    <div className="py-3">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {res.bookTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {res.bookAuthor ? `By ${res.bookAuthor} • ` : ''}{res.bookCategory || 'Academic'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          <span>Rack: {res.rackLocation || 'CS-01'}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-emerald-700">
                          Shelf Copies: {availableCopies}
                        </span>
                      </div>
                    </div>

                    {/* Student Borrower Profile */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Requested Student</span>
                          <span className="font-bold text-slate-900 truncate block text-xs mt-0.5">
                            {res.memberName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {res.memberEmail || res.department || 'Student Borrower'}
                          </span>
                        </div>
                        {res.queuePosition > 0 && (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Queue Pos</span>
                            <span className="font-mono font-bold text-amber-700 text-xs mt-0.5 block">
                              #{res.queuePosition}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Librarian Action Toolbar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {!isFulfilled && !isCancelled ? (
                        <>
                          <button
                            onClick={() => handleApproveAndIssue(res)}
                            disabled={isProcessing}
                            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                            title="Approve and immediately issue book to this student"
                          >
                            <CheckCheck className="w-4 h-4" />
                            <span>{isProcessing ? 'Issuing...' : 'Issue Book to Student'}</span>
                          </button>

                          {!isReady && (
                            <button
                              onClick={() => handleMarkReadyForPickup(resId)}
                              disabled={isProcessing}
                              className="py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors disabled:opacity-50"
                              title="Mark ready for pickup"
                            >
                              Ready
                            </button>
                          )}

                          <button
                            onClick={() => handleCancelReservation(resId)}
                            disabled={isProcessing}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Reject / Cancel request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between text-xs text-slate-500">
                          <span className="font-medium">
                            {isFulfilled ? '✓ Issue completed & recorded' : 'Request cancelled'}
                          </span>
                          <span className="text-[11px] text-slate-400">Archived</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FAST DIRECT ISSUE FORM (WALK-IN OR QUICK PICK)    */}
      {/* ======================================================== */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>Fast Issue Transaction</span>
            </h2>

            {pendingCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <p className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Quick-Select From Pending Student Requests:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pendingRequests.slice(0, 4).map((r) => (
                    <button
                      key={r.id || r._id}
                      type="button"
                      onClick={() => handleSelectRequestForFastIssue(r)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-600 hover:text-white transition-colors truncate max-w-[240px]"
                    >
                      {r.memberName}: {r.bookTitle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Select Member / Borrower</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {members.map(m => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.name} ({m.role} - {m.department}) - ID: {m.studentId || m.btCardNumber || m.id || m._id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Select Book to Issue</label>
                <select
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Confirm Book Issue</span>
                </button>
              </div>
            </form>
          </div>

          {/* Member Card Summary */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedMember.name}</h3>
                  <p className="text-xs text-slate-500">{selectedMember.role} • {selectedMember.department}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Pass / ID:</span>
                  <span className="font-mono font-bold">{selectedMember.btCardNumber || selectedMember.studentId || selectedMember.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Loans:</span>
                  <span className="font-bold text-indigo-600">
                    {records.filter(r => (r.memberId === (selectedMember.id || selectedMember._id) || r.memberName === selectedMember.name) && r.status !== 'Returned').length} / {selectedMember.role === 'Faculty' ? 10 : 5}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fines:</span>
                  <span className={`font-bold ${(selectedMember.fineAmount || 0) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ₹{selectedMember.fineAmount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-slate-50 text-[11px] text-slate-500 border border-slate-100">
              Loan Policy: Standard return period is 14 days (30 days for Faculty).
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RETURN & FINES DESK                               */}
      {/* ======================================================== */}
      {activeTab === 'return' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Loans & Return Desk ({records.filter(r => r.status !== 'Returned').length} Active)
              </h2>
              <p className="text-xs text-slate-500">
                Process book returns, auto-calculate overdue fines, and restock catalog inventory.
              </p>
            </div>

            <button
              onClick={handleExportCirculationExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Loans (Excel)</span>
            </button>
          </div>

          {records.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Inbox className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
              <p className="font-bold text-slate-700 text-sm">No Active Circulation Records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="pb-3">Trans ID</th>
                    <th className="pb-3">Book Title</th>
                    <th className="pb-3">Borrower</th>
                    <th className="pb-3">Issue Date</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {records.map((r) => {
                    const isOverdue = r.status === 'Overdue';
                    const isReturned = r.status === 'Returned';
                    const recordId = r.id || r._id;
                    return (
                      <tr key={recordId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono font-bold text-indigo-600">{recordId}</td>
                        <td className="py-3 text-slate-900 font-bold">{r.bookTitle}</td>
                        <td className="py-3 text-slate-600">{r.memberName}</td>
                        <td className="py-3 text-slate-500">{r.issueDate}</td>
                        <td className="py-3 text-slate-500">{r.dueDate}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isReturned 
                              ? 'bg-slate-100 text-slate-500' 
                              : isOverdue 
                                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isReturned && (
                              <button
                                onClick={() => handleReturn(recordId)}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-sm"
                              >
                                Return Book
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRecord(recordId)}
                              className="p-1.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Delete this record"
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
      )}
    </div>
  );
}
