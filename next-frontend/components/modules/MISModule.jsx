'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { exportToExcel } from '@/lib/export-excel';
import { 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  BookOpen, 
  Repeat, 
  AlertTriangle, 
  IndianRupee, 
  TrendingUp, 
  RefreshCw,
  Calendar,
  FileSpreadsheet,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Radio
} from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export function MISModule() {
  const [timeRange, setTimeRange] = useState('all'); // 'all' | 'month' | 'quarter' | 'year'
  const [chartView, setChartView] = useState('bar'); // 'bar' | 'stacked' | 'area'
  const [monthSpan, setMonthSpan] = useState('6'); // '6' | '12' | 'ytd'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [circRecords, setCircRecords] = useState([]);

  // Calculate live dynamic metrics from database
  const calculateLiveMetrics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsSyncing(true);

    try {
      const [books, circulations, members] = await Promise.all([
        api.getBooks(''),
        api.getCirculationRecords(),
        api.getMembers()
      ]);

      const bookList = Array.isArray(books) ? books : [];
      const circList = Array.isArray(circulations) ? circulations : [];
      const memberList = Array.isArray(members) ? members : [];

      setCircRecords(circList);

      // 1. Calculate Live Total Holdings (Copies)
      const totalCopies = bookList.reduce((sum, b) => sum + Number(b.copies || 1), 0);

      // 2. Filter circulations based on selected timeRange
      const now = new Date();
      const filteredCirc = circList.filter((r) => {
        if (timeRange === 'all') return true;
        const issueDate = new Date(r.issueDate || Date.now());
        const diffDays = (now - issueDate) / (1000 * 3600 * 24);
        if (timeRange === 'month') return diffDays <= 30;
        if (timeRange === 'quarter') return diffDays <= 90;
        if (timeRange === 'year') return diffDays <= 365;
        return true;
      });

      // 3. Compute Active & Overdue Loans
      const activeCount = filteredCirc.filter(r => r.status === 'Active').length;
      const overdueCount = filteredCirc.filter(r => r.status === 'Overdue').length;

      // 4. Compute Fines Collected & Pending Fines
      const totalFines = filteredCirc.reduce((sum, r) => sum + (Number(r.fine) || 0), 0) + 
        memberList.reduce((sum, m) => sum + (Number(m.fineAmount) || 0), 0);

      // 5. Compute Utilization Rate %
      const utilizationRate = totalCopies > 0 
        ? Math.min(100, Math.round((activeCount / totalCopies) * 100 * 10) / 10) 
        : 0;

      // 6. Dynamic Department Breakdown Calculation
      const deptMap = {};
      bookList.forEach(b => {
        const cat = b.category || 'General';
        deptMap[cat] = (deptMap[cat] || 0) + 1;
      });

      const deptUtilization = Object.keys(deptMap).map(dept => ({
        department: dept,
        count: deptMap[dept]
      }));

      setStats({
        total_books: totalCopies || bookList.length,
        active_loans: activeCount,
        overdue_loans: overdueCount,
        total_fines_collected: totalFines,
        utilization_rate_pct: utilizationRate,
        department_utilization: deptUtilization
      });

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to calculate live MIS metrics:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [timeRange]);

  // Initial load and filter reload
  useEffect(() => {
    calculateLiveMetrics();
  }, [calculateLiveMetrics]);

  // Real-time polling auto-sync every 15 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      calculateLiveMetrics(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, calculateLiveMetrics]);

  // Real-time Dynamic Monthly Circulation Data Calculation (100% Live DB Records)
  const monthlyCirculationData = useMemo(() => {
    const numMonths = monthSpan === '6' ? 6 : monthSpan === '12' ? 12 : (new Date().getMonth() + 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const buckets = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const label = numMonths <= 6 ? `${monthNames[monthIdx]}` : `${monthNames[monthIdx]} '${String(year).slice(-2)}`;
      buckets.push({
        key: monthKey,
        month: label,
        year,
        monthIdx,
        issueCount: 0,
        returnCount: 0
      });
    }

    // Tally actual circulation records into buckets
    const bucketMap = {};
    buckets.forEach(b => { bucketMap[b.key] = b; });

    circRecords.forEach(r => {
      // Issue tally
      if (r.issueDate) {
        const issueDateObj = new Date(r.issueDate);
        if (!isNaN(issueDateObj.getTime())) {
          const issueKey = `${issueDateObj.getFullYear()}-${String(issueDateObj.getMonth() + 1).padStart(2, '0')}`;
          if (bucketMap[issueKey]) {
            bucketMap[issueKey].issueCount += 1;
          }
        }
      }

      // Return tally
      if (r.returnDate) {
        const returnDateObj = new Date(r.returnDate);
        if (!isNaN(returnDateObj.getTime())) {
          const returnKey = `${returnDateObj.getFullYear()}-${String(returnDateObj.getMonth() + 1).padStart(2, '0')}`;
          if (bucketMap[returnKey]) {
            bucketMap[returnKey].returnCount += 1;
          }
        }
      } else if (r.status === 'Returned' && r.issueDate) {
        const fallbackDateObj = new Date(r.issueDate);
        if (!isNaN(fallbackDateObj.getTime())) {
          const fallbackKey = `${fallbackDateObj.getFullYear()}-${String(fallbackDateObj.getMonth() + 1).padStart(2, '0')}`;
          if (bucketMap[fallbackKey]) {
            bucketMap[fallbackKey].returnCount += 1;
          }
        }
      }
    });

    return buckets.map((b) => ({
      ...b,
      issueCount: b.issueCount,
      returnCount: b.returnCount,
      netCirculation: Math.max(0, b.issueCount - b.returnCount),
      efficiencyRate: b.issueCount > 0 ? Math.round((b.returnCount / b.issueCount) * 100) : 0
    }));
  }, [circRecords, monthSpan]);

  // Derived Period Totals
  const periodStats = useMemo(() => {
    if (!monthlyCirculationData.length) {
      return { totalIssues: 0, totalReturns: 0, avgRate: 0, peakMonth: 'None' };
    }
    const totalIssues = monthlyCirculationData.reduce((acc, curr) => acc + curr.issueCount, 0);
    const totalReturns = monthlyCirculationData.reduce((acc, curr) => acc + curr.returnCount, 0);
    const avgRate = totalIssues > 0 ? Math.round((totalReturns / totalIssues) * 100) : 0;
    
    let peak = monthlyCirculationData[0];
    let maxCount = 0;
    monthlyCirculationData.forEach(m => {
      if (m.issueCount > maxCount) {
        maxCount = m.issueCount;
        peak = m;
      }
    });

    return {
      totalIssues,
      totalReturns,
      avgRate,
      peakMonth: maxCount > 0 ? peak.month : 'None'
    };
  }, [monthlyCirculationData]);

  const exportExcel = () => {
    if (!stats) return;

    const summaryColumns = [
      { header: 'Institutional Library Metric', key: 'metric' },
      { header: 'Metric Value', key: 'value' }
    ];

    const summaryData = [
      { metric: 'Total Book Holdings (Copies)', value: stats.total_books },
      { metric: 'Active Borrower Circulations', value: stats.active_loans },
      { metric: 'Overdue Outstanding Loans', value: stats.overdue_loans },
      { metric: 'Total Fines Assessed & Collected (INR)', value: `₹${stats.total_fines_collected}` },
      { metric: 'Catalog Utilization Rate', value: `${stats.utilization_rate_pct}%` },
      { metric: 'Selected Circulation Period Total Issued', value: periodStats.totalIssues },
      { metric: 'Selected Circulation Period Total Returned', value: periodStats.totalReturns },
      { metric: 'Circulation Return Efficiency Rate', value: `${periodStats.avgRate}%` },
      ...monthlyCirculationData.map(s => ({
        metric: `Monthly Trend - ${s.month} (${s.year || ''})`,
        value: `${s.issueCount} Issued / ${s.returnCount} Returned (Return Rate: ${s.efficiencyRate}%)`
      }))
    ];

    exportToExcel({
      filename: `Library_MIS_Analytics_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`,
      columns: summaryColumns,
      data: summaryData
    });
  };

  // Custom Interactive Tooltip
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const issued = payload.find(p => p.dataKey === 'issueCount')?.value || 0;
      const returned = payload.find(p => p.dataKey === 'returnCount')?.value || 0;
      const diff = issued - returned;
      const rate = issued > 0 ? Math.round((returned / issued) * 100) : 100;

      return (
        <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {label}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">
              {rate}% Return Rate
            </span>
          </div>

          <div className="space-y-1 font-medium">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Issued Books:</span>
              </span>
              <strong className="font-mono">{issued.toLocaleString()}</strong>
            </div>

            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>Returned Books:</span>
              </span>
              <strong className="font-mono">{returned.toLocaleString()}</strong>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span>Net Active Balance:</span>
              <strong className="font-mono text-slate-700 dark:text-slate-300">
                {diff > 0 ? `+${diff}` : diff}
              </strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Analytics & MIS Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold border border-indigo-200/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Realtime MIS
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time catalog holdings, dynamic monthly circulation trends, and department analytics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'quarter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Quarterly
            </button>
          </div>

          <button
            onClick={() => calculateLiveMetrics(false)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 shadow-sm transition-all"
            title="Recalculate Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading || isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={exportExcel}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            title="Download Excel / CSV Summary"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {loading || !stats ? (
        <div className="p-16 text-center text-slate-400 glass-card rounded-3xl animate-pulse space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold">Aggregating live circulation and catalog statistics...</p>
        </div>
      ) : (
        <>
          {/* Dynamic KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Live Holdings"
              value={stats.total_books.toLocaleString()}
              subtext="Dynamically calculated copies"
              icon={BookOpen}
              color="indigo"
              trend="up"
              trendValue="Live"
            />
            <StatCard
              title="Active Circulation"
              value={stats.active_loans.toLocaleString()}
              subtext="Books currently checked out"
              icon={Repeat}
              color="purple"
              trend="up"
              trendValue="Live"
            />
            <StatCard
              title="Overdue Notices"
              value={stats.overdue_loans.toLocaleString()}
              subtext="Items past return date"
              icon={AlertTriangle}
              color="amber"
              trend="down"
              trendValue="Live"
            />
            <StatCard
              title="Total Fines Collected"
              value={`₹${stats.total_fines_collected.toLocaleString()}`}
              subtext="Dynamic fine calculation"
              icon={IndianRupee}
              color="emerald"
              trend="up"
              trendValue="Live"
            />
          </div>

          {/* DYNAMIC & REALTIME RESPONSIVE MONTHLY CIRCULATION SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Monthly Circulation Comparison Card */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between transition-all">
              <div>
                {/* Header & Interactive Control Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Monthly Circulation Comparison</span>
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Dynamic breakdown of Book Issues vs Returns across rolling academic cycles
                    </p>
                  </div>

                  {/* Real-time Indicator & Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Stream Pulse Badge */}
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
                        autoRefresh 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                      title={autoRefresh ? 'Real-time live streaming active' : 'Live streaming paused'}
                    >
                      <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                      <span>{autoRefresh ? 'Live Stream' : 'Stream Paused'}</span>
                    </button>

                    {/* Horizon Span (6M / 12M / YTD) */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                      <button
                        onClick={() => setMonthSpan('6')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${monthSpan === '6' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
                      >
                        6M
                      </button>
                      <button
                        onClick={() => setMonthSpan('12')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${monthSpan === '12' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
                      >
                        12M
                      </button>
                      <button
                        onClick={() => setMonthSpan('ytd')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${monthSpan === 'ytd' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
                      >
                        YTD
                      </button>
                    </div>

                    {/* Chart Style Switcher */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                      <button
                        onClick={() => setChartView('bar')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${chartView === 'bar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
                        title="Grouped Bar Chart"
                      >
                        Grouped
                      </button>
                      <button
                        onClick={() => setChartView('stacked')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${chartView === 'stacked' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
                        title="Stacked Bar Chart"
                      >
                        Stacked
                      </button>
                      <button
                        onClick={() => setChartView('area')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${chartView === 'area' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
                        title="Smooth Spline Area Chart"
                      >
                        Area
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Period Summary Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                  <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 text-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">Total Issued</span>
                    <span className="text-sm font-extrabold text-indigo-900 font-mono">
                      {periodStats.totalIssues.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100/80 text-center">
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">Total Returned</span>
                    <span className="text-sm font-extrabold text-purple-900 font-mono">
                      {periodStats.totalReturns.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Return Rate</span>
                    <span className="text-sm font-extrabold text-emerald-900 font-mono">
                      {periodStats.avgRate}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100/80 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Peak Month</span>
                    <span className="text-sm font-extrabold text-amber-900">
                      {periodStats.peakMonth}
                    </span>
                  </div>
                </div>

                {/* Dynamic Responsive Recharts Chart Container */}
                <div className="h-72 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'area' ? (
                      <AreaChart data={monthlyCirculationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} domain={[0, 'auto']} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="issueCount" 
                          name="Issued" 
                          stroke="#6366f1" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorIssued)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="returnCount" 
                          name="Returned" 
                          stroke="#a855f7" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorReturned)" 
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={monthlyCirculationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} domain={[0, 'auto']} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar 
                          dataKey="issueCount" 
                          name="Issued" 
                          fill="#6366f1" 
                          stackId={chartView === 'stacked' ? 'a' : undefined} 
                          radius={chartView === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]} 
                        />
                        <Bar 
                          dataKey="returnCount" 
                          name="Returned" 
                          fill="#a855f7" 
                          stackId={chartView === 'stacked' ? 'a' : undefined} 
                          radius={[6, 6, 0, 0]} 
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart Legend & Live Stream Status Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block shadow-xs" />
                    <span>Issued Loans</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-purple-600 inline-block shadow-xs" />
                    <span>Returned Returns</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Synced: {lastUpdated || 'Just now'}</span>
                </div>
              </div>
            </div>

            {/* Department Utilization Pie Chart */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-slate-900">Subject Breakdown</h2>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {stats.department_utilization.length} Categories
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Dynamic category allocation from live catalog</p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.department_utilization}
                        dataKey="count"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={45}
                      >
                        {stats.department_utilization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                {stats.department_utilization.slice(0, 4).map((item, idx) => (
                  <div key={item.department} className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate max-w-[140px]">{item.department}</span>
                    </div>
                    <span className="font-bold">{item.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
