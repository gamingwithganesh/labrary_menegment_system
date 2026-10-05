'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function VerifyPassContent() {
  const searchParams = useSearchParams();
  
  const passNo = searchParams.get('id') || 'BT-2026-9042';
  const name = searchParams.get('name') || 'Aarav Sharma';
  const email = searchParams.get('email') || 'student@libman.edu';
  const dept = searchParams.get('dept') || 'Computer Science & Engineering';
  const issueDate = searchParams.get('issue') || '2026-10-05';
  const expiryDate = searchParams.get('expiry') || '2027-06-30';

  const issuedBooks = [
    {
      id: 'TXN-9012',
      title: 'Operating System Concepts (10th Ed)',
      author: 'Abraham Silberschatz',
      issueDate: '2026-07-24',
      dueDate: '2026-08-07',
      status: 'Active Loan',
      rack: 'Rack CS-02'
    },
    {
      id: 'TXN-9045',
      title: 'Introduction to Algorithms (4th Ed)',
      author: 'Thomas H. Cormen',
      issueDate: '2026-07-28',
      dueDate: '2026-08-11',
      status: 'Active Loan',
      rack: 'Rack CS-05'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library Portal</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            OFFICIAL VERIFIED PASS
          </span>
        </div>

        {/* Header Title Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Official Library BT Pass Verification</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">Pass Identification No: <strong className="text-indigo-600">{passNo}</strong></p>
        </div>

        {/* Student Information & Contact Address Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Student & Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-0.5 font-medium">Student Full Name</span>
              <strong className="text-sm text-slate-900 font-extrabold">{name}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 block mb-0.5 font-medium">Department / Faculty</span>
              <strong className="text-sm text-slate-900 font-extrabold">{dept}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Email Contact</span>
                <strong className="text-slate-900 font-mono">{email}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Phone Contact</span>
                <strong className="text-slate-900 font-mono">+91 98765 43210</strong>
              </div>
            </div>
          </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Pass Issue Date</span>
                <strong className="text-slate-900 font-mono">{issueDate}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Pass Valid Thru (Expiry)</span>
                <strong className="text-rose-700 font-mono font-bold">{expiryDate}</strong>
              </div>
            </div>
          </div>

        {/* Books Issued Section */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Books Currently Issued ({issuedBooks.length})</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Limit: 2 / 5 Used
            </span>
          </div>

          <div className="space-y-3">
            {issuedBooks.map((book, idx) => (
              <div key={book.id || book._id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {book.id || book._id || `BOOK-${idx + 1}`}
                    </span>
                    <span className="font-semibold text-slate-500">{book.rack}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{book.title}</h3>
                  <p className="text-slate-500 text-[11px]">Author: {book.author}</p>
                </div>

                <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-slate-600 font-medium">Issue: {book.issueDate}</div>
                  <div className="text-indigo-600 font-bold">Due: {book.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Student BT Pass Verification Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 text-slate-900 p-8 text-center">Loading Verification...</div>}>
      <VerifyPassContent />
    </Suspense>
  );
}
