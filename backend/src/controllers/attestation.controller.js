
// backend/src/controllers/attestation.controller.js
const Attestation = require('../models/attestation.model');
const Identity = require('../models/identity.model');
const User = require('../models/user.model');
const StellarSdk = require('stellar-sdk');

// Configure Stellar SDK for testnet or public network
const server = process.env.STELLAR_NETWORK === 'testnet' 
  ? new StellarSdk.Server('https://horizon-testnet.stellar.org')
  : new StellarSdk.Server('https://horizon.stellar.org');
const networkPassphrase = process.env.STELLAR_NETWORK === 'testnet'
  ? StellarSdk.Networks.TESTNET
  : StellarSdk.Networks.PUBLIC;

exports.createAttestation = async (req, res) => {
  try {
    const { identityId, type, fields, confidence, metadata } = req.body;
    const attesterId = req.user.userId; // from auth middleware
    
    // Verify attester role
    const attester = await User.findById(attesterId);
    if (!attester || attester.role !== 'attester') {
      return res.status(403).json({
        success: false,
        message: 'Only authorized attesters can create attestations'
      });
    }
    
    // Find the identity to attest
    const identity = await Identity.findById(identityId);
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }
    
    // Create Stellar asset for this attestation
    // In a real implementation, this would involve more complex Stellar operations
    const assetCode = `ATT${Date.now().toString().substring(7)}`;
    const assetIssuer = attester.stellarPublicKey;
    
    // Create the attestation record
    const attestation = new Attestation({
      identity: identityId,
      attester: attesterId,
      type,
      fields: new Map(Object.entries(fields)),
      confidence,
      transaction: {
        assetCode,
        assetIssuer,
        timestamp: new Date()
      },
      metadata: metadata ? new Map(Object.entries(metadata)) : undefined,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year validity
    });
    
    await attestation.save();
    
    // Update the identity with this attestation
    identity.attestations.push(attestation._id);
    
    // Update verified fields on the identity
    Object.keys(fields).forEach(field => {
      identity.verifiedFields.set(field, true);
    });
    
    // Check if the identity can be upgraded to a higher tier
    // This would involve more complex logic in a real implementation
    if (identity.attestations.length >= 3 && identity.currentTier < 1) {
      identity.currentTier = 1;
    } else if (identity.attestations.length >= 5 && identity.currentTier < 2) {
      identity.currentTier = 2;
    }
    
    await identity.save();
    
    res.status(201).json({
      success: true,
      data: {
        attestationId: attestation._id,
        type: attestation.type,
        assetCode: attestation.transaction.assetCode,
        identityTier: identity.currentTier
      }
    });
  } catch (error) {
    console.error('Create attestation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating attestation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};