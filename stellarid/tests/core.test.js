// ===============================================
// Fully Mocked StellarID Test Suite
// ===============================================

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

// Add this at the top of your tests/core.test.js file
// Right after the imports, before the describe blocks:

// Enable mock IPFS test mode explicitly
const { setTestMode } = require('../src/utils/mock-ipfs');
setTestMode(true);

describe('StellarID Core Components', function() {
  // Set up sandbox
  const sandbox = sinon.createSandbox();
  
  // Common mocks
  let mockServer, mockIpfs, mockStellarSdk, mockKeypair;
  let IdentityRegistry, AttestationManager, CredentialVerifier;
  
  beforeEach(function() {
    // Reset sandbox
    sandbox.restore();
    
    // Mock server
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
            { memo_type: 'text', memo: 'IPFS:mocked-ipfs-cid-1' },
            { memo_type: 'text', memo: 'IPFS:mocked-ipfs-cid-2' }
          ]
        })
      })
    };
    
    // Mock IPFS
    mockIpfs = {
      add: sandbox.stub().resolves({
        cid: { toString: () => 'mocked-ipfs-cid' }
      }),
      cat: sandbox.stub().callsFake((cid) => {
        const data = {
          'mocked-ipfs-cid-1': {
            identityHash: 'mocked-identity-hash',
            attestationData: { type: 'basic-info' },
            attestedAt: new Date().toISOString(),
            attesterPublicKey: 'GATTESTER'
          },
          'mocked-ipfs-cid-2': {
            identityHash: 'mocked-identity-hash',
            attestationData: { type: 'government-id' },
            attestedAt: new Date().toISOString(),
            attesterPublicKey: 'GATTESTER'
          },
          'mocked-ipfs-cid': {
            identityHash: 'mocked-identity-hash',
            attestationData: { type: 'basic-info' },
            attestedAt: new Date().toISOString(),
            attesterPublicKey: 'GATTESTER'
          }
        };
        return Promise.resolve(Buffer.from(JSON.stringify(data[cid] || data['mocked-ipfs-cid'])));
      })
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
    
    // Mock keypair
    mockKeypair = {
      adminKeypair: {
        publicKey: () => 'GADMIN',
        secret: () => 'SADMIN',
        sign: sandbox.stub()
      },
      userKeypair: {
        publicKey: () => 'GUSER',
        secret: () => 'SUSER',
        sign: sandbox.stub()
      },
      attesterKeypair: {
        publicKey: () => 'GATTESTER',
        secret: () => 'SATTESTER',
        sign: sandbox.stub()
      },
      randomKeypair: {
        publicKey: () => 'GRANDOM',
        secret: () => 'SRANDOM',
        sign: sandbox.stub()
      }
    };
    
    // Mock StellarSdk
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
        random: sandbox.stub().returns(mockKeypair.randomKeypair),
        fromSecret: sandbox.stub().callsFake((secret) => {
          const keypairs = {
            'SADMIN': mockKeypair.adminKeypair,
            'SUSER': mockKeypair.userKeypair,
            'SATTESTER': mockKeypair.attesterKeypair
          };
          return keypairs[secret] || null;
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
    
    // Create stubs for IPFS creation
    const mockIPFSModule = {
      create: sandbox.stub().returns(mockIpfs)
    };
    
    // Stub crypto for identity hash
    const mockCrypto = {
      createHash: sandbox.stub().returns({
        update: sandbox.stub().returnsThis(),
        digest: sandbox.stub().returns('mocked-identity-hash')
      })
    };
    
    // Stub fetch used by friendbot
    global.fetch = sandbox.stub().resolves({
      ok: true,
      status: 200,
      json: sandbox.stub().resolves({ result: 'success' })
    });
    
    // Use proxyquire to inject our mocks
    const mockedCore = proxyquire('../src/core/index', {
      'stellar-sdk': mockStellarSdk,
      'ipfs-http-client': mockIPFSModule,
      'crypto': mockCrypto
    });
    
    IdentityRegistry = proxyquire('../src/core/IdentityRegistry', {
      './index': mockedCore,
      'stellar-sdk': mockStellarSdk,
      'crypto': mockCrypto
    });
    
    AttestationManager = proxyquire('../src/core/AttestationManager', {
      './index': mockedCore,
      'stellar-sdk': mockStellarSdk
    });
    
    CredentialVerifier = proxyquire('../src/core/CredentialVerifier', {
      './index': mockedCore
    });
  });
  
  afterEach(function() {
    sandbox.restore();
    delete global.fetch;
  });
  
  describe('IdentityRegistry', function() {
    let identityRegistry;
    
    beforeEach(function() {
      identityRegistry = new IdentityRegistry(mockKeypair.adminKeypair);
    });
    
    it('should initialize the Identity Registry successfully', async function() {
      const result = await identityRegistry.initialize();
      
      expect(result).to.have.property('registryAccount');
      expect(result).to.have.property('message', 'Identity Registry initialized successfully');
    });
    
    it('should create an identity successfully', async function() {
      const identityData = {
        name: 'Test User',
        birthYear: 1990,
        country: 'Test Country',
        type: 'basic-info'
      };
      
      const result = await identityRegistry.createIdentity(mockKeypair.userKeypair, identityData);
      
      expect(result).to.have.property('identityHash');
      expect(result).to.have.property('ipfsCid', 'mocked-ipfs-cid');
    });
  });
  
  describe('AttestationManager', function() {
    let attestationManager;
    
    beforeEach(function() {
      attestationManager = new AttestationManager(mockKeypair.adminKeypair);
    });
    
    it('should register an attester successfully', async function() {
      const attesterInfo = {
        name: 'Test Attester',
        type: 'government-id',
        level: 'official'
      };
      
      const result = await attestationManager.registerAttester(
        mockKeypair.attesterKeypair, 
        attesterInfo
      );
      
      expect(result).to.have.property('attesterPublicKey', 'GATTESTER');
      expect(result).to.have.property('ipfsCid', 'mocked-ipfs-cid');
    });
    
    it('should issue an attestation successfully', async function() {
      const identityHash = 'test-identity-hash';
      const attestationData = {
        type: 'government-id',
        verified: true
      };
      
      const result = await attestationManager.issueAttestation(
        mockKeypair.attesterKeypair,
        'GUSER',
        identityHash,
        attestationData
      );
      
      expect(result).to.have.property('result');
      expect(result).to.have.property('attestationId', 'mocked-ipfs-cid');
    });
  });
  
  describe('CredentialVerifier', function() {
    let credentialVerifier;
    
    beforeEach(function() {
      credentialVerifier = new CredentialVerifier();
    });
    
    it('should verify an identity successfully', async function() {
      const result = await credentialVerifier.verifyIdentity('GUSER');
      
      expect(result).to.have.property('userPublicKey', 'GUSER');
      expect(result).to.have.property('verified');
      expect(result).to.have.property('verificationScore');
      expect(result).to.have.property('attestations').with.lengthOf(2);
    });
    
    it('should calculate verification score correctly', function() {
      const attestations = [
        { attestationData: { type: 'basic-info' } },
        { attestationData: { type: 'government-id' } }
      ];
      
      const score = credentialVerifier._calculateVerificationScore(attestations);
      
      // We expect a score of 10 (basic-info) + 30 (government-id) = 40
      expect(score).to.equal(40);
    });
  });
});