import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = {
  verifyIdentity: async (publicKey) => {
    try {
      const response = await axios.get(`${API_URL}/api/identity/verify/${publicKey}`);
      return response.data;
    } catch (error) {
      console.error('API error verifying identity:', error);
      throw error;
    }
  },
  
  createIdentity: async (seed, identityData) => {
    try {
      const response = await axios.post(`${API_URL}/api/identity/create`, {
        seed,
        identityData
      });
      return response.data;
    } catch (error) {
      console.error('API error creating identity:', error);
      throw error;
    }
  },
  
  requestAttestation: async (userPublicKey, attestationType, attestationData) => {
    try {
      const response = await axios.post(`${API_URL}/api/attestation/request`, {
        userPublicKey,
        attestationType,
        attestationData
      });
      return response.data;
    } catch (error) {
      console.error('API error requesting attestation:', error);
      throw error;
    }
  }
};

export default api;
