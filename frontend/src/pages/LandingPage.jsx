import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Shield, ArrowRight, CheckCircle2, Sparkles, Server, QrCode, Building2 } from 'lucide-react';

export const LandingPage = () => {
  const { setViewState, loginUser } = useAuth();

  return (
    <div className="min-h-screen yono-gradient-bg text-slate-900 font-sans selection:bg-[#a10053] selection:text-white">
      {/* Top Corporate Utility Header */}
      <div className="bg-white border-b border-yono-200 text-xs px-4 sm:px-8 py-2 flex flex-col gap-3 sm:flex-row items-center justify-between text-black font-bold shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-black font-extrabold">
            <Server className="w-3.5 h-3.5 text-[#a10053]" /> Enterprise Library ERP v2026
          </span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline text-emerald-700 font-mono font-bold">Status: Live & Connected to MongoDB Compass</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="hover:text-[#a10053] text-black font-bold transition">Module Specs</a>
          <a href="#hierarchy" className="hover:text-[#a10053] text-black font-bold transition">Role Hierarchy</a>
          <button
            onClick={() => setViewState('login')}
            className="text-[#a10053] font-black hover:underline flex items-center gap-1"
          >
            Login Portal <ArrowRight className="w-3.5 h-3.5 text-[#a10053]" />
          </button>
        </div>
      </div>

      {/* Main Navbar Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-yono-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#a10053] flex items-center justify-center shadow-lg shadow-pink-900/40 ring-2 ring-yono-100">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-black tracking-tight">LIB-MAN<sup>®</sup></h1>
              <span className="text-[10px] uppercase font-black tracking-widest bg-pink-100 text-[#a10053] border border-pink-300 px-2.5 py-0.5 rounded-full">
                ENTERPRISE PACKAGE
              </span>
            </div>
            <p className="text-xs text-black font-bold">Library ERP Software for Colleges</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewState('login')}
            className="px-6 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-900/30 transition flex items-center gap-2 border border-[#880045]"
          >
            <span className="text-white font-black">SIGN IN TO PORTAL</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 py-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold shadow-lg">
              <Sparkles className="w-4 h-4 text-pink-300" /> Web-Based Fully Integrated Library System
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
              Library Automation <br />
              <span className="text-pink-300 underline decoration-pink-400">For Every College & University</span>
            </h1>

            <p className="text-base text-pink-100 font-semibold leading-relaxed">
              LIB-MAN<sup>®</sup> is a powerful, user-friendly multi-user package designed for the complete computerization of in-house library operations. Embedded with UHF RFID integration, ISBN auto-cataloguing, barcode/QR code generation, and multi-lingual OPAC search.
            </p>

            {/* Quick 1-Click Role Login Shortcuts */}
            <div className="pt-2">
              <div className="text-xs font-black uppercase tracking-wider text-pink-200 mb-3">
                SELECT YOUR ROLE TO TEST 1-CLICK DEMO:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={async () => {
                    await loginUser('superadmin@libman.edu', 'admin123');
                  }}
                  className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:border-[#a10053] text-left transition group shadow-2xl hover:-translate-y-1"
                >
                  <div className="text-[10px] font-black text-[#a10053] uppercase tracking-wider">Tier 1</div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-[#a10053]">Super Admin</div>
                  <div className="text-[11px] text-slate-600 font-bold">Company Level</div>
                </button>

                <button
                  onClick={async () => {
                    await loginUser('admin@libman.edu', 'admin123');
                  }}
                  className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:border-[#a10053] text-left transition group shadow-2xl hover:-translate-y-1"
                >
                  <div className="text-[10px] font-black text-[#a10053] uppercase tracking-wider">Tier 2</div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-[#a10053]">College Admin</div>
                  <div className="text-[11px] text-slate-600 font-bold">Institute Level</div>
                </button>

                <button
                  onClick={async () => {
                    await loginUser('librarian@libman.edu', 'admin123');
                  }}
                  className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:border-[#a10053] text-left transition group shadow-2xl hover:-translate-y-1"
                >
                  <div className="text-[10px] font-black text-[#a10053] uppercase tracking-wider">Tier 3</div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-[#a10053]">Librarian</div>
                  <div className="text-[11px] text-slate-600 font-bold">Staff & Tools</div>
                </button>

                <button
                  onClick={async () => {
                    await loginUser('student@libman.edu', 'admin123');
                  }}
                  className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:border-[#a10053] text-left transition group shadow-2xl hover:-translate-y-1"
                >
                  <div className="text-[10px] font-black text-[#a10053] uppercase tracking-wider">Tier 4</div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-[#a10053]">Student User</div>
                  <div className="text-[11px] text-slate-600 font-bold">OPAC & Loans</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-2xl relative text-slate-900">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">System Specification</h3>
                  <p className="text-xs text-slate-600 font-bold">LIB-MAN Multi-User ERP Suite</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-[#a10053] border border-pink-300 text-xs font-mono font-black">
                  v2026 Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-[#a10053] shrink-0" />
                  <div>
                    <div className="font-black text-slate-900">100% Data Assurance</div>
                    <div className="text-slate-600 text-[11px] font-bold">MARC21 & AACR2 standards compliance</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-200">
                  <QrCode className="w-5 h-5 text-[#a10053] shrink-0" />
                  <div>
                    <div className="font-black text-slate-900">UHF RFID & Barcode Enabled</div>
                    <div className="text-slate-600 text-[11px] font-bold">Smart Card printing & automated circulation</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-200">
                  <Server className="w-5 h-5 text-[#a10053] shrink-0" />
                  <div>
                    <div className="font-black text-slate-900">MongoDB Compass Connection</div>
                    <div className="text-slate-600 text-[11px] font-mono font-bold">mongodb://localhost:27017/libman_db</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Flowchart Section */}
      <section id="hierarchy" className="px-8 py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Role Hierarchy & System Flowchart</h2>
            <p className="text-xs text-slate-600 font-bold">
              4-tier organizational control structure: Super Admin (Company) &rarr; College Admin &rarr; Librarian &rarr; Student Tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#a10053] text-white mx-auto flex items-center justify-center font-black text-xl shadow-lg">
                1
              </div>
              <h3 className="font-black text-slate-900 text-base">Super Admin</h3>
              <p className="text-xs text-slate-600 font-bold">
                Company level. Creates and manages College Admins and global SaaS subscriptions.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#a10053] text-white mx-auto flex items-center justify-center font-black text-xl shadow-lg">
                2
              </div>
              <h3 className="font-black text-slate-900 text-base">College Admin</h3>
              <p className="text-xs text-slate-600 font-bold">
                Institute level. Creates and manages Librarians and institute budget allocations.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#a10053] text-white mx-auto flex items-center justify-center font-black text-xl shadow-lg">
                3
              </div>
              <h3 className="font-black text-slate-900 text-base">Librarian</h3>
              <p className="text-xs text-slate-600 font-bold">
                Staff level. Handles Cataloguing, Circulation desk, Serials, MIS reports & Student tools.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#a10053] text-white mx-auto flex items-center justify-center font-black text-xl shadow-lg">
                4
              </div>
              <h3 className="font-black text-slate-900 text-base">Student / User</h3>
              <p className="text-xs text-slate-600 font-bold">
                End-user borrower. OPAC search, loan status, fine view & hold reservations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Brochure Matrix Section */}
      <section id="features" className="px-8 py-16 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2 text-white">
          <h2 className="text-3xl font-black tracking-tight text-white">Core Modules of LIB-MAN<sup>®</sup></h2>
          <p className="text-sm text-pink-100 font-bold">
            Comprehensive feature matrix for full-scale college library computerization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#a10053] text-white flex items-center justify-center text-xs font-black shadow">1</span>
              Acquisition & Cataloguing
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside font-bold">
              <li>Book Requisitions & Procurement</li>
              <li>Vendor Quotes, POs & Invoices</li>
              <li>Invoicing & Accession Register</li>
              <li>Withdrawal / Write-off & Lost Books</li>
              <li>Stock Verification (Barcode & RFID)</li>
              <li>AACR2 Catalogue & Multi-lingual search</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#a10053] text-white flex items-center justify-center text-xs font-black shadow">2</span>
              Circulation Management
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside font-bold">
              <li>Smart ID Card Printing & Biometrics</li>
              <li>Issue, Return & Renewal Processing</li>
              <li>Automated Overdue Fine Calculation ($2/day)</li>
              <li>Reservation & Hold Claims</li>
              <li>Overdue Recall Notices & Clearance</li>
              <li>Circulation Register Reports</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#a10053] text-white flex items-center justify-center text-xs font-black shadow">3</span>
              OPAC - Public Catalogue
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside font-bold">
              <li>Search by Title, Author, Subject & ISBN</li>
              <li>Accession No & Shelf Location Lookup</li>
              <li>Combinational & Keyword Search</li>
              <li>Multi-lingual search support</li>
              <li>Online Hold Reservation Button</li>
              <li>Book Availability Tracker</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#a10053] text-white flex items-center justify-center text-xs font-black shadow">4</span>
              Serial Control
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside font-bold">
              <li>New/Renewal Subscription Orders</li>
              <li>Non-Receipt Issue Reminders</li>
              <li>Daily Newspaper Receipt Register</li>
              <li>Bound Volume Creation & Archive</li>
              <li>Serial OPAC & Binding Orders</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-200 shadow-xl text-slate-900">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#a10053] text-white flex items-center justify-center text-xs font-black shadow">5</span>
              MIS Reports & Analytics
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside font-bold">
              <li>Document Utilization Analysis</li>
              <li>Budget Allocation & Expenditure</li>
              <li>Lost / Missing / Withdrawal Audits</li>
              <li>Yearly Statistical Graphical Reports</li>
              <li>Accession Register Export (PDF/Excel)</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl space-y-4 border border-pink-300 shadow-xl text-slate-900">
            <h3 className="font-black text-base text-[#a10053] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#a10053]" />
              Add-On Modules
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside font-bold">
              <li>UHF RFID Library Integration</li>
              <li>Smart Phone App (M-OPAC)</li>
              <li>SMS & Email Notification Gateway</li>
              <li>Multi-Lingual Fonts Package</li>
            </ul>
            <button
              onClick={() => setViewState('login')}
              className="w-full mt-4 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition border border-[#880045]"
            >
              <span className="text-white font-black">ACCESS PORTAL NOW</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Bar */}
      <footer className="border-t border-slate-200 bg-white px-8 py-8 text-xs text-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="font-black text-slate-900 text-sm">LIB-MAN® Enterprise Library Management System</div>
          <div className="font-bold text-slate-600">© 2026 All Rights Reserved • College ERP Suite</div>
          <div className="text-slate-600">
            Design and developed by{' '}
            <a
              href="https://zintech.in"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[#a10053]"
            >
              Z INTECH PVT LTD
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-800 font-bold">
          <span className="font-mono font-bold">MongoDB Compass Ready: mongodb://localhost:27017</span>
          <button
            onClick={() => setViewState('login')}
            className="px-4 py-2 bg-[#a10053] hover:bg-[#880045] text-white font-black rounded-lg shadow-sm transition border border-[#880045]"
          >
            <span className="text-white font-black">PORTAL LOGIN</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
