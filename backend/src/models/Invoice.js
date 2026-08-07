const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  amount: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
