// ===============================================
// Mock IPFS Implementation
// ===============================================

/**
 * A fully self-contained mock IPFS client that doesn't depend on external packages
 */
class MockIpfs {
    constructor() {
      this.storage = new Map();
      // Use global or module variable from below
      this.isTestMode = global.__TEST_MODE__ === true;
      console.log('Mock IPFS initialized' + (this.isTestMode ? ' in test mode' : ''));
    }
  
    async add(content) {
      // In test mode, always return the expected CID
      if (this.isTestMode) {
        return {
          cid: {
            toString: () => 'mocked-ipfs-cid'
          }
        };
      }
      
      // For non-test mode, generate a somewhat unique CID
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const timestamp = Date.now().toString();
      const mockCid = `mock-${timestamp.substring(timestamp.length - 6)}-${contentStr.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`;
      
      // Store the content in memory
      this.storage.set(mockCid, contentStr);
      
      // Return object with the same structure as real IPFS response
      return {
        cid: {
          toString: () => mockCid
        }
      };
    }
  
    async cat(cid) {
      // For tests or known mock CIDs
      if (cid === 'mocked-ipfs-cid' || cid === 'mocked-ipfs-cid-1' || cid === 'mocked-ipfs-cid-2') {
        // Return test data matching the expected format
        const mockData = {
          identityHash: 'mocked-identity-hash',
          attestationData: { 
            type: cid.includes('2') ? 'government-id' : 'basic-info' 
          },
          attestedAt: new Date().toISOString(),
          attesterPublicKey: 'GATTESTER'
        };
        
        return Buffer.from(JSON.stringify(mockData));
      }
      
      // Retrieve content from memory if it exists
      if (this.storage.has(cid)) {
        return Buffer.from(this.storage.get(cid));
      }
      
      // For CIDs that weren't created in this session, generate mock data
      const mockData = {
        identityHash: 'mock-identity-hash',
        attestationData: { 
          type: cid.includes('government') ? 'government-id' : 'basic-info' 
        },
        attestedAt: new Date().toISOString(),
        attesterPublicKey: 'MOCK_ATTESTER'
      };
      
      return Buffer.from(JSON.stringify(mockData));
    }
  }
  
  // Set global test mode flag based on environment variable
  if (process.env.NODE_ENV === 'test') {
    global.__TEST_MODE__ = true;
    console.log('Setting global test mode flag for MockIPFS');
  }
  
  /**
   * Create a mock IPFS client
   * @returns {Object} A mock IPFS client
   */
  function createMockIpfs() {
    return new MockIpfs();
  }
  
  module.exports = {
    createMockIpfs,
    // Helper function to explicitly set test mode (for core tests)
    setTestMode: (isTest = true) => {
      global.__TEST_MODE__ = isTest;
      console.log(`Mock IPFS test mode ${isTest ? 'enabled' : 'disabled'}`);
    }
  };