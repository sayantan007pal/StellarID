// ===============================================
// Attestation Management
// ===============================================

const StellarSdk = require('stellar-sdk');
const { server, networkPassphrase, ipfs } = require('./index');

class AttestationManager {
  constructor(adminKeypair) {
    this.adminKeypair = adminKeypair;
  }

  /**
   * Register a new attester on the network
   * @param {Object} attesterKeypair - Attester's Stellar keypair
   * @param {Object} attesterInfo - Information about the attester
   * @returns {Object} Transaction result
   */
  async registerAttester(attesterKeypair, attesterInfo) {
    try {
      // Store attester information in IPFS
      const { cid } = await ipfs.add(JSON.stringify(attesterInfo));
      
      // Create a transaction that designates the account as an attester
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(this.adminKeypair.publicKey()),
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase
        }
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: `attester-${attesterKeypair.publicKey().substring(0, 10)}`,
            value: cid.toString()
          })
        )
        .setTimeout(30)
        .build();
      
      transaction.sign(this.adminKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      return {
        result,
        attesterPublicKey: attesterKeypair.publicKey(),
        ipfsCid: cid.toString()
      };
    } catch (error) {
      console.error('Failed to register attester:', error);
      throw error;
    }
  }

  /**
   * Issue an attestation for a user's identity
   * @param {Object} attesterKeypair - Attester's Stellar keypair
   * @param {String} userPublicKey - User's public key
   * @param {String} identityHash - Hash of the user's identity
   * @param {Object} attestationData - Data to be attested
   * @returns {Object} Transaction result
   */
  async issueAttestation(attesterKeypair, userPublicKey, identityHash, attestationData) {
    try {
      // Store attestation data in IPFS
      const { cid } = await ipfs.add(JSON.stringify({
        identityHash,
        attestationData,
        attestedAt: new Date().toISOString(),
        attesterPublicKey: attesterKeypair.publicKey()
      }));
      
      // Create attestation record on Stellar
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(attesterKeypair.publicKey()),
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase
        }
      )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: userPublicKey,
            asset: new StellarSdk.Asset('ATTEST', attesterKeypair.publicKey()),
            amount: '0.0000001'
          })
        )
        .addMemo(StellarSdk.Memo.text(`IPFS:${cid.toString()}`))
        .setTimeout(30)
        .build();
      
      transaction.sign(attesterKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      return {
        result,
        attestationId: cid.toString()
      };
    } catch (error) {
      console.error('Failed to issue attestation:', error);
      throw error;
    }
  }
}

module.exports = AttestationManager;