const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  copyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  memberExternalId: { type: String, default: '' },
  memberName: { type: String, default: '' },
  memberIdCard: { type: String, default: '' },
  bookTitle: { type: String, default: '' },
  bookISBN: { type: String, default: '' },
  bookAccessionNumber: { type: String, default: '' },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  renewalCount: { type: Number, default: 0 },
  status: { type: String, default: 'issued' },
  referenceType: { type: String, default: 'regular' },
  fineAmount: { type: Number, default: 0 },
  holidayAdjusted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Loan || mongoose.model('Loan', LoanSchema);
