'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, subtext, icon: Icon, color = 'indigo', trend, trendValue }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    pink: 'from-pink-500/20 to-pink-600/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  };

  const badgeColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${badgeColor} border shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
        <span className="text-xs text-slate-500 dark:text-slate-400">{subtext}</span>
      </div>
    </div>
  );
}
