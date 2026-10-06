'use client';

import React, { useState, useEffect } from 'react';
import { api, MOCK_BOOKS, MOCK_CIRCULATION } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Bookmark, 
  X, 
  ArrowRight, 
  Tag, 
  Plus, 
  Trash2, 
  Repeat, 
  RotateCcw,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';

export function OPACModule() {
  const { user, setActiveTab } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservedSuccess, setReservedSuccess] = useState(false);
  const [circulationList, setCirculationList] = useState([]);

  const [reservations, setReservations] = useState([]);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [lastRequestResult, setLastRequestResult] = useState(null);

  // Add Book Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newLocation, setNewLocation] = useState('Rack CS-01');

  useEffect(() => {
    // Initial load of auxiliary data
    Promise.all([
      api.getCirculationRecords().catch(() => []),
      api.getReservations().catch(() => [])
    ]).then(([circs, resData]) => {
      setCirculationList(Array.isArray(circs) ? circs : []);
      setReservations(Array.isArray(resData) ? resData : []);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 200);
    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getBooks(query, selectedCategory);
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };


  const categories = ['All', 'Computer Science', 'Physics', 'Software Engineering', 'Artificial Intelligence', 'Mathematics'];

  const filteredBooks = books.filter(b => 
    selectedCategory === 'All' || b.category === selectedCategory
  );

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await api.createBook({
        title: newTitle,
        author: newAuthor,
        isbn: newIsbn || `978-0${Math.floor(100000000 + Math.random() * 900000000)}`,
        category: newCategory,
        location: newLocation,
        status: 'Available',
        edition: '1st Ed',
        publisher: 'Academic Press',
        copies: 5,
        availableCopies: 5,
        year: 2026
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewAuthor('');
      setNewIsbn('');
      loadBooks();
    } catch (err) {
      alert(err.message || 'Failed to add book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (confirm('Are you sure you want to delete this book from the catalog?')) {
      try {
        await api.deleteBook(bookId);
        loadBooks();
      } catch (err) {
        alert(err.message || 'Failed to delete book');
      }
    }
  };

  const handleOpenRequestModal = (book) => {
    setSelectedBook(book);
    setReservedSuccess(false);
    setLastRequestResult(null);
  };

  // Helper to calculate queue and wait time for any book
  const getBookQueueMetrics = (book) => {
    const bookId = String(book.id || book._id);
    const activeRes = reservations.filter(
      r => (r.bookId === bookId || r.bookTitle?.toLowerCase() === book.title?.toLowerCase()) && 
           r.status !== 'Fulfilled' && r.status !== 'Cancelled'
    );
    const activeLoans = circulationList.filter(
      r => r.status !== 'Returned' && 
           (r.bookId === bookId || r.bookTitle?.toLowerCase() === book.title?.toLowerCase())
    );

    const availableCopies = book.availableCopies !== undefined ? book.availableCopies : (book.status === 'Available' ? (book.copies || 1) : 0);
    const isAvailable = availableCopies > 0;

    let earliestDueDate = 'N/A';
    let daysUntilEarliest = 7;
    if (activeLoans.length > 0) {
      const dueDates = activeLoans
        .map(l => new Date(l.dueDate))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a - b);
      if (dueDates.length > 0) {
        earliestDueDate = dueDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const diffMs = dueDates[0].getTime() - Date.now();
        daysUntilEarliest = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    const queueLength = activeRes.length;
    const nextQueuePos = queueLength + 1;
    const estimatedWaitDays = isAvailable ? 0 : (daysUntilEarliest + (queueLength * 7));

    const expectedDateObj = new Date();
    expectedDateObj.setDate(expectedDateObj.getDate() + estimatedWaitDays);
    const expectedAvailableDate = isAvailable ? 'Immediate (Within 48h)' : expectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      availableCopies,
      isAvailable,
      queueLength,
      nextQueuePos,
      estimatedWaitDays,
      earliestDueDate,
      expectedAvailableDate,
      activeLoansCount: activeLoans.length
    };
  };

  const confirmReservation = async () => {
    if (!selectedBook) return;
    setRequestSubmitting(true);
    try {
      const res = await api.createReservation({
        bookId: String(selectedBook.id || selectedBook._id),
        bookTitle: selectedBook.title,
        bookAuthor: selectedBook.author || 'Academic Faculty',
        bookCategory: selectedBook.category || 'General',
        rackLocation: selectedBook.location || 'Rack CS-01',
        memberId: user?.id || 'STU-101',
        memberName: user?.name || 'Student Borrower',
        memberEmail: user?.email || '',
        department: user?.department || 'Computer Science'
      });

      setLastRequestResult(res);
      setReservedSuccess(true);
      await loadBooks();
    } catch (err) {
      alert(err.message || 'Failed to submit issue request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all books from the catalog?')) {
      try {
        for (const book of books) {
          await api.deleteBook(book.id || book._id);
        }
        loadBooks();
      } catch (err) {
        alert(err.message || 'Failed to clear books');
      }
    }
  };

  const isLibrarian = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Librarian';

  // Find alternative books in the same category that are available right now
  const getCategoryAlternatives = (book) => {
    if (!book) return [];
    return books
      .filter(b => 
        (b.id || b._id) !== (book.id || book._id) && 
        b.category === book.category && 
        (b.availableCopies > 0 || b.status === 'Available')
      )
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase text-indigo-100 mb-2 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Catalog & Real-Time Availability Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            OPAC Online Book Catalog
          </h1>
          <p className="text-xs text-indigo-100 mb-4 max-w-lg">
            Verify real-time shelf copies, track live waitlist queue periods, and submit instant issue requests.
          </p>

          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Title, Author, ISBN, Subject, or Rack Location..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-md border-0"
            />
          </div>
        </div>
      </div>

      {/* Category Pills & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-500 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Staff Controls (Only visible to Librarians/Admins) */}
        {isLibrarian && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>

            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 border border-rose-200 shadow-sm"
              title="Clear all catalog data"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse h-56" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto my-8">
          <BookOpen className="w-10 h-10 text-indigo-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800">No Books Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {query || selectedCategory !== 'All' 
              ? 'No books match your current search filters.' 
              : 'The library catalog is currently empty. Click "+ Add Book" to catalogue your first title.'}
          </p>
          {isLibrarian && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Book</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const metrics = getBookQueueMetrics(book);
            const bookKey = book.id || book._id || book.accessionCode || book.isbn;

            return (
              <div 
                key={bookKey} 
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 flex flex-col justify-between group relative transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {book.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        metrics.isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {metrics.isAvailable ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{metrics.availableCopies} Available</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Waitlist ({metrics.queueLength} in queue)</span>
                          </>
                        )}
                      </span>

                      {isLibrarian && (
                        <button
                          onClick={() => handleDeleteBook(book.id || book._id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    by {book.author}
                  </p>

                  {/* Dynamic Availability & Queue Insights */}
                  {metrics.isAvailable ? (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Stack Location:</span>
                        <strong className="text-slate-800 font-semibold">{book.location || 'Rack CS-01'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700">
                        <span>Shelf Stock:</span>
                        <span className="font-bold">{metrics.availableCopies} of {book.copies || metrics.availableCopies} Copies Ready</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-amber-900 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Estimated Wait:</span>
                        </span>
                        <span className="font-bold text-amber-700">~{metrics.estimatedWaitDays} Days</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Earliest Return:</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-600">{metrics.earliestDueDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-amber-200/60">
                        <span>Queue Position:</span>
                        <span className="font-bold text-slate-700">#{metrics.nextQueuePos} next in line</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenRequestModal(book)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      metrics.isAvailable
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                    }`}
                  >
                    {metrics.isAvailable ? (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Request Issue</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Join Waitlist Queue (#{metrics.nextQueuePos})</span>
                      </>
                    )}
                  </button>

                  {isLibrarian && (
                    <button
                      onClick={() => setActiveTab('circulation')}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1 shrink-0"
                      title="Direct Issue at Desk"
                    >
                      <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Issue</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Book Modal */}
      {showAddModal && isLibrarian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              <span>Add New Book to Catalog</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter book details for immediate catalog listing.
            </p>

            <form onSubmit={handleAddBook} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating System Concepts"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Author Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abraham Silberschatz"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-medium"
                  >
                    <option>Computer Science</option>
                    <option>Physics</option>
                    <option>Software Engineering</option>
                    <option>Artificial Intelligence</option>
                    <option>Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Rack Location</label>
                  <input
                    type="text"
                    placeholder="Rack CS-01"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">ISBN Code (Optional)</label>
                <input
                  type="text"
                  placeholder="978-0133591620"
                  value={newIsbn}
                  onChange={(e) => setNewIsbn(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Book Issue Request & Waitlist Hold Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {reservedSuccess ? (
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {lastRequestResult?.requestType === 'Issue Request' ? 'Issue Request Submitted!' : 'Waitlist Queue Reserved!'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    {lastRequestResult?.message || `Your request for "${selectedBook.title}" has been registered in the system.`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Borrower:</span>
                    <strong className="text-slate-800">{user?.name || 'Student Borrower'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Request Type:</span>
                    <span className="font-bold text-indigo-700">{lastRequestResult?.requestType || 'Issue Request'}</span>
                  </div>
                  {lastRequestResult?.queuePosition > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Queue Position:</span>
                      <strong className="text-amber-700 font-bold">#{lastRequestResult.queuePosition} in Queue</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pickup Location / Shelf:</span>
                    <strong className="text-slate-800">{selectedBook.location || 'Circulation Desk'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Availability:</span>
                    <strong className="text-emerald-700">{lastRequestResult?.expectedAvailableDate || 'Within 48 Hours'}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const metrics = getBookQueueMetrics(selectedBook);
                const alternatives = getCategoryAlternatives(selectedBook);

                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">
                        <Tag className="w-4 h-4" />
                        <span>Smart Circulation Hold & Issue Desk</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedBook.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">by {selectedBook.author} • {selectedBook.category}</p>
                    </div>

                    {/* Live Verification Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Real-Time Shelf Stock:</span>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                          metrics.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {metrics.isAvailable ? `✓ In Stock (${metrics.availableCopies} Copies Available)` : '⏱️ All Copies Checked Out'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Shelf / Stack Location:</span>
                        <span className="font-semibold text-slate-800">{selectedBook.location || 'Main Library Rack CS-01'}</span>
                      </div>

                      {metrics.isAvailable ? (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Pickup Window:</span>
                          <span className="font-semibold text-emerald-700">Held for 48 Hours upon approval</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500">Waitlist Queue Ahead:</span>
                            <span className="font-bold text-amber-700">{metrics.queueLength} Students in line (You will be #{metrics.nextQueuePos})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Estimated Waiting Period:</span>
                            <span className="font-bold text-indigo-600">~{metrics.estimatedWaitDays} Days (Earliest Return: {metrics.earliestDueDate})</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Smart Alternative Recommendation (When out of stock) */}
                    {!metrics.isAvailable && alternatives.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Smart Alternative: Ready to Borrow Right Now in {selectedBook.category}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {alternatives.map((alt) => (
                            <button
                              key={alt.id || alt._id}
                              type="button"
                              onClick={() => setSelectedBook(alt)}
                              className="p-2.5 rounded-xl bg-white border border-indigo-200/80 hover:border-indigo-500 text-left transition-all group"
                            >
                              <p className="text-[11px] font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600">{alt.title}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ {alt.availableCopies || alt.copies || 1} Copies on Shelf</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Borrower info prompt */}
                    <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>Requesting as: <strong className="text-slate-900">{user?.name || 'Student Borrower'}</strong> ({user?.email || 'student@inst.edu'})</span>
                      <span className="font-mono text-indigo-600 font-bold">{user?.department || 'CSE'}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBook(null)}
                        className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmReservation}
                        disabled={requestSubmitting}
                        className={`w-2/3 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                          metrics.isAvailable
                            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25'
                            : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25'
                        }`}
                      >
                        {requestSubmitting ? (
                          <span>Processing Request...</span>
                        ) : metrics.isAvailable ? (
                          <>
                            <span>Submit Instant Issue Request</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Join Waitlist Queue (#{metrics.nextQueuePos})</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
