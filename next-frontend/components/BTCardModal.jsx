'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import { 
  X, 
  Printer, 
  BookOpen, 
  User, 
  Sparkles,
  QrCode,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
  CreditCard
} from 'lucide-react';

export function BTCardModal({ isOpen, onClose, member = null }) {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState('');

  const currentTarget = member || user;
  const studentName = currentTarget?.name || 'Student Borrower';
  const studentEmail = currentTarget?.email || 'student@libman.edu';
  const studentDept = currentTarget?.department || 'Computer Science';
  const studentRole = currentTarget?.role || 'Student';
  const studentId = currentTarget?.studentId || currentTarget?.employeeId || currentTarget?.id || currentTarget?._id || '9042';
  const cardId = currentTarget?.btCardNumber || `BT-2026-${Math.abs((studentId).toString().split('').reduce((a,b)=>a+b.charCodeAt(0),0))}`;
  const institutionName = currentTarget?.collegeName || currentTarget?.institution || user?.collegeName || user?.institution || 'CAMPUS CENTRAL LIBRARY';
  const activeLoans = currentTarget?.activeLoans || 0;
  const maxLimit = currentTarget?.maxBorrowLimit || (studentRole === 'Faculty' ? 10 : 5);
  const status = currentTarget?.status || 'Active';
  const isFaculty = studentRole === 'Faculty';

  // Dates
  const issueDate = currentTarget?.btCardIssueDate || currentTarget?.createdAt?.split('T')[0] || '2026-10-05';
  const validUntil = currentTarget?.btCardValidUntil || '2027-06-30';

  useEffect(() => {
    if (isOpen) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const verifyUrl = `${baseUrl}/verify-pass?id=${cardId}&name=${encodeURIComponent(studentName)}&email=${encodeURIComponent(studentEmail)}&dept=${encodeURIComponent(studentDept)}&issue=${encodeURIComponent(issueDate)}&expiry=${encodeURIComponent(validUntil)}`;
      
      generateQRCodeDataUrl(verifyUrl).then((url) => {
        if (url) setQrUrl(url);
      });
    }
  }, [isOpen, cardId, studentName, studentEmail, studentDept, issueDate, validUntil]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl relative border border-slate-200 p-6 sm:p-8">
        {/* Top Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Digital Borrower Pass (BT Card)</h2>
            <p className="text-xs text-slate-500">Official Institutional Library Identity & Borrowing Ticket</p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LARGE LIGHT THEME PHYSICAL SMART CARD                     */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 border-2 border-indigo-200/90 shadow-xl relative overflow-hidden text-slate-900">
          {/* Top Decorative Color Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
          
          {/* Subtle Ambient Background Watermark / Glow */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

          {/* Card Top Header: Institution & Pass Role */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 uppercase truncate">
                  {institutionName}
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase block mt-0.5">
                  {isFaculty ? 'FACULTY BORROWER CARD' : 'STUDENT BORROWER PASS'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                status === 'Suspended'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {status === 'Suspended' ? '● PAUSED' : '● ACTIVE'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 font-mono">LIB-MAN PRO</span>
            </div>
          </div>

          {/* Card Main Body */}
          <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            {/* Left 2 Cols: User Details */}
            <div className="sm:col-span-2 space-y-3 min-w-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Borrower Name</span>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 truncate leading-tight mt-0.5">
                  {studentName}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Branch / Dept</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">{studentDept}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student / Roll ID</span>
                  <p className="font-mono font-bold text-indigo-700 text-xs mt-0.5">{studentId}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Login ID</span>
                <p className="text-xs font-mono font-medium text-slate-600 truncate mt-0.5">{studentEmail}</p>
              </div>
            </div>

            {/* Right Col: Large High-Contrast 2D QR Code */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
              {qrUrl ? (
                <img src={qrUrl} alt="Borrower QR Code" className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono">QR CODE</div>
              )}
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Scan to Verify</span>
            </div>
          </div>

          {/* Card Footer: Issue Date, Expiry Date, Card Number, Loans Limit */}
          <div className="pt-4 border-t border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/60 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-5 rounded-b-3xl">
            {/* Pass Number */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">BT Pass No.</span>
              <span className="font-mono font-black text-slate-900 text-xs sm:text-sm tracking-wide block mt-0.5">{cardId}</span>
            </div>

            {/* Issue Date */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>Issue Date</span>
              </span>
              <span className="font-mono font-bold text-indigo-900 text-xs sm:text-sm block mt-0.5">
                {issueDate}
              </span>
            </div>

            {/* Expiry Date */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-rose-500" />
                <span>Valid Thru</span>
              </span>
              <span className="font-mono font-bold text-rose-700 text-xs sm:text-sm block mt-0.5">
                {validUntil}
              </span>
            </div>

            {/* Active Loans */}
            <div className="text-left sm:text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Active Loans</span>
              <span className="font-bold text-emerald-600 text-xs sm:text-sm block mt-0.5">
                {activeLoans} / {maxLimit} Books
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Digital BT Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
