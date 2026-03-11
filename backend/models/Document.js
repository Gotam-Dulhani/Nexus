const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },        // stored filename on disk
  originalName: { type: String, required: true },    // original upload name
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },            // bytes
  url: { type: String, required: true },             // accessible URL path
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  signature: { type: String, default: '' }           // base64 e-signature image
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
