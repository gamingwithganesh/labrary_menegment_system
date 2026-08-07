const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, default: 'Library Staff' },
  permissions: { type: [String], default: [] },
  department: { type: String, default: '' },
  institution: { type: String, default: '' },
  cardNumber: { type: String, default: '' },
  biometricId: { type: String, default: '' },
  status: { type: String, default: 'active' },
  activationToken: { type: String, default: null },
  activatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
