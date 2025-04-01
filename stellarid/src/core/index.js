// ===============================================
// StellarID Core Modules - Entry Point
// ===============================================

// Import required dependencies
const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');
const IPFS = require('ipfs-http-client');

// Configure Stellar testnet connection
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Configure IPFS for document storage
const ipfs = IPFS.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
});

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