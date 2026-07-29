import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'yono', trend }) => {
  const colorStyles = {
    yono: 'bg-yono-50 text-yono-700 border-yono-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-yono-200">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-yono-700/90 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-black text-yono-900 mt-1 tracking-tight">{value}</div>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-yono-700/80">
        <span>{subtitle}</span>
        {trend && (
          <span className="font-bold text-yono-800 bg-yono-100 px-2 py-0.5 rounded text-[10px] border border-yono-300">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
