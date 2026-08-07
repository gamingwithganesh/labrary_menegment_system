const mongoose = require('mongoose');

const AcquisitionSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  vendorContact: { type: String, default: '' },
  vendorEmail: { type: String, default: '' },
  poNumber: { type: String, default: '' },
  invoiceNo: { type: String, default: '' },
  orders: { type: [{ bookTitle: String, author: String, isbn: String, quantity: Number, unitPrice: Number }], default: [] },
  totalCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Acquisition || mongoose.model('Acquisition', AcquisitionSchema);
