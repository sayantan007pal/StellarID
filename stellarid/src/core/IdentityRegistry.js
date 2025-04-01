// ===============================================
// Identity Registry Implementation
// ===============================================

const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');
const { server, networkPassphrase, ipfs } = require('./index');

class IdentityRegistry {
  constructor(adminKeypair) {
    this.adminKeypair = adminKeypair;
  }

  /**
   * Initialize the Identity Registry
   * Creates a new account that will serve as the registry
   */
  async initialize() {
    try {
      // Create a new account for the registry
      const registryAccount = StellarSdk.Keypair.random();
      
      // Fund the account using Friendbot (testnet only)
      await fetch(
        `https://friendbot.stellar.org?addr=${registryAccount.publicKey()}`
      );
      
      // Create the identity token asset
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(this.adminKeypair.publicKey()),
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase
        }
      )
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: new StellarSdk.Asset('IDENTITY', this.adminKeypair.publicKey()),
            source: registryAccount.publicKey()
          })
        )
        .setTimeout(30)
        .build();
      
      transaction.sign(this.adminKeypair);
      transaction.sign(registryAccount);
      
      await server.submitTransaction(transaction);
      
      return {
        registryAccount,
        message: 'Identity Registry initialized successfully'
      };
    } catch (error) {
      console.error('Failed to initialize Identity Registry:', error);
      throw error;
    }
  }

  /**
   * Create a new identity on the Stellar blockchain
   * @param {Object} userKeypair - User's Stellar keypair
   * @param {Object} identityData - Basic identity information
   * @returns {Object} Transaction result and identity hash
   */
  async createIdentity(userKeypair, identityData) {
    try {
      // Hash the identity data to create a unique identifier
      const identityHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(identityData))
        .digest('hex');
      
      // Store the identity data in IPFS
      const { cid } = await ipfs.add(JSON.stringify({
        hash: identityHash,
        data: identityData,
        createdAt: new Date().toISOString()
      }));
      
      // Create a claimable balance on Stellar that links to the IPFS data
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(this.adminKeypair.publicKey()),
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase
        }
      )
        .addOperation(
          StellarSdk.Operation.createClaimableBalance({
            asset: new StellarSdk.Asset('IDENTITY', this.adminKeypair.publicKey()),
            amount: '0.0000001',
            claimants: [
              {
                destination: userKeypair.publicKey(),
                predicate: StellarSdk.Claimant.predicateUnconditional()
              }
            ]
          })
        )
        .addMemo(StellarSdk.Memo.text(`IPFS:${cid.toString()}`))
        .setTimeout(30)
        .build();
      
      transaction.sign(this.adminKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      return {
        result,
        identityHash,
        ipfsCid: cid.toString()
      };
    } catch (error) {
      console.error('Failed to create identity:', error);
      throw error;
    }
  }
}

module.exports = IdentityRegistry;