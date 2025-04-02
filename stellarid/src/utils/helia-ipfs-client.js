// ===============================================
// Helia IPFS Client Utility
// ===============================================

const { createHelia } = require('helia');
const { unixfs } = require('@helia/unixfs');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string');

/**
 * Creates a Helia IPFS client that provides a compatible interface
 * with the original ipfs-http-client that was used in the project.
 * 
 * @returns {Object} A Helia IPFS client with a compatible interface
 */
async function createCompatibleIpfsClient() {
  try {
    // Create Helia instance
    const helia = await createHelia();
    
    // Create UnixFS interface for file operations
    const fs = unixfs(helia);
    
    // Create a compatible interface
    return {
      // Compatible add function that returns { cid: { toString: () => string } }
      add: async (content) => {
        // Convert content to string if it's not already
        let stringContent = typeof content === 'string' ? content : JSON.stringify(content);
        
        // Convert string to Uint8Array
        const bytes = uint8ArrayFromString(stringContent);
        
        // Add to IPFS and get CID
        const cid = await fs.addBytes(bytes);
        
        // Return in a format compatible with old ipfs-http-client
        return {
          cid: {
            toString: () => cid.toString()
          }
        };
      },
      
      // Compatible cat function that returns Buffer
      cat: async (cidString) => {
        try {
          // Create iterable for reading the file
          const chunks = [];
          for await (const chunk of fs.cat(cidString)) {
            chunks.push(chunk);
          }
          
          // Concatenate all chunks
          const allChunks = new Uint8Array(
            chunks.reduce((acc, chunk) => acc + chunk.length, 0)
          );
          
          let offset = 0;
          for (const chunk of chunks) {
            allChunks.set(chunk, offset);
            offset += chunk.length;
          }
          
          // Convert to string and then to Buffer to match original API
          const str = uint8ArrayToString(allChunks);
          return Buffer.from(str);
        } catch (error) {
          console.error(`Error retrieving content for CID ${cidString}:`, error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Failed to create Helia IPFS client:', error);
    throw error;
  }
}

/**
 * Create a mock IPFS client for testing purposes
 * 
 * @returns {Object} A mock IPFS client with the same interface
 */
function createMockIpfsClient() {
  return {
    add: async (content) => {
      // Generate a predictable CID based on content
      const mockCid = `mock-${Date.now()}-${typeof content === 'string' ? content.substring(0, 10) : 'object'}`;
      
      return {
        cid: {
          toString: () => mockCid
        }
      };
    },
    
    cat: async (cidString) => {
      // Create some mock data based on the CID
      const mockData = {
        identityHash: 'mock-identity-hash',
        attestationData: {
          type: cidString.includes('government') ? 'government-id' : 'basic-info'
        },
        attestedAt: new Date().toISOString(),
        attesterPublicKey: 'MOCK_ATTESTER_KEY'
      };
      
      return Buffer.from(JSON.stringify(mockData));
    }
  };
}

/**
 * Factory function to create the appropriate IPFS client
 * based on the environment
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.mock - Whether to use a mock client
 * @returns {Promise<Object>} The IPFS client instance
 */
async function createIpfsClient(options = {}) {
  if (options.mock || process.env.NODE_ENV === 'test') {
    console.log('Using mock IPFS client');
    return createMockIpfsClient();
  }
  
  console.log('Creating Helia IPFS client');
  return await createCompatibleIpfsClient();
}

module.exports = {
  createIpfsClient,
  createMockIpfsClient,
  createCompatibleIpfsClient
};