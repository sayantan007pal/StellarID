// ===============================================
// StellarID Core Modules - Entry Point
// ===============================================

// Import required dependencies
const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');
const { createMockIpfs } = require('../utils/mock-ipfs');

// Configure Stellar testnet connection
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Create mock IPFS client - this doesn't require any external dependencies
console.log('Creating mock IPFS client for compatibility with Node.js v23');
const ipfs = createMockIpfs();

// Export server and other common utilities to be used by other modules
exports.server = server;
exports.networkPassphrase = networkPassphrase;
exports.ipfs = ipfs;

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
  ipfs
};