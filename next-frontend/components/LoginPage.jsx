'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, RefreshCw, AlertCircle, ArrowLeft, Sun, Moon, Lock, ShieldCheck, User, LogIn, KeyRound } from 'lucide-react';

export function LoginPage() {
  const { login, setViewState } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [num1] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [num2] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(captchaAnswer) !== num1 + num2) {
      setErrorMsg(`Incorrect security verification! What is ${num1} + ${num2}?`);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="p-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          onClick={() => setViewState('landing')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </header>

      {/* Login Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white shadow-xl relative border border-slate-200/80">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Portal Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your account credentials
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>User ID</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter User ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>

            {/* CAPTCHA Challenge */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Security Verification</span>
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  What is {num1} + {num2}?
                </span>
              </div>
              <input
                type="number"
                required
                placeholder="Enter answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500">
        LIB-MAN Enterprise • Institutional Library Management System
      </footer>
    </div>
  );
}
