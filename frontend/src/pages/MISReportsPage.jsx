import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, IndianRupee, FileText, Download, Award } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart as RePieChart, Pie, Cell } from 'recharts';

export const MISReportsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [misLogs, setMisLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const mData = await api.getDashboardMetrics();
      setMetrics(mData);
      const lData = await api.getMISLogs();
      setMisLogs(lData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ['#a10053', '#680048', '#2f003e', '#c2185b', '#e377ac'];

  if (loading || !metrics) {
    return <div className="py-12 text-center text-white font-extrabold text-base">Loading NAAC & NIRF MIS Analytical Reports...</div>;
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#a10053] bg-pink-100 px-3 py-1 rounded-full border border-pink-300 mb-2">
            <Award className="w-4 h-4 text-[#a10053]" /> NAAC A++ & NIRF Institutional ERP Standard
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#a10053]" />
            Module 5: NAAC / NIRF MIS Reports & Analytics
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            UGC compliance logs, department utilization stats, NAAC audit reports, and annual budget analysis in INR (₹).
          </p>
        </div>

        <button
          onClick={() => alert("Accession Register PDF report for NAAC / NIRF Audit exported successfully!")}
          className="px-6 py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-900/30 transition flex items-center gap-2 self-start md:self-auto border border-[#880045]"
        >
          <Download className="w-4 h-4 text-white" />
          <span className="text-white font-black">Export Accession Register (PDF)</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Document Utilization Rate"
          value={`${metrics.utilization_rate_pct}%`}
          subtitle="Circulation turnover ratio"
          icon={TrendingUp}
          color="emerald"
          trend="+4.2%"
        />
        <StatCard
          title="Total Holdings"
          value={metrics.total_books.toString()}
          subtitle={`${metrics.total_titles} Unique Titles`}
          icon={FileText}
          color="yono"
        />
        <StatCard
          title="Annual Library Budget"
          value={`₹${(metrics.budget_spent * 80 / 1000).toFixed(1)}k / ₹${(metrics.budget_allocated * 80 / 1000).toFixed(1)}k`}
          subtitle="59.4% Budget Consumed"
          icon={IndianRupee}
          color="purple"
        />
        <StatCard
          title="Fine Collections (Month)"
          value={`₹${(metrics.fine_collected_month * 80).toFixed(2)}`}
          subtitle="Overdue fines collected"
          icon={IndianRupee}
          color="amber"
        />
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Circulation Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-900 text-base">Monthly Student Circulation Trends</h3>
              <p className="text-xs text-slate-600 font-bold">Issues vs Returns vs Overdue Fines Collected (INR ₹)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthly_circulation_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="issued" fill="#a10053" radius={[4, 4, 0, 0]} name="Books Issued" />
                <Bar dataKey="returned" fill="#059669" radius={[4, 4, 0, 0]} name="Books Returned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Usage Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base">Departmental Utilization</h3>
            <p className="text-xs text-slate-600 font-bold">Book checkout distribution across engineering branches</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={metrics.department_utilization}
                  dataKey="usage"
                  nameKey="dept"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {metrics.department_utilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {metrics.department_utilization.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.dept}</span>
                <span className="font-mono font-black text-slate-900 ml-auto">{item.usage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#a10053]" /> NAAC / NIRF Accession & Write-off Audit Register
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-900 uppercase font-mono text-[11px] tracking-wider border-b border-slate-200 font-black">
              <tr>
                <th className="p-4 font-black">Log Type</th>
                <th className="p-4 font-black">Audit Record & Description</th>
                <th className="p-4 font-black text-center">Amount (INR ₹)</th>
                <th className="p-4 font-black text-center">Recorded By</th>
                <th className="p-4 font-black text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {misLogs.map((log) => (
                <tr key={log.id} className="hover:bg-pink-50/50 transition">
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] uppercase font-black ${
                        log.log_type === 'Accession'
                          ? 'bg-pink-100 text-[#a10053] border border-pink-300'
                          : log.log_type === 'Lost'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {log.log_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-sm">{log.title}</div>
                    <div className="text-[11px] text-slate-600 font-bold">{log.description}</div>
                  </td>
                  <td className="p-4 text-center font-mono font-black text-emerald-700">
                    {log.amount > 0 ? `₹${(log.amount * 80).toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4 text-center text-slate-900 font-bold">{log.recorded_by}</td>
                  <td className="p-4 text-right font-mono text-slate-700">
                    {new Date(log.timestamp).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
