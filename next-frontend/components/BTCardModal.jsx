'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import { 
  CreditCard, 
  X, 
  Printer, 
  CheckCircle, 
  BookOpen, 
  User, 
  Sparkles,
  QrCode
} from 'lucide-react';

export function BTCardModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState('');

  const studentName = user?.name || 'Student Borrower';
  const studentEmail = user?.email || 'student@libman.edu';
  const studentDept = user?.department || 'Computer Science';
  const studentRole = user?.role || 'Student/Faculty';
  const cardId = `BT-2026-${Math.abs((user?.id || '9042').toString().split('').reduce((a,b)=>a+b.charCodeAt(0),0))}`;

  useEffect(() => {
    if (isOpen) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const verifyUrl = `${baseUrl}/verify-pass?id=${cardId}&name=${encodeURIComponent(studentName)}&email=${encodeURIComponent(studentEmail)}&dept=${encodeURIComponent(studentDept)}`;
      
      generateQRCodeDataUrl(verifyUrl).then((url) => {
        if (url) setQrUrl(url);
      });
    }
  }, [isOpen, cardId, studentName, studentEmail, studentDept]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card shadow-2xl relative border-2 border-indigo-500/30">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Digital Borrower Pass (BT Card)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Present this card or QR code at the circulation counter.
          </p>
        </div>

        {/* Physical Smart BT Card Layout */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold tracking-tight text-white block truncate max-w-[200px]" title={user?.collegeName || user?.institution}>
                  {user?.collegeName || user?.institution || 'CAMPUS LIBRARY'}
                </span>
                <span className="text-[9px] text-indigo-300 block font-medium uppercase tracking-wider">
                  STUDENT BORROWER PASS
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              VERIFIED
            </span>
          </div>

          {/* Card Body */}
          <div className="flex items-start gap-4 my-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
              <User className="w-8 h-8" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-extrabold text-white truncate">{studentName}</h3>
              <p className="text-xs text-indigo-200">{studentRole} • {studentDept}</p>
              <p className="text-[11px] font-mono text-indigo-300 mt-1 truncate">{studentEmail}</p>
            </div>
          </div>

          {/* Real Generated 2D QR Code */}
          <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-indigo-300">BT PASS NUMBER</p>
              <p className="text-xs font-mono font-extrabold text-white tracking-widest">{cardId}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <CheckCircle className="w-3 h-3" />
                <span>2 / 5 Books Borrowed</span>
              </div>
            </div>

            {/* Real Valid Generated QR Code Image */}
            <div className="p-1.5 bg-white rounded-xl shadow-md flex items-center justify-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Student BT Card Pass QR Code" className="w-16 h-16 rounded" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">QR</div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={() => alert(`Printing Digital BT Card Pass for ${studentName}`)}
            className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print BT Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
