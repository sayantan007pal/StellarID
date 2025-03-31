// backend/src/config.js
require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/stellarid',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Stellar configuration
  stellarNetwork: process.env.STELLAR_NETWORK || 'testnet',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Other configurations
  identityTiers: [
    {
      level: 0,
      name: 'Basic',
      description: 'Initial identity with minimal verification',
      requiredFields: ['stellarAddress'],
      minimumAttestations: 0,
    },
    {
      level: 1,
      name: 'Standard',
      description: 'Identity with basic personal information verified',
      requiredFields: ['firstName', 'lastName', 'email', 'phone'],
      minimumAttestations: 2,
    },
    {
      level: 2,
      name: 'Enhanced',
      description: 'Identity with full profile and multiple attestations',
      requiredFields: ['firstName', 'lastName', 'dateOfBirth', 'address', 'nationality'],
      minimumAttestations: 5,
    },
    {
      level: 3,
      name: 'Premium',
      description: 'Fully verified identity with official document verification',
      requiredFields: ['firstName', 'lastName', 'dateOfBirth', 'address', 'nationality', 'documents'],
      minimumAttestations: 8,
    }
  ]
};