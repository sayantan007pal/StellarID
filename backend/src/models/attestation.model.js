
// backend/src/models/attestation.model.js
const mongoose = require('mongoose');

const attestationSchema = new mongoose.Schema({
  identity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  attester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'address', 'financial', 'employment', 'education', 'social', 'other'],
    required: true
  },
  fields: {
    type: Map,
    of: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  // Stellar transaction details
  transaction: {
    txHash: String,
    assetCode: String,
    assetIssuer: String,
    timestamp: Date
  },
  // Expiration of this attestation
  expiresAt: {
    type: Date
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  revokedReason: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Attestation = mongoose.model('Attestation', attestationSchema);
module.exports = Attestation;
