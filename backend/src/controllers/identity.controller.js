// backend/src/controllers/identity.controller.js
const Identity = require('../models/identity.model');
const User = require('../models/user.model');
const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');

exports.createIdentity = async (req, res) => {
  try {
    const { personalInfo, contactInfo } = req.body;
    const userId = req.user.userId; // from auth middleware
    
    // Check if user already has an identity
    const existingIdentity = await Identity.findOne({ user: userId });
    if (existingIdentity) {
      return res.status(400).json({
        success: false,
        message: 'User already has an identity profile'
      });
    }
    
    // Get user's Stellar address
    const user = await User.findById(userId);
    if (!user || !user.stellarPublicKey) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid Stellar account'
      });
    }
    
    // Create a cryptographic challenge for later verification
    const challenge = crypto.randomBytes(32).toString('hex');
    const challengeExpiry = new Date();
    challengeExpiry.setHours(challengeExpiry.getHours() + 24); // 24 hour expiry
    
    // Create new identity
    const identity = new Identity({
      user: userId,
      stellarAddress: user.stellarPublicKey,
      personalInfo: personalInfo || {},
      contactInfo: contactInfo || {},
      challenge: {
        value: challenge,
        expiresAt: challengeExpiry
      }
    });
    
    await identity.save();
    
    res.status(201).json({
      success: true,
      data: {
        identityId: identity._id,
        stellarAddress: identity.stellarAddress,
        currentTier: identity.currentTier,
        challenge: identity.challenge.value
      }
    });
  } catch (error) {
    console.error('Create identity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating identity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMyIdentity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const identity = await Identity.findOne({ user: userId });
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }
    res.status(200).json({
      success: true,
      data: identity
    });
  } catch (error) {
    console.error('Get identity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving identity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateIdentity = async (req, res) => {
  try {
    const { personalInfo, contactInfo } = req.body;
    const userId = req.user.userId;
    
    // Find the identity
    const identity = await Identity.findOne({ user: userId });
    
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }
    
    // Update fields
    if (personalInfo) {
      identity.personalInfo = {
        ...identity.personalInfo,
        ...personalInfo
      };
    }
    
    if (contactInfo) {
      identity.contactInfo = {
        ...identity.contactInfo,
        ...contactInfo
      };
    }
    
    identity.updatedAt = Date.now();
    await identity.save();
    
    res.status(200).json({
      success: true,
      data: {
        identityId: identity._id,
        personalInfo: identity.personalInfo,
        contactInfo: identity.contactInfo,
        currentTier: identity.currentTier
      }
    });
  } catch (error) {
    console.error('Update identity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating identity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    // Placeholder logic: implement your file upload logic here.
    // For example, you might handle file uploads using multer.
    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully (placeholder)'
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const identity = await Identity.findOne({ user: userId });
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }
    // Placeholder: You can customize this logic as needed.
    res.status(200).json({
      success: true,
      data: {
        verificationStatus: identity.verificationStatus || 'pending'
      }
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyChallenge = async (req, res) => {
  try {
    const { challengeResponse } = req.body;
    const userId = req.user.userId;
    
    const identity = await Identity.findOne({ user: userId });
    if (!identity) {
      return res.status(404).json({
        success: false,
        message: 'Identity not found'
      });
    }
    
    // Placeholder verification logic: compare the provided response with the stored challenge.
    if (challengeResponse === identity.challenge.value) {
      // Mark identity as verified, update tier, etc.
      identity.verificationStatus = 'verified';
      await identity.save();
      
      res.status(200).json({
        success: true,
        message: 'Challenge verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid challenge response'
      });
    }
  } catch (error) {
    console.error('Verify challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
