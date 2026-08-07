const mongoose = require('mongoose');

const MISLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, default: '' },
  department: { type: String, default: '' },
  reportedBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.MISLog || mongoose.model('MISLog', MISLogSchema);
