// ===============================================
// Attestation Controller
// ===============================================

const crypto = require('crypto');
const StellarSdk = require('stellar-sdk');
const { AttestationManager } = require('../../core');

// Create an instance of the Attestation Manager
const adminKeypair = StellarSdk.Keypair.fromSecret(process.env.ADMIN_SECRET_KEY);
const attestationManager = new AttestationManager(adminKeypair);

/**
 * Request attestation from a registered attester
 * @param {Object} req - Request containing attestation data
 * @param {Object} res - Response object
 */
exports.requestAttestation = async (req, res) => {
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
};

/**
 * Issue an attestation (for attesters only)
 * @param {Object} req - Request containing attestation data
 * @param {Object} res - Response object
 */
exports.issueAttestation = async (req, res) => {
  try {
    const { attesterSeed, userPublicKey, identityHash, attestationData } = req.body;
    
    // Create attester keypair from seed
    const attesterKeypair = StellarSdk.Keypair.fromSecret(attesterSeed);
    
    // Issue the attestation
    const result = await attestationManager.issueAttestation(
      attesterKeypair,
      userPublicKey,
      identityHash,
      attestationData
    );
    
    res.status(200).json({
      success: true,
      message: 'Attestation issued successfully',
      data: result
    });
  } catch (error) {
    console.error('API error issuing attestation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue attestation',
      error: error.message
    });
  }
};