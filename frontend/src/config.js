// frontend/src/config.js
// Base URL for API requests
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Stellar network configuration
export const STELLAR_NETWORK = process.env.REACT_APP_STELLAR_NETWORK || 'testnet';

// Return a short version of a Stellar address for display
export const formatStellarAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
};

// Parse JWT token to get expiration date
export const getTokenExpiration = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import axios from 'axios';
import { BASE_URL } from './config';

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;

// Set token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

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