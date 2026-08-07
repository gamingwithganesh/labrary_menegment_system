const mongoose = require('mongoose');

const BookCopySchema = new mongoose.Schema({
  titleId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookTitle', required: true },
  accessionNumber: { type: String, required: true, unique: true },
  barcode: { type: String, default: '' },
  qrCode: { type: String, default: '' },
  shelfLocation: { type: String, default: '' },
  status: { type: String, default: 'available' },
  acquisitionDate: { type: Date, default: Date.now },
  cost: { type: Number, default: 0 },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  bindingRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BindingRecord' },
  department: { type: String, default: '' },
  transferHistory: { type: [{ from: String, to: String, date: Date, approvedBy: String }], default: [] },
  assetCondition: { type: String, default: 'good' },
  rfidTag: { type: String, default: '' },
  copiesTotal: { type: Number, default: 1 },
  copiesAvailable: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.BookCopy || mongoose.model('BookCopy', BookCopySchema);
