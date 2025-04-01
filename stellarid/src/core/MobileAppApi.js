// ===============================================
// Mobile Application Backend (API)
// ===============================================

const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');

class MobileAppApi {
  constructor(identityRegistry, attestationManager, credentialVerifier) {
    this.identityRegistry = identityRegistry;
    this.attestationManager = attestationManager;
    this.credentialVerifier = credentialVerifier;
  }

  /**
   * Create a new user identity
   * @param {Object} req - Request containing user data
   * @param {Object} res - Response object
   */
  async createIdentity(req, res) {
    try {
      const { seed, identityData } = req.body;
      
      // Create a keypair from the user's seed
      const userKeypair = StellarSdk.Keypair.fromSecret(seed);
      
      // Create the identity
      const result = await this.identityRegistry.createIdentity(
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
  }

  /**
   * Request attestation from a registered attester
   * @param {Object} req - Request containing attestation data
   * @param {Object} res - Response object
   */
  async requestAttestation(req, res) {
    try {
      const { userPublicKey, attestationType, attestationData } = req.body;
      
      // In a real implementation, this would trigger a notification to the attester
      // For the prototype, we'll simulate this process
      
      res.status(200).json({
        success: true,
        message: 'Attestation request submitted successfully',
        requestId: crypto.randomUUID()
      });
    } catch (error) {
      console.error('API error requesting attestation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request attestation',
        error: error.message
      });
    }
  }

  /**
   * Verify a user's identity
   * @param {Object} req - Request containing user public key
   * @param {Object} res - Response object
   */
  async verifyIdentity(req, res) {
    try {
      const { userPublicKey } = req.params;
      
      const verificationResult = await this.credentialVerifier.verifyIdentity(
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
  }
}

module.exports = MobileAppApi;