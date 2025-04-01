// ===============================================
// Credential Verification
// ===============================================

const { server, ipfs } = require('./index');

class CredentialVerifier {
  constructor() {
    // Initialize with server connection already established
  }

  /**
   * Verify a user's identity and credentials
   * @param {String} userPublicKey - User's public key
   * @returns {Object} Verification result with confidence score
   */
  async verifyIdentity(userPublicKey) {
    try {
      // Get all transactions for the user account
      const { records } = await server
        .transactions()
        .forAccount(userPublicKey)
        .call();
      
      const attestations = [];
      
      // Extract attestations from transaction history
      for (const tx of records) {
        if (tx.memo_type === 'text' && tx.memo.startsWith('IPFS:')) {
          const ipfsCid = tx.memo.substring(5);
          
          // Retrieve the attestation data from IPFS
          const attestationData = await ipfs.cat(ipfsCid);
          const attestation = JSON.parse(attestationData.toString());
          
          attestations.push(attestation);
        }
      }
      
      // Calculate verification score based on attestations
      const verificationScore = this._calculateVerificationScore(attestations);
      
      return {
        userPublicKey,
        verified: verificationScore > 50,
        verificationScore,
        attestations
      };
    } catch (error) {
      console.error('Failed to verify identity:', error);
      throw error;
    }
  }

  /**
   * Calculate a verification score based on attestations
   * @param {Array} attestations - List of attestations
   * @returns {Number} Verification score (0-100)
   */
  _calculateVerificationScore(attestations) {
    if (attestations.length === 0) {
      return 0;
    }
    
    // This is a simplified scoring algorithm that would be more complex in production
    // Weights for different types of attestations
    const weights = {
      'basic-info': 10,
      'government-id': 30,
      'proof-of-address': 20,
      'biometric': 25,
      'social-verification': 15
    };
    
    // Calculate score based on types of attestations present
    let score = 0;
    const uniqueTypes = new Set();
    
    attestations.forEach(attestation => {
      if (attestation.attestationData && attestation.attestationData.type) {
        uniqueTypes.add(attestation.attestationData.type);
      }
    });
    
    uniqueTypes.forEach(type => {
      if (weights[type]) {
        score += weights[type];
      } else {
        // Default weight for unknown attestation types
        score += 5;
      }
    });
    
    // Cap the score at 100
    return Math.min(score, 100);
  }
}

module.exports = CredentialVerifier;