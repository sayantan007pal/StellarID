// ===============================================
// Identity Controller
// ===============================================

const StellarSdk = require('stellar-sdk');
const { IdentityRegistry } = require('../../core');

// Create an instance of the Identity Registry
const adminKeypair = StellarSdk.Keypair.fromSecret(process.env.ADMIN_SECRET_KEY);
const identityRegistry = new IdentityRegistry(adminKeypair);

/**
 * Create a new user identity
 * @param {Object} req - Request containing user data
 * @param {Object} res - Response object
 */
exports.createIdentity = async (req, res) => {
  try {
    const { seed, identityData } = req.body;
    
    // Create a keypair from the user's seed
    const userKeypair = StellarSdk.Keypair.fromSecret(seed);
    
    // Create the identity
    const result = await identityRegistry.createIdentity(
      userKeypair,
      identityData
    );
    
    res.status(201).json({
      success: true,
      message: 'Identity created successfully',
      data: result
    });
  } catch (error) {
    console.error('API error creating identity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create identity',
      error: error.message
    });
  }
};
// Create an instance of the Credential Verifier
const { CredentialVerifier } = require('../../core');
const credentialVerifier = new CredentialVerifier();

/**
 * Verify a user's identity
 * @param {Object} req - Request containing user public key
 * @param {Object} res - Response object
 */
exports.verifyIdentity = async (req, res) => {
  try {
    const { userPublicKey } = req.params;
    
    const verificationResult = await credentialVerifier.verifyIdentity(
      userPublicKey
    );
    
    res.status(200).json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    console.error('API error verifying identity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify identity',
      error: error.message
    });
  }
};