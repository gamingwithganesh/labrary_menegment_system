import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Repeat, AlertTriangle, CheckCircle, IndianRupee, BookOpen, Plus } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const CirculationPage = () => {
  const [circulations, setCirculations] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedCircToReturn, setSelectedCircToReturn] = useState(null);

  const [issueForm, setIssueForm] = useState({
    book_id: '',
    memberId: '',
    user_name: '',
    days_requested: 14
  });

  const loadData = async () => {
    try {
      const [data, bData, mData] = await Promise.all([api.getCirculations(), api.getBooks(), api.getMembers()]);
      setCirculations(data);
      setBooks(bData);
      setMembers(mData);

      const defaultMember = mData.length > 0 ? mData[0] : null;
      setIssueForm((prev) => ({
        ...prev,
        book_id: bData.length > 0 ? bData[0].id : '',
        memberId: defaultMember ? String(defaultMember._id || defaultMember.id) : '',
        user_name: defaultMember ? defaultMember.name || '' : ''
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedMember = members.find((member) => String(member._id || member.id) === issueForm.memberId);
      const selectedBook = books.find((book) => book.id === issueForm.book_id);
      const payload = {
        book_id: issueForm.book_id,
        memberId: issueForm.memberId,
        user_id: selectedMember?.cardNumber || selectedMember?.id_card_number || selectedMember?.email || '',
        user_name: issueForm.user_name || selectedMember?.name || '',
        user_id_card: selectedMember?.cardNumber || selectedMember?.id_card_number || selectedMember?.email || '',
        book_title: selectedBook?.title || '',
        book_isbn: selectedBook?.isbn || '',
        days_requested: issueForm.days_requested
      };

      await api.issueBook(payload);
      setShowIssueModal(false);
      loadData();
    } catch (err) {
      alert('Failed to issue book: ' + err.message);
    }
  };

  const handleReturnConfirm = async () => {
    if (!selectedCircToReturn) return;
    try {
      await api.returnBook(selectedCircToReturn.id);
      setSelectedCircToReturn(null);
      loadData();
    } catch (err) {
      alert("Failed to return book: " + err.message);
    }
  };

  const activeLoans = circulations.filter((c) => c.status === 'Issued');
  const overdueLoans = circulations.filter((c) => c.status === 'Overdue');
  const totalFinesAccrued = circulations.reduce((acc, c) => acc + c.fine_amount, 0);

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-[#a10053]" />
            Module 2: Indian College Circulation & Fine Management
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Automated check-outs, student PRN verification, UGC Book Bank schemes, and INR fine calculation (₹5.00 / day).
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="px-6 py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-900/30 transition flex items-center gap-2 self-start md:self-auto border border-[#880045]"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white font-black">Issue Book to Student / Staff</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Active Book Loans"
          value={activeLoans.length.toString()}
          subtitle="Currently checked out volumes"
          icon={BookOpen}
          color="yono"
        />
        <StatCard
          title="Overdue Loans"
          value={overdueLoans.length.toString()}
          subtitle="Items exceeding 14-day limit"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Fine Revenue Accrued (INR)"
          value={`₹${totalFinesAccrued.toFixed(2)}`}
          subtitle="Fine rate: ₹5.00 / day overdue"
          icon={IndianRupee}
          color="emerald"
        />
      </div>

      {/* Circulation Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-base">Active Student & Faculty Circulation Register</h3>
          <span className="text-xs text-[#a10053] font-mono font-bold bg-pink-100 px-3 py-1 rounded-full border border-pink-300">
            Fine Rate: ₹5.00 / Day Overdue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-900 uppercase font-mono text-[11px] tracking-wider border-b border-slate-200 font-black">
              <tr>
                <th className="p-4 font-black">Student Name & PRN</th>
                <th className="p-4 font-black">Book Title & Accession No</th>
                <th className="p-4 font-black">Issue Date</th>
                <th className="p-4 font-black">Due Date</th>
                <th className="p-4 font-black text-center">Calculated Fine (INR)</th>
                <th className="p-4 font-black text-center">Status</th>
                <th className="p-4 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {circulations.map((circ) => {
                const isOverdue = circ.status === 'Overdue';
                return (
                  <tr key={circ.id} className="hover:bg-pink-50/50 transition">
                    <td className="p-4">
                      <div className="font-black text-slate-900 text-sm">{circ.user_name}</div>
                      <div className="text-[11px] text-[#a10053] font-mono font-bold">{circ.user_id_card}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{circ.book_title}</div>
                      <div className="text-[11px] font-mono text-slate-600">{circ.book_isbn}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-700">
                      {circ.issue_date ? new Date(circ.issue_date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className={`p-4 font-mono font-black ${isOverdue ? 'text-rose-700' : 'text-slate-800'}`}>
                      {circ.due_date ? new Date(circ.due_date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="p-4 text-center font-black font-mono">
                      {circ.fine_amount > 0 ? (
                        <span className="text-rose-800 bg-rose-100 px-2.5 py-1 rounded border border-rose-300">
                          +₹{circ.fine_amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-500">₹0.00</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-black ${
                          circ.status === 'Returned'
                            ? 'bg-slate-200 text-slate-700 border border-slate-300'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {circ.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {circ.status !== 'Returned' && (
                        <button
                          onClick={() => setSelectedCircToReturn(circ)}
                          className="px-3.5 py-1.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs rounded-xl shadow transition border border-[#880045]"
                        >
                          <span className="text-white font-black">Process Return</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleIssueSubmit} className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-[#a10053]" /> Issue Book Volume
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-black font-black mb-1">Select Book Volume</label>
                <select
                  value={issueForm.book_id}
                  onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.copies_available <= 0}>
                      {b.title} ({b.copies_available} Available) - {b.accession_no}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-black font-black mb-1">Select Member for Issue</label>
                <select
                  value={issueForm.memberId}
                  onChange={(e) => {
                    const selectedMemberId = e.target.value;
                    const selectedMember = members.find((member) => String(member._id || member.id) === selectedMemberId);
                    setIssueForm({
                      ...issueForm,
                      memberId: selectedMemberId,
                      user_name: selectedMember?.name || ''
                    });
                  }}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                >
                  {members.map((member) => (
                    <option key={member._id || member.id} value={String(member._id || member.id)}>
                      {member.name} ({member.cardNumber || member.id_card_number || member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-black font-black mb-1">Member Name</label>
                <input
                  type="text"
                  value={issueForm.user_name}
                  onChange={(e) => setIssueForm({ ...issueForm, user_name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                  placeholder="Enter borrower name"
                />
              </div>
              <div>
                <label className="block text-black font-black mb-1">Member Card / ID</label>
                <input
                  type="text"
                  value={
                    members.find((member) => String(member._id || member.id) === issueForm.memberId)?.cardNumber ||
                    members.find((member) => String(member._id || member.id) === issueForm.memberId)?.id_card_number ||
                    ''
                  }
                  disabled
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-black font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Loan Period (Days)</label>
                <input
                  type="number"
                  value={issueForm.days_requested}
                  onChange={(e) => setIssueForm({ ...issueForm, days_requested: parseInt(e.target.value, 10) })}
                  min="1"
                  max="30"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">Confirm Check-out</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Return Book Modal */}
      {selectedCircToReturn && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Confirm Return & Check-in
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200 font-bold text-slate-800">
              <div className="font-black text-slate-900 text-sm">{selectedCircToReturn.book_title}</div>
              <div>Student PRN: <span className="text-[#a10053] font-mono">{selectedCircToReturn.user_id_card}</span></div>
              {selectedCircToReturn.fine_amount > 0 && (
                <div className="text-rose-800 font-black mt-2 flex items-center gap-1 bg-rose-100 p-2 rounded-lg border border-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-700" /> Overdue Fine Collected: ₹{selectedCircToReturn.fine_amount.toFixed(2)}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedCircToReturn(null)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnConfirm}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-emerald-800"
              >
                <span className="text-white font-black">Complete Check-in</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
