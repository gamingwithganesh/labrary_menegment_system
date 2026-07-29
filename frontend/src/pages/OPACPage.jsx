import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, BookOpen, MapPin, CheckCircle, Tag, Filter, Sparkles, BookMarked, FileText, ArrowRight } from 'lucide-react';

export const OPACPage = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const subjects = ['All', ...new Set(books.map((b) => b.subject))];

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(b.authors) ? b.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) : b.authors.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.accession_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shelf_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = subjectFilter === 'All' || b.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#a10053] bg-pink-100 px-3 py-1 rounded-full border border-pink-300 mb-2">
            <BookMarked className="w-4 h-4 text-[#a10053]" /> MODULE 3: PUBLIC ACCESS CATALOGUE
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-[#a10053]" />
            OPAC - Online Public Access Catalogue
          </h2>
          <p className="text-sm text-slate-600 font-bold mt-1">
            Search physical books across subjects, authors, ISBNs, DDC shelf racks, and accession numbers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#a10053]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Author, ISBN, Subject, Accession No, or DDC Shelf Location..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-[#a10053] font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#a10053] shrink-0" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-black font-black focus:outline-none focus:border-[#a10053]"
            >
              {subjects.map((sub, idx) => (
                <option key={idx} value={sub}>
                  Subject: {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Catalogue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition space-y-4 text-slate-900 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-pink-100 text-[#a10053] border border-pink-300">
                  {b.subject}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded ${
                    b.copies_available > 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {b.copies_available > 0 ? `${b.copies_available} Available` : 'All Issued'}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-base leading-snug">{b.title}</h3>
              <p className="text-xs text-slate-700 font-bold">By {Array.isArray(b.authors) ? b.authors.join(', ') : b.authors}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200 font-bold text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Accession No:</span>
                <span className="font-mono font-black text-[#a10053]">{b.accession_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">ISBN:</span>
                <span className="font-mono text-slate-900 font-bold">{b.isbn}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900 pt-1 border-t border-slate-200 font-black">
                <MapPin className="w-3.5 h-3.5 text-[#a10053] shrink-0" />
                <span>{b.shelf_location}</span>
              </div>
            </div>

            {/* High-Contrast "View Full MARC Record" Action Button */}
            <div className="pt-1">
              <button
                onClick={() => setSelectedBook(b)}
                className="w-full py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-900/30 transition flex items-center justify-center gap-2 border border-[#880045]"
              >
                <FileText className="w-4 h-4 text-white" />
                <span className="text-white font-black">VIEW FULL MARC RECORD</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MARC 21 Record Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl border border-slate-300 shadow-2xl space-y-5 text-slate-900">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-pink-100 text-[#a10053] border border-pink-300">
                  {selectedBook.subject}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedBook.title}</h3>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-slate-400 hover:text-black text-xl font-black">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800">
                <div>
                  <div className="text-slate-500 font-black">MARC 100 Author</div>
                  <div className="font-black text-slate-900">{Array.isArray(selectedBook.authors) ? selectedBook.authors.join(', ') : selectedBook.authors}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-black">MARC 260 Publisher & Year</div>
                  <div className="font-black text-slate-900">{selectedBook.publisher} ({selectedBook.publication_year})</div>
                </div>
                <div>
                  <div className="text-slate-500 font-black">MARC 020 ISBN</div>
                  <div className="font-mono font-black text-[#a10053]">{selectedBook.isbn}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-black">MARC 090 Accession No</div>
                  <div className="font-mono font-black text-slate-900">{selectedBook.accession_no}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-black">DDC Shelf Location</div>
                  <div className="font-black text-slate-900">{selectedBook.shelf_location}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-black">Total Holdings</div>
                  <div className="font-black text-slate-900">{selectedBook.copies_total} ({selectedBook.copies_available} Available)</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Hold reservation registered for "${selectedBook.title}".`);
                  setSelectedBook(null);
                }}
                className="flex-1 py-3 bg-[#a10053] hover:bg-[#880045] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition border border-[#880045]"
              >
                <span className="text-white font-black">Place Online Hold Reservation</span>
              </button>
              <button
                onClick={() => setSelectedBook(null)}
                className="py-3 px-5 bg-slate-200 hover:bg-slate-300 text-black font-black text-xs rounded-xl border border-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
