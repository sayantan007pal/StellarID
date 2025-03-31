// backend/src/controllers/verification.controller.js
const Verification = require('../models/verification.model');
const Identity = require('../models/identity.model');
const Attestation = require('../models/attestation.model');
const User = require('../models/user.model');
const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');

// Configure Stellar SDK for testnet or public network
const server = process.env.STELLAR_NETWORK === 'testnet' 
  ? new StellarSdk.Server('https://horizon-testnet.stellar.org')
  : new StellarSdk.Server('https://horizon.stellar.org');
const networkPassphrase = process.env.STELLAR_NETWORK === 'testnet'
  ? StellarSdk.Networks.TESTNET
  : StellarSdk.Networks.PUBLIC;

exports.requestVerification = async (req, res) => {
  try {
    const verifierId = req.user.userId; // from auth middleware
    const { identityId, requestedFields, purpose, expiry } = req.body;
    
    if (!identityId || !requestedFields || !Array.isArray(requestedFields) || requestedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Identity ID and requested fields are required'
      });
    }
    
    // Verify verifier role
    const verifier = await User.findById(verifierId);
    if (!verifier || verifier.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        message: 'Only authorized verifiers can request verifications'
      });
    }
    
    // Find the identity to verify
    const identity = await Identity.findById(identityId);
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }
    
    // Calculate expiry date if provided
    let expiryDate;
    if (expiry) {
      expiryDate = new Date(expiry);
    } else {
      // Default to 7 days
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
    }
    
    // Create verification request
    const verification = new Verification({
      requestor: verifierId,
      identity: identityId,
      requestedFields,
      consent: {
        isGranted: false,
        expiresAt: expiryDate
      },
      result: {
        status: 'pending'
      }
    });
    
    await verification.save();
    
    res.status(201).json({
      success: true,
      data: {
        verificationId: verification._id,
        status: 'pending',
        expiresAt: verification.consent.expiresAt
      }
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getRequestedVerifications = async (req, res) => {
  try {
    const verifierId = req.user.userId;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Build query
    const query = { requestor: verifierId };
    
    if (status) {
      query['result.status'] = status;
    }
    
    // Fetch verifications
    const verifications = await Verification.find(query)
      .populate('identity', 'stellarAddress currentTier')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    // Count total
    const total = await Verification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        verifications,
        total,
        hasMore: total > parseInt(skip) + verifications.length
      }
    });
  } catch (error) {
    console.error('Get requested verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving requested verifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getReceivedVerifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Find user's identity
    const identity = await Identity.findOne({ user: userId });
    
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found for this user'
      });
    }
    
    // Build query
    const query = { identity: identity._id };
    
    if (status) {
      query['result.status'] = status;
    }
    
    // Fetch verifications
    const verifications = await Verification.find(query)
      .populate('requestor', 'username role')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    // Count total
    const total = await Verification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        verifications,
        total,
        hasMore: total > parseInt(skip) + verifications.length
      }
    });
  } catch (error) {
    console.error('Get received verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving received verifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.provideConsent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { selectedFields } = req.body;
    
    // Find the verification request
    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }
    
    // Find user's identity
    const identity = await Identity.findOne({ user: userId });
    
    if (!identity || !identity._id.equals(verification.identity)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to provide consent for this verification'
      });
    }
    
    // Check if verification request has expired
    if (verification.consent.expiresAt && verification.consent.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification request has expired'
      });
    }
    
    // Update consent information
    verification.consent.isGranted = true;
    verification.consent.grantedAt = new Date();
    
    // If user provided specific fields to share
    if (selectedFields && Array.isArray(selectedFields) && selectedFields.length > 0) {
      // Only share selected fields that were requested
      const validFields = verification.requestedFields.filter(field => selectedFields.includes(field));
      verification.result.verifiedFields = new Map();
      
      // Set selected fields as verified in the result
      validFields.forEach(field => {
        verification.result.verifiedFields.set(field, true);
      });
    } else {
      // Share all requested fields
      verification.result.verifiedFields = new Map();
      verification.requestedFields.forEach(field => {
        verification.result.verifiedFields.set(field, true);
      });
    }
    
    // Get attestations to verify the requested fields
    const attestations = await Attestation.find({
      identity: identity._id,
      isRevoked: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    
    // Check which fields are actually verified by attestations
    const attestedFields = new Set();
    attestations.forEach(attestation => {
      attestation.fields.forEach((value, key) => {
        attestedFields.add(key);
      });
    });
    
    // Update verification status
    verification.result.status = 'approved';
    verification.result.verifiedAt = new Date();
    
    // Generate a cryptographic proof
    const dataToHash = JSON.stringify({
      identity: identity._id,
      verifier: verification.requestor,
      fields: Array.from(verification.result.verifiedFields.keys()),
      timestamp: verification.result.verifiedAt
    });
    
    verification.proof = {
      method: 'SHA-256',
      hash: crypto.createHash('sha256').update(dataToHash).digest('hex')
    };
    
    await verification.save();
    
    res.status(200).json({
      success: true,
      data: {
        verificationId: verification._id,
        status: verification.result.status,
        verifiedFields: Array.from(verification.result.verifiedFields.keys()),
        timestamp: verification.result.verifiedAt,
        proof: verification.proof.hash
      }
    });
  } catch (error) {
    console.error('Provide consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error providing consent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.revokeConsent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    // Find the verification request
    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }
    
    // Find user's identity
    const identity = await Identity.findOne({ user: userId });
    
    if (!identity || !identity._id.equals(verification.identity)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke consent for this verification'
      });
    }
    
    // Update consent information
    verification.consent.isGranted = false;
    verification.consent.revokedAt = new Date();
    verification.result.status = 'revoked';
    
    await verification.save();
    
    res.status(200).json({
      success: true,
      data: {
        verificationId: verification._id,
        status: 'revoked',
        revokedAt: verification.consent.revokedAt
      }
    });
  } catch (error) {
    console.error('Revoke consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking consent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getVerificationDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    // Find user's role
    const user = await User.findById(userId);
    
    // Find the verification
    const verification = await Verification.findById(id)
      .populate('requestor', 'username role')
      .populate('identity', 'stellarAddress currentTier');
    
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }
    
    // Check if user has permission to view this verification
    const userIdentity = await Identity.findOne({ user: userId });
    
    const isOwner = userIdentity && userIdentity._id.equals(verification.identity);
    const isRequestor = verification.requestor._id.equals(userId);
    const isAdmin = user.role === 'admin';
    
    if (!isOwner && !isRequestor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this verification'
      });
    }
    
    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Get verification details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};