const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },

  // Entrepreneur fields
  startupName: { type: String, default: '' },
  startupHistory: [{ type: String }],
  fundingNeeded: { type: Number, default: 0 },

  // Investor fields
  investmentHistory: [{ type: String }],
  investmentPreferences: [{ type: String }],
  portfolioSize: { type: Number, default: 0 },

  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);