// ===============================================
// StellarID Test Suite
// ===============================================

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const StellarSdk = require('stellar-sdk');
const { 
  IdentityRegistry, 
  AttestationManager,
  CredentialVerifier
} = require('../src/core');

// Configure chai
chai.use(chaiAsPromised);
const expect = chai.expect;

// Mock the Stellar SDK and IPFS client
const mockServer = {
  loadAccount: sinon.stub(),
  submitTransaction: sinon.stub(),
  transactions: sinon.stub()
};

const mockIpfs = {
  add: sinon.stub(),
  cat: sinon.stub()
};

// Mock the StellarSdk global to use our mocks
global.StellarSdk = {
  Server: function() {
    return mockServer;
  },
  TransactionBuilder: sinon.stub(),
  Operation: {
    changeTrust: sinon.stub(),
    payment: sinon.stub(),
    manageData: sinon.stub(),
    createClaimableBalance: sinon.stub()
  },
  Asset: sinon.stub(),
  Keypair: {
    random: sinon.stub(),
    fromSecret: sinon.stub()
  },
  Memo: {
    text: sinon.stub()
  },
  Claimant: {
    predicateUnconditional: sinon.stub()
  },
  Networks: {
    TESTNET: 'Test SDF Network ; September 2015'
  },
  BASE_FEE: '100'
};

// Mock the IPFS client
global.IPFS = {
  create: function() {
    return mockIpfs;
  }
};

describe('StellarID Core Components', function() {
  let adminKeypair;
  let userKeypair;
  let attesterKeypair;
  let transaction;
  
  beforeEach(function() {
    // Reset all stubs
    sinon.reset();
    
    // Create mock keypairs
    adminKeypair = {
      publicKey: () => 'GADMIN',
      secret: () => 'SADMIN',
      sign: sinon.stub()
    };
    
    userKeypair = {
      publicKey: () => 'GUSER',
      secret: () => 'SUSER',
      sign: sinon.stub()
    };
    
    attesterKeypair = {
      publicKey: () => 'GATTESTER',
      secret: () => 'SATTESTER',
      sign: sinon.stub()
    };
    
    // Mock random keypair
    StellarSdk.Keypair.random.returns({
      publicKey: () => 'GRANDOM',
      secret: () => 'SRANDOM',
      sign: sinon.stub()
    });
    
    // Mock fromSecret
    StellarSdk.Keypair.fromSecret.callsFake((secret) => {
      if (secret === 'SADMIN') return adminKeypair;
      if (secret === 'SUSER') return userKeypair;
      if (secret === 'SATTESTER') return attesterKeypair;
      return null;
    });
    
    // Mock loadAccount
    mockServer.loadAccount.resolves({
      accountId: 'GADMIN',
      sequence: '123'
    });
    
    // Mock transaction
    transaction = {
      sign: sinon.stub(),
      hash: 'mocked-transaction-hash'
    };
    
    // Mock TransactionBuilder
    StellarSdk.TransactionBuilder.returns({
      addOperation: sinon.stub().returnsThis(),
      addMemo: sinon.stub().returnsThis(),
      setTimeout: sinon.stub().returnsThis(),
      build: sinon.stub().returns(transaction)
    });
    
    // Mock submitTransaction
    mockServer.submitTransaction.resolves({
      hash: 'mocked-transaction-hash'
    });
    
    // Mock transactions
    mockServer.transactions.returns({
      forAccount: sinon.stub().returnsThis(),
      call: sinon.stub().resolves({
        records: []
      })
    });
    
    // Mock IPFS add
    mockIpfs.add.resolves({
      cid: {
        toString: () => 'mocked-ipfs-cid'
      }
    });
    
    // Mock IPFS cat
    mockIpfs.cat.resolves(Buffer.from(JSON.stringify({
      identityHash: 'mocked-identity-hash',
      attestationData: {
        type: 'basic-info'
      },
      attestedAt: new Date().toISOString(),
      attesterPublicKey: 'GATTESTER'
    })));
  });
  
  describe('IdentityRegistry', function() {
    let identityRegistry;
    
    beforeEach(function() {
      identityRegistry = new IdentityRegistry(adminKeypair);
    });
    
    describe('initialize', function() {
      it('should initialize the Identity Registry successfully', async function() {
        const result = await identityRegistry.initialize();
        
        expect(result).to.have.property('registryAccount');
        expect(result).to.have.property('message', 'Identity Registry initialized successfully');
        
        // Verify that the correct operations were performed
        expect(mockServer.loadAccount.calledOnce).to.be.true;
        expect(StellarSdk.Operation.changeTrust.calledOnce).to.be.true;
        expect(mockServer.submitTransaction.calledOnce).to.be.true;
      });
      
      it('should handle errors during initialization', async function() {
        // Make the submitTransaction call fail
        mockServer.submitTransaction.rejects(new Error('Test error'));
        
        await expect(identityRegistry.initialize()).to.be.rejectedWith('Test error');
      });
    });
    
    describe('createIdentity', function() {
      it('should create an identity successfully', async function() {
        const identityData = {
          name: 'Test User',
          birthYear: 1990,
          country: 'Test Country',
          type: 'basic-info'
        };
        
        const result = await identityRegistry.createIdentity(userKeypair, identityData);
        
        expect(result).to.have.property('result');
        expect(result).to.have.property('identityHash');
        expect(result).to.have.property('ipfsCid', 'mocked-ipfs-cid');
        
        // Verify that the correct operations were performed
        expect(mockIpfs.add.calledOnce).to.be.true;
        expect(mockServer.loadAccount.calledOnce).to.be.true;
        expect(StellarSdk.Operation.createClaimableBalance.calledOnce).to.be.true;
        expect(StellarSdk.Memo.text.calledOnce).to.be.true;
        expect(mockServer.submitTransaction.calledOnce).to.be.true;
      });
      
      it('should handle errors during identity creation', async function() {
        // Make the IPFS add call fail
        mockIpfs.add.rejects(new Error('Test error'));
        
        const identityData = {
          name: 'Test User',
          birthYear: 1990,
          country: 'Test Country',
          type: 'basic-info'
        };
        
        await expect(identityRegistry.createIdentity(userKeypair, identityData))
          .to.be.rejectedWith('Test error');
      });
    });
  });
  
  describe('AttestationManager', function() {
    let attestationManager;
    
    beforeEach(function() {
      attestationManager = new AttestationManager(adminKeypair);
    });
    
    describe('registerAttester', function() {
      it('should register an attester successfully', async function() {
        const attesterInfo = {
          name: 'Test Attester',
          type: 'government-id',
          level: 'official'
        };
        
        const result = await attestationManager.registerAttester(attesterKeypair, attesterInfo);
        
        expect(result).to.have.property('result');
        expect(result).to.have.property('attesterPublicKey', 'GATTESTER');
        expect(result).to.have.property('ipfsCid', 'mocked-ipfs-cid');
        
        // Verify that the correct operations were performed
        expect(mockIpfs.add.calledOnce).to.be.true;
        expect(mockServer.loadAccount.calledOnce).to.be.true;
        expect(StellarSdk.Operation.manageData.calledOnce).to.be.true;
        expect(mockServer.submitTransaction.calledOnce).to.be.true;
      });
      
      it('should handle errors during attester registration', async function() {
        // Make the IPFS add call fail
        mockIpfs.add.rejects(new Error('Test error'));
        
        const attesterInfo = {
          name: 'Test Attester',
          type: 'government-id',
          level: 'official'
        };
        
        await expect(attestationManager.registerAttester(attesterKeypair, attesterInfo))
          .to.be.rejectedWith('Test error');
      });
    });
    
    describe('issueAttestation', function() {
      it('should issue an attestation successfully', async function() {
        const identityHash = 'test-identity-hash';
        const attestationData = {
          type: 'government-id',
          verified: true
        };
        
        const result = await attestationManager.issueAttestation(
          attesterKeypair,
          userKeypair.publicKey(),
          identityHash,
          attestationData
        );
        
        expect(result).to.have.property('result');
        expect(result).to.have.property('attestationId', 'mocked-ipfs-cid');
        
        // Verify that the correct operations were performed
        expect(mockIpfs.add.calledOnce).to.be.true;
        expect(mockServer.loadAccount.calledOnce).to.be.true;
        expect(StellarSdk.Operation.payment.calledOnce).to.be.true;
        expect(StellarSdk.Memo.text.calledOnce).to.be.true;
        expect(mockServer.submitTransaction.calledOnce).to.be.true;
      });
      
      it('should handle errors during attestation issuance', async function() {
        // Make the IPFS add call fail
        mockIpfs.add.rejects(new Error('Test error'));
        
        const identityHash = 'test-identity-hash';
        const attestationData = {
          type: 'government-id',
          verified: true
        };
        
        await expect(attestationManager.issueAttestation(
          attesterKeypair,
          userKeypair.publicKey(),
          identityHash,
          attestationData
        )).to.be.rejectedWith('Test error');
      });
    });
  });
  
  describe('CredentialVerifier', function() {
    let credentialVerifier;
    
    beforeEach(function() {
      credentialVerifier = new CredentialVerifier();
      
      // Mock transaction records with attestations
      mockServer.transactions().forAccount().call.resolves({
        records: [
          {
            memo_type: 'text',
            memo: 'IPFS:mocked-ipfs-cid-1'
          },
          {
            memo_type: 'text',
            memo: 'IPFS:mocked-ipfs-cid-2'
          }
        ]
      });
    });
    
    describe('verifyIdentity', function() {
      it('should verify an identity successfully', async function() {
        // Set up IPFS responses for different CIDs
        mockIpfs.cat.callsFake((cid) => {
          if (cid === 'mocked-ipfs-cid-1') {
            return Promise.resolve(Buffer.from(JSON.stringify({
              identityHash: 'mocked-identity-hash',
              attestationData: {
                type: 'basic-info'
              },
              attestedAt: new Date().toISOString(),
              attesterPublicKey: 'GATTESTER'
            })));
          } else {
            return Promise.resolve(Buffer.from(JSON.stringify({
              identityHash: 'mocked-identity-hash',
              attestationData: {
                type: 'government-id'
              },
              attestedAt: new Date().toISOString(),
              attesterPublicKey: 'GATTESTER'
            })));
          }
        });
        
        const result = await credentialVerifier.verifyIdentity(userKeypair.publicKey());
        
        expect(result).to.have.property('userPublicKey', 'GUSER');
        expect(result).to.have.property('verified');
        expect(result).to.have.property('verificationScore');
        expect(result).to.have.property('attestations').with.lengthOf(2);
        
        // Verify that the correct operations were performed
        expect(mockServer.transactions().forAccount().call.calledOnce).to.be.true;
        expect(mockIpfs.cat.calledTwice).to.be.true;
      });
      
      it('should return zero score when no attestations are found', async function() {
        // Clear the mocked transaction records
        mockServer.transactions().forAccount().call.resolves({
          records: []
        });
        
        const result = await credentialVerifier.verifyIdentity(userKeypair.publicKey());
        
        expect(result).to.have.property('userPublicKey', 'GUSER');
        expect(result).to.have.property('verified', false);
        expect(result).to.have.property('verificationScore', 0);
        expect(result).to.have.property('attestations').with.lengthOf(0);
      });
      
      it('should handle errors during identity verification', async function() {
        // Make the transactions call fail
        mockServer.transactions().forAccount().call.rejects(new Error('Test error'));
        
        await expect(credentialVerifier.verifyIdentity(userKeypair.publicKey()))
          .to.be.rejectedWith('Test error');
      });
    });
    
    describe('_calculateVerificationScore', function() {
      it('should calculate the verification score correctly based on attestation types', function() {
        const attestations = [
          {
            attestationData: {
              type: 'basic-info'
            }
          },
          {
            attestationData: {
              type: 'government-id'
            }
          }
        ];
        
        const score = credentialVerifier._calculateVerificationScore(attestations);
        
        // We expect a score of 10 (basic-info) + 30 (government-id) = 40
        expect(score).to.equal(40);
      });
      
      it('should return 0 for empty attestations', function() {
        const score = credentialVerifier._calculateVerificationScore([]);
        expect(score).to.equal(0);
      });
      
      it('should cap the score at 100', function() {
        const attestations = [
          { attestationData: { type: 'basic-info' } },
          { attestationData: { type: 'government-id' } },
          { attestationData: { type: 'proof-of-address' } },
          { attestationData: { type: 'biometric' } },
          { attestationData: { type: 'social-verification' } },
          { attestationData: { type: 'unknown-type' } }
        ];
        
        const score = credentialVerifier._calculateVerificationScore(attestations);
        
        // The sum would be 105, but it should be capped at 100
        expect(score).to.equal(100);
      });
    });
  });
});