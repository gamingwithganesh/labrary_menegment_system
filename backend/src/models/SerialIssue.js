const mongoose = require('mongoose');

const SerialIssueSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'SerialSubscription', required: true },
  issueNumber: { type: String, default: '' },
  issueDate: { type: Date, required: true },
  receivedDate: { type: Date },
  status: { type: String, default: 'received' },
  boundVolume: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.SerialIssue || mongoose.model('SerialIssue', SerialIssueSchema);
