const mongoose = require('mongoose');

const SerialSubscriptionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  publisher: { type: String, default: '' },
  issn: { type: String, default: '' },
  subscriptionType: { type: String, default: 'journals' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  frequency: { type: String, default: 'monthly' },
  cost: { type: Number, default: 0 },
  nonReceiptReminders: { type: [String], default: [] },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.SerialSubscription || mongoose.model('SerialSubscription', SerialSubscriptionSchema);
