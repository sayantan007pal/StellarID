
// backend/src/models/verification.model.js
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  requestor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  identity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  // Fields the requestor wants to verify
  requestedFields: [{
    type: String,
    required: true
  }],
  // User consent details
  consent: {
    isGranted: {
      type: Boolean,
      default: false
    },
    grantedAt: Date,
    revokedAt: Date,
    expiresAt: Date
  },
  // Verification result
  result: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revoked'],
      default: 'pending'
    },
    verifiedFields: {
      type: Map,
      of: Boolean
    },
    message: String,
    verifiedAt: Date
  },
  // Cryptographic proof of verification
  proof: {
    method: String,
    hash: String,
    stellarTransaction: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Verification = mongoose.model('Verification', verificationSchema);
module.exports = Verification;