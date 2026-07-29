import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookPlus, Plus, Search, Edit3, Trash2, PackageCheck, FileText, IndianRupee } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export const CataloguingPage = () => {
  const [books, setBooks] = useState([]);
  const [acquisitions, setAcquisitions] = useState([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showAcquisitionModal, setShowAcquisitionModal] = useState(false);

  const [bookForm, setBookForm] = useState({
    title: '',
    authors: '',
    subject: 'Computer Science',
    isbn: '',
    accession_no: `LIB-CS-2026-${Math.floor(100 + Math.random() * 900)}`,
    publisher: 'Tata McGraw-Hill India',
    publication_year: 2024,
    copies_total: 5,
    shelf_location: 'Rack C-05, DDC 005'
  });

  const [acqForm, setAcqForm] = useState({
    vendor_name: 'Tata McGraw-Hill Education India Pvt. Ltd.',
    vendor_contact: '+91 11 4983 8800',
    vendor_email: 'orders.india@mheducation.com',
    po_number: `PO-VJTI-2026-${Math.floor(100 + Math.random() * 900)}`,
    invoice_no: `INV-TMH-${Math.floor(1000 + Math.random() * 9000)}`,
    orders: [{ book_title: 'Python Data Science Handbook', author: 'Jake VanderPlas', isbn: '978-9352134724', quantity: 10, unit_price: 650.0 }],
    total_cost: 6500.0
  });

  const loadData = async () => {
    try {
      const bData = await api.getBooks();
      setBooks(bData);
      const aData = await api.getAcquisitions();
      setAcquisitions(aData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        authors: typeof bookForm.authors === 'string' ? bookForm.authors.split(',').map((a) => a.trim()) : bookForm.authors,
        copies_available: bookForm.copies_total
      };

      if (editingBook) {
        await api.updateBook(editingBook.id, payload);
        setEditingBook(null);
      } else {
        await api.createBook(payload);
      }
      setShowAddBook(false);
      loadData();
    } catch (err) {
      alert("Failed to save book: " + err.message);
    }
  };

  const handleEditClick = (b) => {
    setEditingBook(b);
    setBookForm({
      title: b.title,
      authors: Array.isArray(b.authors) ? b.authors.join(', ') : b.authors,
      subject: b.subject,
      isbn: b.isbn,
      accession_no: b.accession_no,
      publisher: b.publisher,
      publication_year: b.publication_year,
      copies_total: b.copies_total,
      shelf_location: b.shelf_location
    });
    setShowAddBook(true);
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete accession record "${title}"?`)) return;
    try {
      await api.deleteBook(id);
      loadData();
    } catch (err) {
      alert("Failed to delete book: " + err.message);
    }
  };

  const handleAcqSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAcquisition(acqForm);
      setShowAcquisitionModal(false);
      loadData();
    } catch (err) {
      alert("Failed to create purchase order: " + err.message);
    }
  };

  const totalTitles = books.length;
  const totalHoldings = books.reduce((acc, b) => acc + (b.copies_total || 1), 0);
  const totalPOs = acquisitions.length;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookPlus className="w-6 h-6 text-[#a10053]" />
            Module 1: Acquisition & Cataloguing (Full CRUD Operations)
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Accession Register, Vendor Purchase Orders, AACR2 & DDC indexing, Update & Delete CRUD actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAcquisitionModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-black font-black text-xs rounded-xl border border-slate-300 transition"
          >
            + New Vendor PO
          </button>

          <button
            onClick={() => {
              setEditingBook(null);
              setBookForm({
                title: '',
                authors: '',
                subject: 'Computer Science',
                isbn: '',
                accession_no: `LIB-CS-2026-${Math.floor(100 + Math.random() * 900)}`,
                publisher: 'Tata McGraw-Hill India',
                publication_year: 2024,
                copies_total: 5,
                shelf_location: 'Rack C-05, DDC 005'
              });
              setShowAddBook(true);
            }}
            className="px-6 py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-900/30 transition flex items-center gap-2 border border-[#880045]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white font-black">Accession New Volume</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Catalogued Titles" value={totalTitles.toString()} subtitle="Unique ISBN records" icon={BookPlus} color="yono" />
        <StatCard title="Total Volume Copies" value={totalHoldings.toString()} subtitle="Physical items in library" icon={PackageCheck} color="emerald" />
        <StatCard title="Vendor Procurement POs" value={totalPOs.toString()} subtitle="Invoiced purchase orders" icon={FileText} color="purple" />
      </div>

      {/* Accession Register Table with EDIT & DELETE Action Buttons */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-base">Official Accession Register & Inventory</h3>
          <span className="text-xs font-mono font-bold bg-pink-100 text-[#a10053] px-3 py-1 rounded-full border border-pink-300">
            AACR2 & DDC Indexed • Full CRUD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-900 uppercase font-mono text-[11px] tracking-wider border-b border-slate-200 font-black">
              <tr>
                <th className="p-4 font-black">Accession No</th>
                <th className="p-4 font-black">Book Title & Authors</th>
                <th className="p-4 font-black">Subject</th>
                <th className="p-4 font-black">Publisher / Year</th>
                <th className="p-4 font-black text-center">Copies (Avail/Total)</th>
                <th className="p-4 font-black text-center">Shelf Rack</th>
                <th className="p-4 font-black text-right">Actions (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-pink-50/50 transition">
                  <td className="p-4 font-mono font-black text-[#a10053]">{b.accession_no}</td>
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-sm">{b.title}</div>
                    <div className="text-[11px] text-slate-600 font-bold">By {Array.isArray(b.authors) ? b.authors.join(', ') : b.authors}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-black bg-pink-100 text-[#a10053] border border-pink-300">
                      {b.subject}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-bold">{b.publisher} ({b.publication_year})</td>
                  <td className="p-4 text-center font-mono font-black">
                    <span className={b.copies_available > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {b.copies_available}
                    </span>{' '}
                    / {b.copies_total}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-900">{b.shelf_location}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="p-1.5 rounded-lg bg-pink-100 border border-pink-300 text-[#a10053] hover:bg-[#a10053] hover:text-white transition"
                        title="Edit Book Record (Update)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(b.id, b.title)}
                        className="p-1.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-700 hover:text-white transition"
                        title="Delete Book Record (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accession Create/Update Modal */}
      {showAddBook && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleBookSubmit} className="bg-white max-w-lg w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookPlus className="w-5 h-5 text-[#a10053]" /> {editingBook ? 'Edit / Update Accession Volume' : 'Accession New Book Volume'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-black font-black mb-1">Book Title *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Authors (Comma separated) *</label>
                <input
                  type="text"
                  value={bookForm.authors}
                  onChange={(e) => setBookForm({ ...bookForm, authors: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Subject / Branch *</label>
                <input
                  type="text"
                  value={bookForm.subject}
                  onChange={(e) => setBookForm({ ...bookForm, subject: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">ISBN Number *</label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Accession No *</label>
                <input
                  type="text"
                  value={bookForm.accession_no}
                  onChange={(e) => setBookForm({ ...bookForm, accession_no: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowAddBook(false); setEditingBook(null); }}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">{editingBook ? 'Update Volume' : 'Save & Accession'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Acquisition PO Modal */}
      {showAcquisitionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAcqSubmit} className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#a10053]" /> Create Vendor PO (INR ₹)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-black font-black mb-1">Vendor Name *</label>
                <input
                  type="text"
                  value={acqForm.vendor_name}
                  onChange={(e) => setAcqForm({ ...acqForm, vendor_name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>

              <div>
                <label className="block text-black font-black mb-1">Total PO Amount (INR ₹) *</label>
                <input
                  type="number"
                  value={acqForm.total_cost}
                  onChange={(e) => setAcqForm({ ...acqForm, total_cost: parseFloat(e.target.value) })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-[#a10053]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAcquisitionModal(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl transition border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">Issue PO (₹)</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
