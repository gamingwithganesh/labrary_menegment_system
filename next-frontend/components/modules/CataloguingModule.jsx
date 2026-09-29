'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import { 
  BookPlus, 
  Barcode, 
  QrCode, 
  ShoppingCart, 
  Plus, 
  CheckCircle, 
  FileText, 
  PackageCheck, 
  Printer, 
  Smartphone, 
  X, 
  Sparkles,
  Download
} from 'lucide-react';

export function CataloguingModule() {
  const [activeSubTab, setActiveSubTab] = useState('accession');
  const [labelMode, setLabelMode] = useState('qr'); // 'qr' | 'barcode'
  const [showScanModal, setShowScanModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [realQrUrl, setRealQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    publisher: '',
    year: '2026',
    edition: '1st Ed',
    rack: 'CS-01',
    copies: '3',
    price: '450'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const created = await api.createBook({
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        category: formData.category,
        location: formData.rack,
        publisher: formData.publisher,
        year: Number(formData.year) || 2026,
        edition: formData.edition,
        copies: Number(formData.copies) || 1,
        price: Number(formData.price) || 450
      });
      const accId = created.accessionCode || `ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSuccessMsg(`Book "${formData.title}" catalogued with Accession Code ${accId}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        publisher: '',
        year: '2026',
        edition: '1st Ed',
        rack: 'CS-01',
        copies: '3',
        price: '450'
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to catalog book');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const currentAccId = "ACC-2026-8849";
  const displayTitle = formData.title || "Data Structures and Algorithms in C++";
  const displayAuthor = formData.author || "Adam Drozdek";
  const displayIsbn = formData.isbn || "978-0131103627";
  const displayRack = formData.rack || "CS-04";

  React.useEffect(() => {
    const payload = {
      system: 'LIB-MAN Enterprise',
      accId: currentAccId,
      title: displayTitle,
      author: displayAuthor,
      isbn: displayIsbn,
      rack: displayRack
    };
    generateQRCodeDataUrl(payload).then((url) => {
      if (url) setRealQrUrl(url);
    });
  }, [displayTitle, displayAuthor, displayIsbn, displayRack]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Cataloguing & Procurement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book accessioning, QR code sticker generation, and purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('accession')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'accession'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookPlus className="w-4 h-4" />
            <span>Book Accession</span>
          </button>
          <button
            onClick={() => setActiveSubTab('po')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'po'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeSubTab === 'accession' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accession Form */}
          <div className="lg:col-span-2 p-6 rounded-3xl glass-card">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Book Accession & Registration Form</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Book Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Modern Operating Systems"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Author Name(s)</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Andrew S. Tanenbaum"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ISBN Code</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0133591620"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option>Computer Science</option>
                    <option>Physics</option>
                    <option>Software Engineering</option>
                    <option>Artificial Intelligence</option>
                    <option>Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Shelf Rack Location</label>
                  <input
                    type="text"
                    value={formData.rack}
                    onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                    placeholder="CS-04"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Pearson / Wiley"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.copies}
                    onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Price per copy (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catalog & Accession Book</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live QR Code & Barcode System Card */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {labelMode === 'qr' ? (
                    <QrCode className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Barcode className="w-5 h-5 text-purple-500" />
                  )}
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {labelMode === 'qr' ? 'Live 2D QR Code Sticker' : 'Live 1D Barcode Label'}
                  </h2>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setLabelMode('qr')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      labelMode === 'qr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    QR Code
                  </button>
                  <button
                    onClick={() => setLabelMode('barcode')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      labelMode === 'barcode' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Barcode
                  </button>
                </div>
              </div>

              {/* Tag Preview Box */}
              <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-md text-center relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-widest text-indigo-600 uppercase mb-2 border-b pb-1.5 border-slate-100">
                  <span>LIB-MAN CAMPUS TAG</span>
                  <span>{currentAccId}</span>
                </div>

                <h4 className="text-sm font-extrabold truncate">{displayTitle}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{displayAuthor}</p>

                {/* Live QR Matrix or Barcode Display */}
                {labelMode === 'qr' ? (
                  <div className="my-4 flex flex-col items-center justify-center">
                    <div className="p-2 bg-white rounded-2xl shadow border border-slate-100 inline-block">
                      {realQrUrl ? (
                        <img src={realQrUrl} alt="Live Book QR Code" className="w-28 h-28 rounded-xl" />
                      ) : (
                        <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">Generating QR...</div>
                      )}
                    </div>

                    <div className="mt-2 text-[10px] font-mono font-bold text-slate-600 tracking-wider">
                      QR PAYLOAD: {currentAccId} • RACK: {displayRack}
                    </div>
                  </div>
                ) : (
                  <div className="my-4 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-1 h-14 bg-slate-50 p-2 rounded w-full">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1].map((width, idx) => (
                        <div key={idx} style={{ width: `${width * 2}px` }} className="h-full bg-slate-900" />
                      ))}
                    </div>
                    <p className="text-xs font-mono font-bold tracking-widest text-slate-700 mt-1">
                      *{displayIsbn}*
                    </p>
                  </div>
                )}

                {/* QR Sticker Controls */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                  <button
                    onClick={() => alert(`Printing ${labelMode.toUpperCase()} sticker tag for ${displayTitle}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sticker</span>
                  </button>

                  <button
                    onClick={() => setShowScanModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test Mobile Scan</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Tag Standard:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">ISO/IEC 18004 (2D Matrix)</span>
              </div>
              <div className="flex justify-between">
                <span>Accession Auto-ID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentAccId}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Total Value:</span>
                <span className="font-bold text-emerald-600">₹{(Number(formData.copies || 1) * Number(formData.price || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Purchase Orders Sub-Tab */
        <div className="p-6 rounded-3xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-500" />
              <span>Active Supplier Purchase Orders (POs)</span>
            </h2>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500">
              + Create New PO
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="pb-3">PO Number</th>
                  <th className="pb-3">Supplier Vendor</th>
                  <th className="pb-3">Items Count</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                <tr>
                  <td className="py-3 font-mono font-bold text-indigo-600">PO-2026-041</td>
                  <td className="py-3 text-slate-900 dark:text-white">Pearson Education India</td>
                  <td className="py-3">45 Books</td>
                  <td className="py-3 font-bold">₹28,500</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Delivered & Verified
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-indigo-600">PO-2026-042</td>
                  <td className="py-3 text-slate-900 dark:text-white">Wiley Academic Press</td>
                  <td className="py-3">20 Books</td>
                  <td className="py-3 font-bold">₹16,200</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                      In Transit
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulated Mobile Smartphone Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm p-6 rounded-3xl glass-card shadow-2xl relative text-center">
            <button 
              onClick={() => setShowScanModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
              <Smartphone className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10">
              Mobile QR Camera Scanner
            </span>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
              Scan Results Verified
            </h3>

            <div className="my-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Payload Tag:</span>
                <span className="font-bold text-indigo-500">{currentAccId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{displayTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Author:</span>
                <span className="text-slate-700 dark:text-slate-300">{displayAuthor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-emerald-500">{displayRack}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Scanned instantaneously via ISO/IEC 18004 2D matrix scanner engine.
            </p>

            <button
              onClick={() => setShowScanModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Close Scanner Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
