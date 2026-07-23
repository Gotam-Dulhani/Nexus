const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'USD' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  reference: { type: String, unique: true },
  description: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

// Auto-generate reference before saving
TransactionSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = `NX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
