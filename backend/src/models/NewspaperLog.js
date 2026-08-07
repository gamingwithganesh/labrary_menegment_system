const mongoose = require('mongoose');

const NewspaperLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  paperName: { type: String, required: true },
  copiesReceived: { type: Number, default: 0 },
  receivedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.NewspaperLog || mongoose.model('NewspaperLog', NewspaperLogSchema);
