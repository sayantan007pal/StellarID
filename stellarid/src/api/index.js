// ===============================================
// StellarID API Server
// ===============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const StellarSdk = require('stellar-sdk');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../deploy/.env') });

// Import core modules
const { 
  IdentityRegistry, 
  AttestationManager,
  CredentialVerifier,
  MobileAppApi,
  initializeIpfs
} = require('../core');

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Initialize Stellar connection
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Check if required environment variables are present
if (!process.env.ADMIN_SECRET_KEY) {
  console.error('Error: ADMIN_SECRET_KEY environment variable is missing');
  console.log('Make sure .env file exists and contains the required variables');
  process.exit(1);
}

// Startup initialization function
async function initialize() {
  try {
    // Initialize IPFS first
    console.log('Initializing IPFS client...');
    await initializeIpfs();
    
    // Initialize admin keypair
    console.log('Initializing admin keypair...');
    const adminKeypair = StellarSdk.Keypair.fromSecret(process.env.ADMIN_SECRET_KEY);
    console.log('Admin keypair successfully loaded');
    
    // Initialize core components
    const identityRegistry = new IdentityRegistry(adminKeypair);
    const attestationManager = new AttestationManager(adminKeypair);
    const credentialVerifier = new CredentialVerifier();
    
    // Initialize API handler
    const mobileAppApi = new MobileAppApi(
      identityRegistry,
      attestationManager,
      credentialVerifier
    );
    
    // ===============================================
    // API Routes
    // ===============================================
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Identity endpoints
    app.post('/api/identity/create', (req, res) => {
      mobileAppApi.createIdentity(req, res);
    });
    
    app.get('/api/identity/verify/:userPublicKey', (req, res) => {
      mobileAppApi.verifyIdentity(req, res);
    });
    
    // Attestation endpoints
    app.post('/api/attestation/request', (req, res) => {
      mobileAppApi.requestAttestation(req, res);
    });
    
    app.post('/api/attestation/issue', async (req, res) => {
      try {
        const { 
          attesterSeed, 
          userPublicKey, 
          identityHash, 
          attestationData 
        } = req.body;
        
        // Validate that the attester is registered
        // (This would check against a database of registered attesters)
        
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
        console.error('Failed to issue attestation:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to issue attestation',
          error: error.message
        });
      }
    });
    
    // Attester endpoints
    app.post('/api/attester/register', async (req, res) => {
      try {
        const { seed, attesterInfo } = req.body;
        
        // Create attester keypair from seed
        const attesterKeypair = StellarSdk.Keypair.fromSecret(seed);
        
        // Register the attester
        const result = await attestationManager.registerAttester(
          attesterKeypair,
          attesterInfo
        );
        
        res.status(201).json({
          success: true,
          message: 'Attester registered successfully',
          data: result
        });
      } catch (error) {
        console.error('Failed to register attester:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to register attester',
          error: error.message
        });
      }
    });
    
    app.get('/api/attester/pending-requests', async (req, res) => {
      try {
        const { attesterPublicKey } = req.params;
        
        // In a real implementation, this would fetch pending requests from a database
        // For the prototype, we'll return mock data
        
        res.status(200).json({
          success: true,
          data: {
            pendingRequests: [
              {
                requestId: '123e4567-e89b-12d3-a456-426614174000',
                userPublicKey: 'GDKW...FDRV',
                attestationType: 'government-id',
                requestedAt: new Date().toISOString()
              }
            ]
          }
        });
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch pending requests',
          error: error.message
        });
      }
    });
    
    // ===============================================
    // Error Handler
    // ===============================================
    
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
      });
    });
    
    console.log('API routes initialized successfully');
    
    // Initialize the identity registry if needed
    // Uncomment this if you want to automatically initialize the registry on startup
    // console.log('Initializing StellarID system...');
    // const registryResult = await identityRegistry.initialize();
    // console.log('Identity registry initialized:', registryResult);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize API server:', error);
    return { success: false, error };
  }
}

// ===============================================
// Server Initialization
// ===============================================

const PORT = process.env.PORT || 3000;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  initialize().then(result => {
    if (result.success) {
      app.listen(PORT, () => {
        console.log(`StellarID API server running on port ${PORT}`);
      });
    } else {
      console.error('API server initialization failed, shutting down');
      process.exit(1);
    }
  });
}

module.exports = app;