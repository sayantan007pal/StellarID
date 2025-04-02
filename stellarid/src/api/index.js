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
  ipfs // Now this is a synchronously created mock
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

// Initialize admin keypair
let adminKeypair;
try {
  adminKeypair = StellarSdk.Keypair.fromSecret(process.env.ADMIN_SECRET_KEY);
  console.log('Admin keypair successfully loaded');
} catch (error) {
  console.error('Error creating admin keypair:', error.message);
  console.error('Secret key format may be incorrect or missing');
  process.exit(1);
}

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

// Add this to your src/api/index.js, in the API Routes section

// Home page
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>StellarID API</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #0066cc;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .endpoint {
          background-color: #f8f9fa;
          border-left: 3px solid #0066cc;
          padding: 10px 15px;
          margin-bottom: 10px;
        }
        .method {
          font-weight: bold;
          color: #28a745;
        }
        .path {
          font-family: monospace;
          font-weight: bold;
        }
        .description {
          margin-top: 5px;
          color: #666;
        }
        footer {
          margin-top: 40px;
          font-size: 0.9em;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>StellarID API Server</h1>
      
      <p>Welcome to the StellarID API server. This API provides endpoints for managing decentralized identities on the Stellar blockchain.</p>
      
      <h2>Available Endpoints</h2>
      
      <div class="endpoint">
        <div><span class="method">GET</span> <span class="path">/health</span></div>
        <div class="description">Health check endpoint to verify the API server is running.</div>
      </div>
      
      <div class="endpoint">
        <div><span class="method">POST</span> <span class="path">/api/identity/create</span></div>
        <div class="description">Create a new identity on the Stellar blockchain.</div>
      </div>
      
      <div class="endpoint">
        <div><span class="method">GET</span> <span class="path">/api/identity/verify/:userPublicKey</span></div>
        <div class="description">Verify a user's identity and get their attestations.</div>
      </div>
      
      <div class="endpoint">
        <div><span class="method">POST</span> <span class="path">/api/attestation/request</span></div>
        <div class="description">Request a new attestation from a registered attester.</div>
      </div>
      
      <div class="endpoint">
        <div><span class="method">POST</span> <span class="path">/api/attestation/issue</span></div>
        <div class="description">Issue an attestation for a user's identity (attester only).</div>
      </div>
      
      <div class="endpoint">
        <div><span class="method">POST</span> <span class="path">/api/attester/register</span></div>
        <div class="description">Register a new attester on the platform.</div>
      </div>
      
      <div class="endpoint">
        <div><span class="method">GET</span> <span class="path">/api/attester/pending-requests</span></div>
        <div class="description">Get a list of pending attestation requests for an attester.</div>
      </div>
      
      <footer>
        StellarID - Decentralized Identity for Financial Inclusion
      </footer>
    </body>
    </html>
  `);
});

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
// Update this section in your src/api/index.js

// ===============================================
// Server Initialization
// ===============================================

const PORT = process.env.PORT || 3000;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  // Try to start server, handle port in use errors gracefully
  const startServer = (port) => {
    const server = app.listen(port)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
          startServer(port + 1);
        } else {
          console.error('Failed to start server:', err);
          process.exit(1);
        }
      })
      .on('listening', () => {
        const address = server.address();
        console.log(`StellarID API server running on port ${address.port}`);
      });
  };
  
  startServer(PORT);
}

module.exports = app;