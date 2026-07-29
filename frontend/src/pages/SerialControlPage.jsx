import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Newspaper, Bell, BookMarked, Calendar, Plus, Trash2 } from 'lucide-react';

export const SerialControlPage = () => {
  const [serials, setSerials] = useState([]);
  const [newspaperLogs, setNewspaperLogs] = useState([]);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddSerial, setShowAddSerial] = useState(false);

  const [serialForm, setSerialForm] = useState({
    title: 'IEEE Transactions on Pattern Analysis',
    frequency: 'Monthly',
    publisher: 'IEEE Computer Society India',
    issn: '0162-8828',
    subscription_start: '2026-01-01',
    subscription_end: '2026-12-31',
    cost: 4500.0,
    status: 'Active'
  });

  const [paperForm, setPaperForm] = useState({
    date: new Date().toISOString().split('T')[0],
    paper_name: 'The Hindu',
    copies_received: 10,
    received_by: 'Mrs. Sunita Deshmukh'
  });

  const loadData = async () => {
    try {
      const sData = await api.getSerials();
      setSerials(sData);
      const nData = await api.getNewspaperLogs();
      setNewspaperLogs(nData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSerialSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createSerial(serialForm);
      setShowAddSerial(false);
      loadData();
    } catch (err) {
      alert("Failed to add journal subscription: " + err.message);
    }
  };

  const handleDeleteSerial = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel subscription for "${title}"?`)) return;
    try {
      await api.deleteSerial(id);
      loadData();
    } catch (err) {
      alert("Failed to delete serial: " + err.message);
    }
  };

  const handleAddPaperLog = async (e) => {
    e.preventDefault();
    try {
      await api.addNewspaperLog(paperForm);
      setShowAddLog(false);
      loadData();
    } catch (err) {
      alert("Failed to record newspaper entry: " + err.message);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#a10053]" />
            Module 4: Serial Control (Subscriptions & Newspaper CRUD)
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Indian Academic Journal subscriptions, non-receipt reminders, daily newspaper receipt log, and bound volume archiving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddSerial(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-black font-black text-xs rounded-xl border border-slate-300 transition"
          >
            + New Subscription
          </button>

          <button
            onClick={() => setShowAddLog(true)}
            className="px-6 py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-900/30 transition flex items-center gap-2 border border-[#880045]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white font-black">Log Daily Newspaper Entry</span>
          </button>
        </div>
      </div>

      {/* Subscriptions Grid with DELETE Action */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-pink-300" /> Subscribed Periodicals & Academic Journals (UGC Approved)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {serials.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 text-slate-900 relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-pink-100 text-[#a10053] border border-pink-300">
                    {s.frequency} Periodical
                  </span>
                  <h4 className="font-black text-slate-900 text-base mt-2 leading-snug">{s.title}</h4>
                  <div className="text-xs text-slate-600 font-bold mt-0.5">Publisher: {s.publisher} (ISSN: {s.issn})</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-black text-emerald-700">₹{s.cost}/yr</span>
                  <button
                    onClick={() => handleDeleteSerial(s.id, s.title)}
                    className="p-1.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-700 hover:text-white transition"
                    title="Cancel & Delete Subscription (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200 font-bold text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subscription Term:</span>
                  <span className="font-mono text-slate-900">{s.subscription_start} to {s.subscription_end}</span>
                </div>
                {s.non_receipt_reminders && s.non_receipt_reminders.length > 0 && (
                  <div className="text-amber-800 text-[11px] font-black flex items-center gap-1.5 pt-1 border-t border-slate-200">
                    <Bell className="w-3.5 h-3.5 text-amber-600" /> {s.non_receipt_reminders[0]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Newspaper Register */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#a10053]" /> Daily Newspaper Receipt Register (Indian Publications)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-900 uppercase font-mono text-[11px] tracking-wider border-b border-slate-200 font-black">
              <tr>
                <th className="p-4 font-black">Receipt Date</th>
                <th className="p-4 font-black">Newspaper / Publication</th>
                <th className="p-4 font-black text-center">Copies Received</th>
                <th className="p-4 font-black text-right">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {newspaperLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-pink-50/50 transition">
                  <td className="p-4 font-mono font-black text-[#a10053]">{log.date}</td>
                  <td className="p-4 font-black text-slate-900 text-sm">{log.paper_name}</td>
                  <td className="p-4 text-center font-black font-mono text-emerald-700">{log.copies_received} Copies</td>
                  <td className="p-4 text-right text-slate-700 font-bold">{log.received_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Subscription Modal */}
      {showAddSerial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSerialSubmit} className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-[#a10053]" /> Add New Periodical Subscription
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-black font-black mb-1">Journal Title *</label>
                <input
                  type="text"
                  value={serialForm.title}
                  onChange={(e) => setSerialForm({ ...serialForm, title: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Publisher Name *</label>
                <input
                  type="text"
                  value={serialForm.publisher}
                  onChange={(e) => setSerialForm({ ...serialForm, publisher: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Annual Subscription Cost (INR ₹) *</label>
                <input
                  type="number"
                  value={serialForm.cost}
                  onChange={(e) => setSerialForm({ ...serialForm, cost: parseFloat(e.target.value) })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSerial(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">Subscribe Journal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Modal */}
      {showAddLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddPaperLog} className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#a10053]" /> Record Daily Newspaper Entry
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-black font-black mb-1">Receipt Date *</label>
                <input
                  type="date"
                  value={paperForm.date}
                  onChange={(e) => setPaperForm({ ...paperForm, date: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Newspaper Name *</label>
                <select
                  value={paperForm.paper_name}
                  onChange={(e) => setPaperForm({ ...paperForm, paper_name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                >
                  <option value="The Hindu">The Hindu</option>
                  <option value="The Times of India">The Times of India</option>
                  <option value="Indian Express">Indian Express</option>
                  <option value="Business Standard">Business Standard</option>
                  <option value="Economic Times">Economic Times</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-black mb-1">Copies Received *</label>
                <input
                  type="number"
                  value={paperForm.copies_received}
                  onChange={(e) => setPaperForm({ ...paperForm, copies_received: parseInt(e.target.value, 10) })}
                  min="1"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddLog(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">Log Newspaper</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
