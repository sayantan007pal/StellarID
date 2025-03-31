// ===============================================
// StellarID Core Modules - Entry Point
// ===============================================

const IdentityRegistry = require('./IdentityRegistry');
const AttestationManager = require('./AttestationManager');
const CredentialVerifier = require('./CredentialVerifier');

module.exports = {
  IdentityRegistry,
  AttestationManager,
  CredentialVerifier
};
