// ===============================================
// StellarID API Test Suite
// ===============================================

const chai = require('chai');
const supertest = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const expect = chai.expect;

describe('StellarID API', function() {
  let app, request, sandbox, mockServer, mockIpfs, mockStellarSdk;
  let mockIdentityRegistry, mockAttestationManager, mockCredentialVerifier;
  
  before(function() {
    // Temporarily disable server auto-start for tests
    process.env.NODE_ENV = 'test';
  });
  
  after(function() {
    // Restore environment
    delete process.env.NODE_ENV;
  });
  
  beforeEach(function() {
    // Create sandbox for isolation
    sandbox = sinon.createSandbox();
    
    // Create mock objects for dependencies
    mockServer = {
      loadAccount: sandbox.stub().resolves({
        accountId: 'GADMIN',
        sequence: '123'
      }),
      submitTransaction: sandbox.stub().resolves({
        hash: 'mocked-transaction-hash'
      }),
      transactions: sandbox.stub().returns({
        forAccount: sandbox.stub().returnsThis(),
        call: sandbox.stub().resolves({
          records: [
            { memo_type: 'text', memo: 'IPFS:mocked-ipfs-cid-1' }
          ]
        })
      })
    };
    
    mockIpfs = {
      add: sandbox.stub().resolves({
        cid: { toString: () => 'mocked-ipfs-cid' }
      }),
      cat: sandbox.stub().resolves(Buffer.from(JSON.stringify({
        identityHash: 'mocked-identity-hash',
        attestationData: { type: 'basic-info' },
        attestedAt: new Date().toISOString(),
        attesterPublicKey: 'GATTESTER'
      })))
    };
    
    // Mock Stellar-related functionality
    const mockKeypairs = {
      'SADMIN': {
        publicKey: () => 'GADMIN',
        secret: () => 'SADMIN',
        sign: sandbox.stub()
      },
      'SUSER': {
        publicKey: () => 'GUSER',
        secret: () => 'SUSER',
        sign: sandbox.stub()
      },
      'SATTESTER': {
        publicKey: () => 'GATTESTER',
        secret: () => 'SATTESTER',
        sign: sandbox.stub()
      }
    };
    
    // Mock transaction
    const mockTransaction = {
      sign: sandbox.stub(),
      hash: 'mocked-transaction-hash'
    };
    
    // Mock TransactionBuilder
    const mockTransactionBuilder = {
      addOperation: sandbox.stub().returnsThis(),
      addMemo: sandbox.stub().returnsThis(),
      setTimeout: sandbox.stub().returnsThis(),
      build: sandbox.stub().returns(mockTransaction)
    };
    
    // Stellar SDK mock
    mockStellarSdk = {
      Server: sandbox.stub().returns(mockServer),
      TransactionBuilder: sandbox.stub().returns(mockTransactionBuilder),
      Operation: {
        changeTrust: sandbox.stub(),
        payment: sandbox.stub(),
        manageData: sandbox.stub(),
        createClaimableBalance: sandbox.stub()
      },
      Asset: sandbox.stub(),
      Keypair: {
        random: sandbox.stub().returns({
          publicKey: () => 'GRANDOM',
          secret: () => 'SRANDOM',
          sign: sandbox.stub()
        }),
        fromSecret: sandbox.stub().callsFake((secret) => {
          return mockKeypairs[secret] || null;
        })
      },
      Memo: {
        text: sandbox.stub().returns('IPFS:mocked-ipfs-cid')
      },
      Claimant: {
        predicateUnconditional: sandbox.stub()
      },
      Networks: {
        TESTNET: 'Test SDF Network ; September 2015'
      },
      BASE_FEE: '100'
    };
    
    // Mock core components
    mockIdentityRegistry = {
      initialize: sandbox.stub().resolves({
        registryAccount: { publicKey: () => 'GREGISTRY' },
        message: 'Identity Registry initialized successfully'
      }),
      createIdentity: sandbox.stub().resolves({
        result: { hash: 'mocked-transaction-hash' },
        identityHash: 'mocked-identity-hash',
        ipfsCid: 'mocked-ipfs-cid'
      })
    };
    
    mockAttestationManager = {
      registerAttester: sandbox.stub().resolves({
        result: { hash: 'mocked-transaction-hash' },
        attesterPublicKey: 'GATTESTER',
        ipfsCid: 'mocked-ipfs-cid'
      }),
      issueAttestation: sandbox.stub().resolves({
        result: { hash: 'mocked-transaction-hash' },
        attestationId: 'mocked-ipfs-cid'
      })
    };
    
    mockCredentialVerifier = {
      verifyIdentity: sandbox.stub().resolves({
        userPublicKey: 'GUSER',
        verified: true,
        verificationScore: 40,
        attestations: [
          {
            identityHash: 'mocked-identity-hash',
            attestationData: { type: 'basic-info' },
            attestedAt: new Date().toISOString(),
            attesterPublicKey: 'GATTESTER'
          }
        ]
      })
    };
    
    // Mock MobileAppApi constructor
    const mockMobileAppApi = function() {
      return {
        createIdentity: (req, res) => {
          const { seed, identityData } = req.body;
          
          if (!seed || !identityData) {
            return res.status(400).json({
              success: false,
              message: 'Missing required parameters',
              error: 'Seed and identityData are required'
            });
          }
          
          return mockIdentityRegistry.createIdentity(
            mockStellarSdk.Keypair.fromSecret(seed),
            identityData
          )
            .then(result => {
              res.status(201).json({
                success: true,
                message: 'Identity created successfully',
                data: result
              });
            })
            .catch(error => {
              console.error('API error creating identity:', error);
              res.status(500).json({
                success: false,
                message: 'Failed to create identity',
                error: error.message
              });
            });
        },
        
        verifyIdentity: (req, res) => {
          const { userPublicKey } = req.params;
          
          if (!userPublicKey) {
            return res.status(400).json({
              success: false,
              message: 'Missing required parameter',
              error: 'User public key is required'
            });
          }
          
          return mockCredentialVerifier.verifyIdentity(userPublicKey)
            .then(result => {
              res.status(200).json({
                success: true,
                data: result
              });
            })
            .catch(error => {
              console.error('API error verifying identity:', error);
              res.status(500).json({
                success: false,
                message: 'Failed to verify identity',
                error: error.message
              });
            });
        },
        
        requestAttestation: (req, res) => {
          const { userPublicKey, attestationType, attestationData } = req.body;
          
          if (!userPublicKey || !attestationType) {
            return res.status(400).json({
              success: false,
              message: 'Missing required parameters',
              error: 'userPublicKey and attestationType are required'
            });
          }
          
          // Mock successful request
          res.status(200).json({
            success: true,
            message: 'Attestation request submitted successfully',
            requestId: 'mocked-request-id'
          });
        }
      };
    };
    
    // Mock dotenv
    const mockDotenv = {
      config: sandbox.stub()
    };
    
    // Mock require statements using proxyquire
    const mockedCore = {
      IdentityRegistry: function() { return mockIdentityRegistry; },
      AttestationManager: function() { return mockAttestationManager; },
      CredentialVerifier: function() { return mockCredentialVerifier; },
      MobileAppApi: mockMobileAppApi
    };
    
    // Mock environment variables
    process.env.ADMIN_SECRET_KEY = 'SADMIN';
    
    // Load app with mocks, but prevent it from calling listen()
    const appModule = proxyquire('../src/api/index', {
      'express': require('express'),
      'stellar-sdk': mockStellarSdk,
      'dotenv': mockDotenv,
      '../core': mockedCore
    });
    
    // Just extract the Express app without the server
    if (typeof appModule.listen === 'function') {
      // It's an Express app
      app = appModule;
    } else if (appModule.app && typeof appModule.app.listen === 'function') {
      // It has an app property
      app = appModule.app;
    } else {
      // Just use it as is
      app = appModule;
    }
    
    // Create supertest request object
    request = supertest(app);
  });
  
  afterEach(function() {
    sandbox.restore();
    delete process.env.ADMIN_SECRET_KEY;
  });
  
  // API Tests
  describe('Health Check', function() {
    it('should return status ok', function() {
      return request
        .get('/health')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('status', 'ok');
        });
    });
  });
  
  describe('Identity Endpoints', function() {
    it('should create an identity', function() {
      const requestBody = {
        seed: 'SUSER',
        identityData: {
          name: 'Test User',
          birthYear: 1990,
          country: 'Test Country',
          type: 'basic-info'
        }
      };
      
      return request
        .post('/api/identity/create')
        .send(requestBody)
        .expect(201)
        .then(res => {
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Identity created successfully');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('identityHash');
          expect(res.body.data).to.have.property('ipfsCid');
        });
    });
    
    it('should verify an identity', function() {
      return request
        .get('/api/identity/verify/GUSER')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('userPublicKey', 'GUSER');
          expect(res.body.data).to.have.property('verified');
          expect(res.body.data).to.have.property('verificationScore');
          expect(res.body.data).to.have.property('attestations').to.be.an('array');
        });
    });
  });
  
  describe('Attestation Endpoints', function() {
    it('should request an attestation', function() {
      const requestBody = {
        userPublicKey: 'GUSER',
        attestationType: 'government-id',
        attestationData: {
          documentType: 'passport',
          issuingCountry: 'Test Country'
        }
      };
      
      return request
        .post('/api/attestation/request')
        .send(requestBody)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Attestation request submitted successfully');
          expect(res.body).to.have.property('requestId');
        });
    });
    
    it('should issue an attestation', function() {
      const requestBody = {
        attesterSeed: 'SATTESTER',
        userPublicKey: 'GUSER',
        identityHash: 'mocked-identity-hash',
        attestationData: {
          type: 'government-id',
          verified: true
        }
      };
      
      return request
        .post('/api/attestation/issue')
        .send(requestBody)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Attestation issued successfully');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('attestationId');
        });
    });
  });
  
  describe('Attester Endpoints', function() {
    it('should register an attester', function() {
      const requestBody = {
        seed: 'SATTESTER',
        attesterInfo: {
          name: 'Test Attester',
          type: 'government-id',
          level: 'official'
        }
      };
      
      return request
        .post('/api/attester/register')
        .send(requestBody)
        .expect(201)
        .then(res => {
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Attester registered successfully');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('attesterPublicKey');
          expect(res.body.data).to.have.property('ipfsCid');
        });
    });
    
    it('should fetch pending attestation requests', function() {
      return request
        .get('/api/attester/pending-requests')
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('pendingRequests').to.be.an('array');
        });
    });
  });
  
  describe('Error Handling', function() {
    it('should return 400 when required parameters are missing', function() {
      return request
        .post('/api/identity/create')
        .send({})
        .expect(400)
        .then(res => {
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message', 'Missing required parameters');
        });
    });
    
    it('should return 500 when attestation issuance fails', function() {
      // Make the attestation issuance fail
      mockAttestationManager.issueAttestation.rejects(new Error('Test error'));
      
      return request
        .post('/api/attestation/issue')
        .send({
          attesterSeed: 'SATTESTER',
          userPublicKey: 'GUSER',
          identityHash: 'mocked-identity-hash',
          attestationData: {
            type: 'government-id',
            verified: true
          }
        })
        .expect(500)
        .then(res => {
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message', 'Failed to issue attestation');
          expect(res.body).to.have.property('error', 'Test error');
        });
    });
  });
});