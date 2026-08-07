const mongoose = require('mongoose');

const BookTitleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  authors: { type: [String], default: [] },
  publisher: { type: String, default: '' },
  publicationYear: { type: Number },
  subject: { type: String, default: '' },
  classNo: { type: String, default: '' },
  isbn: { type: String, default: '' },
  language: { type: String },
  documentType: { type: String, default: 'Book' },
  keywords: { type: [String], default: [] },
  edition: { type: String, default: '' },
  translatedBy: { type: String, default: '' },
  summary: { type: String, default: '' },
  marc21: { type: String, default: '' },
  aacr2: { type: String, default: '' },
  metadataSource: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

BookTitleSchema.index({ title: 'text', authors: 'text', subject: 'text', publisher: 'text', isbn: 'text', keywords: 'text' });

module.exports = mongoose.models.BookTitle || mongoose.model('BookTitle', BookTitleSchema);
