const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titleId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookTitle' },
  copyId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCopy' },
  reserveDate: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  priority: { type: String, default: 'normal' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
