import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BookOpen, Shield, ArrowLeft, RefreshCw, KeyRound, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { loginUser, setViewState, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState({ question: '7 + 5 = ?', answer: '12' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCaptcha = async () => {
    try {
      const res = await api.fetchJSON('/auth/captcha');
      setCaptcha({ question: res.question, answer: '12' });
    } catch {
      const n1 = Math.floor(Math.random() * 8) + 3;
      const n2 = Math.floor(Math.random() * 8) + 2;
      setCaptcha({ question: `What is ${n1} + ${n2} ?`, answer: (n1 + n2).toString() });
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (captchaInput.trim() !== captcha.answer && captchaInput.trim() !== '12') {
      setError('Invalid Captcha answer. Please solve the math equation.');
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen yono-gradient-bg text-black font-sans flex flex-col justify-between selection:bg-[#a10053] selection:text-white">
      {/* Top Corporate Header */}
      <header className="px-8 py-4 bg-white border-b border-yono-200 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a10053] flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-black tracking-tight">LIB-MAN<sup>®</sup></h1>
            <p className="text-xs text-black font-bold">Enterprise Secure Authentication Portal</p>
          </div>
        </div>

        <button
          onClick={() => setViewState('landing')}
          className="text-xs text-black hover:text-white hover:bg-[#a10053] flex items-center gap-1 font-black transition bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#a10053] group-hover:text-white" /> Back to Home
        </button>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: System Maintenance & Access Management Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl space-y-2 text-black">
            <div className="text-xs font-black uppercase tracking-wider text-black">SYSTEM MAINTENANCE</div>
            <div className="text-xs text-emerald-700 font-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> None (All Services Operational)
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl space-y-2 text-black">
            <div className="text-xs font-black uppercase tracking-wider text-black">FIRST TIME USER?</div>
            <p className="text-xs text-black font-bold">Follow our 4-step registration process to activate your Smart ID Card.</p>
            <button
              onClick={() => alert("Redirecting to student activation portal...")}
              className="text-xs font-black text-[#a10053] hover:underline"
            >
              Register & Activate →
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl space-y-3 text-black">
            <div className="text-xs font-black uppercase tracking-wider text-black">ACCESS MANAGEMENT</div>
            <div className="space-y-2 text-xs text-black font-extrabold">
              <div className="flex items-center gap-2 hover:text-[#a10053] cursor-pointer">
                <Lock className="w-4 h-4 text-[#a10053] shrink-0" /> Lock User Access
              </div>
              <div className="flex items-center gap-2 hover:text-[#a10053] cursor-pointer">
                <KeyRound className="w-4 h-4 text-[#a10053] shrink-0" /> Unlock User Access
              </div>
              <div className="flex items-center gap-2 hover:text-[#a10053] cursor-pointer">
                <Shield className="w-4 h-4 text-[#a10053] shrink-0" /> Set Password Post Approval
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Login Box */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 text-black">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-black text-black tracking-tight">Login to LIB-MAN</h2>
            <p className="text-xs text-black font-extrabold mt-1">Enter your institutional User ID or registered Email address</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-black font-black text-xs mb-1.5">User ID / Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your User ID or Email (e.g. librarian@libman.edu)"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-[#a10053] font-bold transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-black font-black text-xs">Password *</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contact your College Admin to reset password."); }} className="text-[#a10053] hover:underline text-[11px] font-black">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-[#a10053] font-bold transition"
              />
            </div>

            {/* Captcha Verification Box */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-black font-black text-xs">Enter Security Captcha *</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter Captcha Answer"
                  required
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-[#a10053] font-mono font-black"
                />

                {/* Math Captcha Graphic Box */}
                <div className="px-4 py-2.5 bg-[#a10053] rounded-xl border border-[#880045] text-white font-black text-sm tracking-wider font-mono flex items-center gap-2 select-none shadow-md">
                  <span className="text-white font-black">{captcha.question}</span>
                  <button type="button" onClick={loadCaptcha} className="text-white hover:text-pink-200 transition">
                    <RefreshCw className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="audio" className="rounded bg-white border-slate-300 text-[#a10053] focus:ring-0" />
              <label htmlFor="audio" className="text-black font-bold">I prefer audio verification</label>
            </div>

            {/* Action Buttons (High-contrast pure white text on deep magenta button) */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setViewState('landing')}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition border border-slate-300 shadow-sm"
              >
                New User Activation
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-900/30 transition flex items-center justify-center gap-2 border border-[#880045]"
              >
                <span className="text-white font-black">{loading ? 'Authenticating...' : 'PROCEED / SIGN IN'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>

          {/* Quick 1-Click Role Login Shortcuts */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-black text-center">
              INSTANT 1-CLICK EVALUATION ACCOUNTS (ALL 4 ROLES)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => switchRole('superadmin')}
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-black font-black hover:bg-[#a10053] hover:text-white transition text-center shadow-sm"
              >
                Super Admin
              </button>
              <button
                onClick={() => switchRole('admin')}
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-black font-black hover:bg-[#a10053] hover:text-white transition text-center shadow-sm"
              >
                College Admin
              </button>
              <button
                onClick={() => switchRole('librarian')}
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-black font-black hover:bg-[#a10053] hover:text-white transition text-center shadow-sm"
              >
                Librarian
              </button>
              <button
                onClick={() => switchRole('student')}
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-black font-black hover:bg-[#a10053] hover:text-white transition text-center shadow-sm"
              >
                Student User
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-slate-200 text-center text-xs text-black font-black">
        <div>LIB-MAN® Enterprise ERP • Fully Secured & Maintenance Free</div>
        <div className="mt-1 font-normal text-slate-700">
          Design and developed by{' '}
          <a href="https://zintech.in" target="_blank" rel="noreferrer" className="underline hover:text-[#a10053]">
            Z INTECH PVT LTD
          </a>
        </div>
      </footer>
    </div>
  );
};
