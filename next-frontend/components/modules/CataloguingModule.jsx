'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import { exportToExcel } from '@/lib/export-excel';
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
  Download,
  Upload,
  AlertTriangle,
  ClipboardList,
  Search,
  Building2,
  Layers,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export function CataloguingModule() {
  const [activeSubTab, setActiveSubTab] = useState('accession'); // 'accession' | 'inventory' | 'procurement' | 'import'
  const [labelMode, setLabelMode] = useState('qr'); // 'qr' | 'barcode'
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [realQrUrl, setRealQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
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

  // Stock Verification State
  const [scanInput, setScanInput] = useState('');
  const [scannedList, setScannedList] = useState([]);
  const [auditResult, setAuditResult] = useState(null);
  const [auditing, setAuditing] = useState(false);

  // Procurement State
  const [vendors, setVendors] = useState([]);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');

  // Bulk Import State
  const [importJsonText, setImportJsonText] = useState('');
  const [importSummary, setImportSummary] = useState(null);

  useEffect(() => {
    loadProcurementData();
  }, []);

  const loadProcurementData = async () => {
    try {
      const vData = await api.getVendors();
      if (Array.isArray(vData)) setVendors(vData);
    } catch (e) {
      console.error('Failed to load vendors:', e);
    }
  };

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
      setSuccessMsg(`Book "${formData.title}" catalogued with ${formData.copies} copies (Code: ${accId}).`);
      setTimeout(() => setSuccessMsg(''), 5000);
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

  useEffect(() => {
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
  }, [formData]);

  // Handle Inventory Stock Audit Scan
  const handleAddScan = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setScannedList(prev => [scanInput.trim(), ...prev]);
    setScanInput('');
  };

  const handleRunAudit = async () => {
    setAuditing(true);
    setErrorMsg('');
    try {
      const result = await api.runInventoryAudit(scannedList);
      setAuditResult(result);
      setSuccessMsg('Physical stock verification audit completed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Audit failed');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setAuditing(false);
    }
  };

  // Handle Add Vendor
  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await api.createVendor({
        name: newVendorName,
        contactPerson: newVendorContact,
        email: newVendorEmail,
        phone: newVendorPhone
      });
      setSuccessMsg(`Vendor "${newVendorName}" registered.`);
      setNewVendorName('');
      setNewVendorContact('');
      setNewVendorEmail('');
      setNewVendorPhone('');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProcurementData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add vendor');
    }
  };

  // Handle Bulk Import
  const handleBulkImport = async () => {
    setErrorMsg('');
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await api.bulkImport('books', Array.isArray(parsed) ? parsed : [parsed]);
      setImportSummary(res);
      setSuccessMsg(res.message || 'Bulk import processed');
    } catch (e) {
      setErrorMsg('Invalid JSON format. Please ensure valid array of book objects.');
    }
  };

  const handleExportCatalogExcel = async () => {
    try {
      const allBooks = await api.getBooks();
      const headers = [
        { label: 'Book Title', key: 'title' },
        { label: 'Author', key: 'author' },
        { label: 'ISBN', key: 'isbn' },
        { label: 'Category', key: 'category' },
        { label: 'Rack Location', key: 'location' },
        { label: 'Publisher', key: 'publisher' },
        { label: 'Edition', key: 'edition' },
        { label: 'Publication Year', key: 'year' },
        { label: 'Total Copies', key: 'copies' },
        { label: 'Available Copies', key: 'availableCopies' },
        { label: 'Price (INR)', key: 'price' },
        { label: 'Status', key: 'status' }
      ];
      exportToExcel('Book_Catalog_Accession_Records', headers, allBooks);
      setSuccessMsg('Book catalog exported in Excel (.csv) format.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('Failed to export catalog records.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookPlus className="w-6 h-6 text-indigo-600" />
            <span>Cataloguing & Stock Inventory Suite</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accession tagging, barcode labeling, physical stock audit & vendor procurement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Catalog to Excel */}
          <button
            onClick={handleExportCatalogExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            title="Download book catalog in Excel format"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Catalog (Excel)</span>
          </button>

          {/* Sub-tab Navigation Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('accession')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'accession'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Accession & Labels
            </button>
            <button
              onClick={() => setActiveSubTab('inventory')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'inventory'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Audit Tool
            </button>
            <button
              onClick={() => setActiveSubTab('procurement')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'procurement'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vendors & POs
            </button>
            <button
              onClick={() => setActiveSubTab('import')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeSubTab === 'import'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulk Import
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: ACCESSION & TAGGING */}
      {activeSubTab === 'accession' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accession Entry Form */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>New Title Accession & Catalog Registration</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Book Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Author Name</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">ISBN-10 / ISBN-13</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Subject Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Stack & Shelf Location</label>
                  <input
                    type="text"
                    value={formData.rack}
                    onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Copies Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.copies}
                    onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? 'Registering...' : 'Register Accession Title'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Smart Tag & QR Preview Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Live Tag Preview
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLabelMode('qr')}
                    className={`p-1.5 rounded-lg text-xs ${labelMode === 'qr' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setLabelMode('barcode')}
                    className={`p-1.5 rounded-lg text-xs ${labelMode === 'barcode' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <Barcode className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Physical Label Mockup */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 mb-4">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-1">LIB-MAN SMART LABEL</div>
                {labelMode === 'qr' ? (
                  realQrUrl ? (
                    <img src={realQrUrl} alt="QR Code" className="w-32 h-32 mx-auto rounded-xl shadow-sm border border-slate-200" />
                  ) : (
                    <div className="w-32 h-32 mx-auto bg-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                  )
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="font-mono text-2xl font-black tracking-widest text-slate-900">||| | |||| | |||</div>
                    <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{currentAccId}</div>
                  </div>
                )}
                <div className="mt-2 text-left text-[11px] space-y-0.5">
                  <p className="font-bold text-slate-800 truncate">{displayTitle}</p>
                  <p className="text-slate-500 font-mono text-[10px]">Accession: {currentAccId}</p>
                  <p className="text-indigo-600 font-semibold text-[10px]">Location: {displayRack}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Accession Barcode Strip</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INVENTORY STOCK VERIFICATION AUDIT */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-indigo-600" />
              <span>Physical Stack Inventory Audit & Barcode Scanner</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Scan physical book barcodes into the scanner buffer to generate a real-time discrepancy matrix (Expected vs Found vs Missing vs Extra).
            </p>

            <form onSubmit={handleAddScan} className="flex gap-2 max-w-lg mb-4">
              <input
                type="text"
                placeholder="Scan or enter book barcode / accession..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Add Scan
              </button>
            </form>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">
                Buffered Scans: <strong className="text-indigo-600">{scannedList.length}</strong> items
              </span>
              <button
                onClick={handleRunAudit}
                disabled={auditing || scannedList.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                <span>{auditing ? 'Verifying...' : 'Execute Stock Audit & Discrepancy Matrix'}</span>
              </button>
              {scannedList.length > 0 && (
                <button
                  onClick={() => setScannedList([])}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Clear Buffer
                </button>
              )}
            </div>
          </div>

          {/* Audit Results Discrepancy Matrix */}
          {auditResult && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Audit Summary (ID: {auditResult.auditId})</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">{auditResult.date}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Total Expected</span>
                  <strong className="text-lg text-slate-900">{auditResult.totalExpected}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block mb-0.5 font-semibold">Found in Stack</span>
                  <strong className="text-lg text-emerald-700">{auditResult.foundCount}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block mb-0.5 font-semibold">Missing Discrepancies</span>
                  <strong className="text-lg text-rose-700">{auditResult.missingCount}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 block mb-0.5 font-semibold">Extra Uncatalogued</span>
                  <strong className="text-lg text-amber-700">{auditResult.extraCount}</strong>
                </div>
              </div>

              {/* Detailed Discrepancy Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Barcode / Accession</th>
                      <th className="p-3">Book Title</th>
                      <th className="p-3">Audit Status</th>
                      <th className="p-3">Verification Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditResult.discrepancies?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-900">{item.barcode}</td>
                        <td className="p-3 font-medium text-slate-800">{item.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Found' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            item.status === 'Missing' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: VENDORS & PROCUREMENT */}
      {activeSubTab === 'procurement' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Register Book Vendor</span>
            </h2>
            <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Vendor / Publisher Name</label>
                <input
                  type="text"
                  required
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Contact Person</label>
                <input
                  type="text"
                  value={newVendorContact}
                  onChange={(e) => setNewVendorContact(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={newVendorPhone}
                  onChange={(e) => setNewVendorPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500"
              >
                Add Vendor
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              <span>Registered Vendors & Purchase Orders ({vendors.length})</span>
            </h2>

            <div className="space-y-3">
              {vendors.map(v => (
                <div key={v.id || v._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{v.name}</h3>
                      <p className="text-slate-500">Contact: {v.contactPerson || 'Sales Team'} • {v.phone || v.email}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                      Orders: {v.orders ? v.orders.length : 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BULK CSV / JSON IMPORT */}
      {activeSubTab === 'import' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span>Bulk Catalog Import</span>
          </h2>
          <p className="text-xs text-slate-500">
            Paste JSON or CSV catalog rows to import hundreds of book titles and copies in a single transaction.
          </p>

          <textarea
            rows="8"
            placeholder='[ { "title": "Computer Networks", "author": "Andrew Tanenbaum", "isbn": "978-0132126953", "category": "Computer Science", "copies": 5, "price": 650 } ]'
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkImport}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25"
            >
              Process Bulk Import
            </button>
          </div>

          {importSummary && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">Import Summary:</div>
              <div className="flex gap-4">
                <span className="text-emerald-700 font-bold">Successful: {importSummary.data?.successful}</span>
                <span className="text-rose-700 font-bold">Failed: {importSummary.data?.failed}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
