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

// Get attestations issued by the current attester
exports.getIssuedAttestations = async (req, res) => {
  try {
    const attesterId = req.user.userId;
    
    const attestations = await Attestation.find({ attester: attesterId })
      .populate('identity', 'did name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: attestations.length,
      data: attestations.map(att => ({
        id: att._id,
        identityId: att.identity._id,
        identityName: att.identity.name,
        identityDid: att.identity.did,
        type: att.type,
        issuedAt: att.createdAt,
        expiresAt: att.expiresAt,
        status: att.status
      }))
    });
  } catch (error) {
    console.error('Get issued attestations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving attestations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Revoke an attestation
exports.revokeAttestation = async (req, res) => {
  try {
    const attestationId = req.params.id;
    const attesterId = req.user.userId;
    
    const attestation = await Attestation.findById(attestationId);
    
    // Check if attestation exists
    if (!attestation) {
      return res.status(404).json({
        success: false,
        message: 'Attestation not found'
      });
    }
    
    // Check if user has permission to revoke
    if (attestation.attester.toString() !== attesterId) {
      return res.status(403).json({
        success: false,
        message: 'You can only revoke attestations you have issued'
      });
    }
    
    // Check if already revoked
    if (attestation.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Attestation is already revoked'
      });
    }
    
    // Update attestation status
    attestation.status = 'revoked';
    attestation.revokedAt = new Date();
    attestation.revocationReason = req.body.reason || 'Revoked by attester';
    
    await attestation.save();
    
    // In a real implementation, you would also revoke this on the blockchain
    
    res.status(200).json({
      success: true,
      message: 'Attestation successfully revoked',
      data: {
        attestationId: attestation._id,
        status: attestation.status,
        revokedAt: attestation.revokedAt
      }
    });
  } catch (error) {
    console.error('Revoke attestation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking attestation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get attestations received by the current user
exports.getReceivedAttestations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // First get identities owned by this user
    const identities = await Identity.find({ owner: userId });
    
    if (!identities.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Get attestations for these identities
    const identityIds = identities.map(identity => identity._id);
    
    const attestations = await Attestation.find({
      identity: { $in: identityIds },
      status: { $ne: 'revoked' }  // Exclude revoked attestations by default
    })
      .populate('attester', 'name organization')
      .populate('identity', 'did name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: attestations.length,
      data: attestations.map(att => ({
        id: att._id,
        type: att.type,
        attester: {
          id: att.attester._id,
          name: att.attester.name,
          organization: att.attester.organization
        },
        identity: {
          id: att.identity._id,
          did: att.identity.did,
          name: att.identity.name
        },
        issuedAt: att.createdAt,
        expiresAt: att.expiresAt,
        status: att.status
      }))
    });
  } catch (error) {
    console.error('Get received attestations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving attestations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get details for a specific attestation
exports.getAttestationDetails = async (req, res) => {
  try {
    const attestationId = req.params.id;
    const userId = req.user.userId;
    
    const attestation = await Attestation.findById(attestationId)
      .populate('attester', 'name organization publicKey stellarPublicKey')
      .populate('identity', 'did name owner');
    
    if (!attestation) {
      return res.status(404).json({
        success: false,
        message: 'Attestation not found'
      });
    }
    
    // Check if user has permission to view this attestation
    const isOwner = attestation.identity.owner.toString() === userId;
    const isAttester = attestation.attester._id.toString() === userId;
    
    if (!isOwner && !isAttester && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this attestation'
      });
    }
    
    // Convert Maps to plain objects for the response
    const fields = Object.fromEntries(attestation.fields);
    const metadata = attestation.metadata ? 
      Object.fromEntries(attestation.metadata) : {};
    
    res.status(200).json({
      success: true,
      data: {
        id: attestation._id,
        type: attestation.type,
        attester: {
          id: attestation.attester._id,
          name: attestation.attester.name,
          organization: attestation.attester.organization,
          publicKey: attestation.attester.publicKey,
          stellarPublicKey: attestation.attester.stellarPublicKey
        },
        identity: {
          id: attestation.identity._id,
          did: attestation.identity.did,
          name: attestation.identity.name
        },
        fields,
        confidence: attestation.confidence,
        transaction: attestation.transaction,
        metadata,
        issuedAt: attestation.createdAt,
        expiresAt: attestation.expiresAt,
        status: attestation.status,
        revokedAt: attestation.revokedAt,
        revocationReason: attestation.revocationReason
      }
    });
  } catch (error) {
    console.error('Get attestation details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving attestation details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};