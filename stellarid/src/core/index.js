// ===============================================
// StellarID Core Modules - Entry Point
// ===============================================

// Import required dependencies
const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');
const { createIpfsClient } = require('../utils/helia-ipfs-client');

// Configure Stellar testnet connection
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Initialize IPFS client
let ipfs;

// Function to initialize IPFS
async function initializeIpfs() {
  if (!ipfs) {
    ipfs = await createIpfsClient({
      mock: process.env.USE_MOCK_IPFS === 'true'
    });
  }
  return ipfs;
}

// Export server and other common utilities to be used by other modules
exports.server = server;
exports.networkPassphrase = networkPassphrase;
exports.initializeIpfs = initializeIpfs;

// Provide a getter for the IPFS client to ensure it's initialized
Object.defineProperty(exports, 'ipfs', {
  get: function() {
    if (!ipfs) {
      console.warn('IPFS client accessed before initialization. This may cause issues.');
      // Return a mock for safety
      return {
        add: async () => ({ cid: { toString: () => 'uninitialized-mock-cid' } }),
        cat: async () => Buffer.from(JSON.stringify({}))
      };
    }
    return ipfs;
  }
});

// Import and re-export the core modules
const IdentityRegistry = require('./IdentityRegistry');
const AttestationManager = require('./AttestationManager');
const CredentialVerifier = require('./CredentialVerifier');
const MobileAppApi = require('./MobileAppApi');

module.exports = {
  IdentityRegistry,
  AttestationManager,
  CredentialVerifier,
  MobileAppApi,
  server,
  networkPassphrase,
  initializeIpfs,
  // ipfs is already exported via the getter
};