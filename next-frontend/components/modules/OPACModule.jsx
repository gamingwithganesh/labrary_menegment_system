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

  // Add Book Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newLocation, setNewLocation] = useState('Rack CS-01');

  useEffect(() => {
    loadBooks();
  }, [query, selectedCategory]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const [data, circs] = await Promise.all([
        api.getBooks(query, selectedCategory),
        api.getCirculationRecords()
      ]);
      setBooks(Array.isArray(data) ? data : []);
      setCirculationList(Array.isArray(circs) ? circs : []);
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

  const handleReserve = (book) => {
    setSelectedBook(book);
    setReservedSuccess(false);
  };

  const confirmReservation = async () => {
    if (!selectedBook) return;
    try {
      await api.createReservation({
        bookId: String(selectedBook.id || selectedBook._id),
        bookTitle: selectedBook.title,
        memberId: user?.id || 'M-101',
        memberName: user?.name || 'Student Borrower',
        memberEmail: user?.email || ''
      });
      setReservedSuccess(true);
      setTimeout(() => {
        setSelectedBook(null);
        setReservedSuccess(false);
        loadBooks();
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to reserve book');
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

  // Helper to lookup circulation info for issued books
  const getIssuedDetails = (bookTitle) => {
    const record = circulationList.find(r => 
      r.status !== 'Returned' && 
      (r.bookTitle?.toLowerCase().includes(bookTitle?.toLowerCase()) || bookTitle?.toLowerCase().includes(r.bookTitle?.toLowerCase()))
    );
    if (record) {
      return {
        issuedTo: record.memberName,
        dueDate: record.dueDate
      };
    }
    return {
      issuedTo: 'Checked Out',
      dueDate: 'Active Loan'
    };
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight mb-1">
            OPAC Catalog Search
          </h1>
          <p className="text-xs text-indigo-100 mb-3 sm:mb-4">
            Search books, authors, categories, and shelf availability.
          </p>

          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Title, Author, ISBN, or Category..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm border-0"
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
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse h-48" />
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
            const isAvailable = book.status === 'Available';
            const issuedInfo = !isAvailable ? getIssuedDetails(book.title) : null;

            return (
              <div key={book.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md flex flex-col justify-between group relative transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {book.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isAvailable ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        {book.status}
                      </span>

                      {isLibrarian && (
                        <button
                          onClick={() => handleDeleteBook(book.id)}
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
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    by {book.author}
                  </p>

                  {/* Availability Details Section */}
                  {isAvailable ? (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Rack: <strong className="text-slate-800">{book.location}</strong></span>
                      <span>Copies: <strong className="text-emerald-600 font-bold">{book.copies || 5} Available</strong></span>
                    </div>
                  ) : (
                    /* Issued To & Return Due Date Info for Unavailable Books */
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-amber-800">
                        <span className="flex items-center gap-1 font-bold">
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          <span>Issued To:</span>
                        </span>
                        <span className="font-bold truncate max-w-[140px]">{issuedInfo.issuedTo}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Expected Return:</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-600">{issuedInfo.dueDate}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleReserve(book)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isAvailable ? 'Reserve Book' : 'Place Hold'}</span>
                  </button>

                  {isLibrarian && (
                    <button
                      onClick={() => setActiveTab('circulation')}
                      className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-1"
                      title="Issue to Student"
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
          <div className="w-full max-w-md p-6 rounded-3xl glass-card shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              <span>Add New Book to Catalog</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter book details for immediate catalog listing.
            </p>

            <form onSubmit={handleAddBook} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating System Concepts"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Author Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abraham Silberschatz"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option>Computer Science</option>
                    <option>Physics</option>
                    <option>Software Engineering</option>
                    <option>Artificial Intelligence</option>
                    <option>Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Rack Location</label>
                  <input
                    type="text"
                    placeholder="Rack CS-01"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">ISBN Code (Optional)</label>
                <input
                  type="text"
                  placeholder="978-0133591620"
                  value={newIsbn}
                  onChange={(e) => setNewIsbn(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Detail & Reserve Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card shadow-2xl relative">
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            {reservedSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hold Reserved!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Reserved <strong>{selectedBook.title}</strong> for pickup when returned.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  <Tag className="w-4 h-4" />
                  <span>Book Reservation & Availability Hold</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBook.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Author: {selectedBook.author}</p>

                <div className="my-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-semibold ${selectedBook.status === 'Available' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {selectedBook.status}
                    </span>
                  </div>
                  {selectedBook.status !== 'Available' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Currently Issued To:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Aarav Sharma</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expected Available Date:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Aug 24, 2026</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shelf Location:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedBook.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReservation}
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5"
                  >
                    <span>Confirm Hold</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
