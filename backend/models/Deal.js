const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startupName: { type: String, required: true },
  industry: { type: String, default: '' },
  amount: { type: Number, required: true },
  equity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'],
    default: 'Due Diligence'
  },
  stage: {
    type: String,
    enum: ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C'],
    required: true
  },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Deal', DealSchema);
