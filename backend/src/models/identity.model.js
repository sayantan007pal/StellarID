
// backend/src/models/identity.model.js
const mongoose = require('mongoose');

// Define the schema for different verification levels
const tierSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  requiredFields: [String],
  minimumAttestations: {
    type: Number,
    default: 1
  }
});

// Define the identity schema with verification tiers
const identitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stellarAddress: {
    type: String,
    required: true
  },
  currentTier: {
    type: Number,
    default: 0
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    nationality: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  contactInfo: {
    email: String,
    phone: String,
    alternativeContact: String
  },
  // Reference to attestations related to this identity
  attestations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attestation'
  }],
  // Track which fields have been verified
  verifiedFields: {
    type: Map,
    of: Boolean,
    default: {}
  },
  // Hash of documents uploaded for verification
  documents: [{
    type: {
      type: String,
      enum: ['passport', 'nationalId', 'driverLicense', 'birthCertificate', 'utilityBill', 'bankStatement', 'other'],
      required: true
    },
    documentHash: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    expiresAt: Date
  }],
  // Cryptographic challenge for proving control of the identity
  challenge: {
    value: String,
    expiresAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
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

const Identity = mongoose.model('Identity', identitySchema);
module.exports = Identity;