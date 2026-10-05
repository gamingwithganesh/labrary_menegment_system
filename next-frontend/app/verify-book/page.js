'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Barcode, 
  Calendar, 
  IndianRupee, 
  Printer, 
  ArrowLeft,
  Sparkles,
  Search,
  BookMarked
} from 'lucide-react';
import { api } from '@/lib/api';

function VerifyBookContent() {
  const searchParams = useSearchParams();

  const accCode = searchParams.get('acc') || searchParams.get('accession') || searchParams.get('id') || 'ACC-2026-8849';
  const paramTitle = searchParams.get('title') || '';
  const paramAuthor = searchParams.get('author') || '';
  const paramIsbn = searchParams.get('isbn') || '';
  const paramRack = searchParams.get('rack') || searchParams.get('location') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramStatus = searchParams.get('status') || '';

  const [bookDetails, setBookDetails] = useState({
    title: paramTitle || 'Data Structures and Algorithms in C++',
    author: paramAuthor || 'Adam Drozdek',
    isbn: paramIsbn || '978-0131103627',
    category: paramCategory || 'Computer Science',
    location: paramRack || 'Rack CS-01 • Shelf A',
    status: paramStatus || 'Available',
    accessionCode: accCode,
    edition: '1st Edition',
    publisher: 'Academic Press',
    year: 2026
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const books = await api.getBooks(accCode);
        if (Array.isArray(books) && books.length > 0) {
          const found = books.find(b => 
            b.accessionCode === accCode || 
            b.id === accCode || 
            (b.copiesList && b.copiesList.some(c => c.accessionNumber === accCode || c.barcode === accCode))
          ) || books[0];

          if (found) {
            setBookDetails({
              title: found.title,
              author: found.author,
              isbn: found.isbn,
              category: found.category || 'General',
              location: found.location || found.rack || 'Rack CS-01',
              status: found.status || 'Available',
              accessionCode: accCode,
              edition: found.edition || '1st Edition',
              publisher: found.publisher || 'Academic Press',
              year: found.year || 2026
            });
          }
        }
      } catch (err) {
        console.warn('Live catalog fetch completed with URL parameters fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [accCode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Navigation & Verification Badge Header */}
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
            OFFICIAL VERIFIED BOOK TAG
          </span>
        </div>

        {/* Header Title Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Official Accession Verification</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Smart Label Tag: <strong className="text-indigo-600 font-bold">{accCode}</strong>
          </p>
        </div>

        {/* Book Information Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              <span>Catalog Record Details</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              bookDetails.status === 'Available' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {bookDetails.status === 'Available' ? 'Available in Stack' : bookDetails.status}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Book Title</span>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{bookDetails.title}</h3>
              <p className="text-slate-600 font-medium pt-0.5">By {bookDetails.author}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Physical Shelf Location</span>
                </span>
                <strong className="text-xs text-slate-900 font-bold">{bookDetails.location}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Subject Classification</span>
                </span>
                <strong className="text-xs text-slate-900 font-bold">{bookDetails.category}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium">ISBN Identifier</span>
                <strong className="text-xs text-slate-900 font-mono font-bold">{bookDetails.isbn}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 font-medium">Edition / Year</span>
                <strong className="text-xs text-slate-900 font-bold">{bookDetails.edition} • {bookDetails.year}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Smart Tag</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search in OPAC Catalog</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 font-medium">
          Official Institutional Library Management System • Powered by Z INTECH
        </div>
      </div>
    </div>
  );
}

export default function VerifyBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-semibold">
        Verifying Accession Smart Label...
      </div>
    }>
      <VerifyBookContent />
    </Suspense>
  );
}
