#!/bin/bash

# StellarID Project Setup Script
# This script creates the directory structure and placeholder files for the StellarID project

# Set color variables for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to create directory with message
create_directory() {
    mkdir -p "$1"
    echo -e "${BLUE}Created directory:${NC} $1"
}

# Function to create an empty file with message
create_file() {
    touch "$1"
    echo -e "${GREEN}Created file:${NC} $1"
}

# Function to write content to a file
write_to_file() {
    echo "$2" > "$1"
    echo -e "${GREEN}Added content to:${NC} $1"
}

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Main script
echo -e "${BLUE}Starting StellarID project setup...${NC}"

# Create project root directory
PROJECT_NAME="stellarid"
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${RED}Directory $PROJECT_NAME already exists. Please remove it or choose another name.${NC}"
    exit 1
fi

create_directory "$PROJECT_NAME"
cd "$PROJECT_NAME" || handle_error "Could not change directory to $PROJECT_NAME"

# Create root files
echo "Creating root files..."

# Create README.md
cat > "README.md" << 'EOL'
# StellarID: Decentralized Identity for Financial Inclusion

![StellarID Logo](./docs/images/stellarid-logo.png)

StellarID is a decentralized identity solution built on the Stellar blockchain that enables individuals without traditional documentation to establish verifiable digital identities. This project aims to address one of the fundamental barriers to financial inclusion by providing a pathway for the unbanked and underserved populations to access financial services.

## 🌟 Project Overview

According to the World Bank, approximately 1 billion people globally lack official identification, making it impossible for them to access basic financial services. StellarID tackles this challenge by creating a self-sovereign identity platform where individuals can progressively build their digital identity through a network of trusted attesters.

### Core Features

- **Progressive Identity Building**: Users start with minimal information and gradually build verifiable credentials
- **Multi-tier Verification System**: Different levels of identity verification to accommodate various user situations
- **Privacy-Preserving Credentials**: Selective disclosure of identity attributes using cryptographic techniques
- **Mobile-First Design**: Optimized for smartphones with offline capability for areas with limited connectivity
- **Integration Framework**: APIs for financial services providers to verify identities with user consent

## 🚀 Technical Architecture

StellarID leverages the Stellar blockchain's unique features to create a secure, decentralized identity system.

For full documentation, see the [docs](./docs) directory.

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- React Native environment
- Stellar SDK
- IPFS client

### Setting Up the Project

1. Clone the repository:
   ```
   git clone https://github.com/stellarid/stellarid.git
   cd stellarid
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Deploy the smart contracts to Stellar testnet:
   ```
   npm run deploy:testnet
   ```

5. Start the API server:
   ```
   npm run server
   ```

6. Run the mobile app:
   ```
   npm run mobile:start
   ```

## 📚 Documentation

See the [docs](./docs) directory for comprehensive documentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*StellarID - Building bridges to financial inclusion through decentralized identity.*
EOL
echo -e "${GREEN}Created README.md with content${NC}"

# Create LICENSE (MIT)
cat > "LICENSE" << 'EOL'
MIT License

Copyright (c) 2025 StellarID Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOL
echo -e "${GREEN}Created LICENSE with MIT license${NC}"

# Create package.json
cat > "package.json" << 'EOL'
{
  "name": "stellarid",
  "version": "1.0.0",
  "description": "A decentralized identity solution built on the Stellar blockchain for financial inclusion",
  "main": "src/api/index.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/stellarid/stellarid.git"
  },
  "scripts": {
    "start": "node src/api/index.js",
    "dev": "nodemon src/api/index.js",
    "deploy:testnet": "node deploy/index.js",
    "test": "mocha tests/**/*.test.js",
    "test:api": "mocha tests/api.test.js",
    "test:core": "mocha tests/core.test.js",
    "test:integration": "mocha tests/integration.test.js",
    "mobile:start": "cd src/mobile && expo start",
    "mobile:android": "cd src/mobile && expo start --android",
    "mobile:ios": "cd src/mobile && expo start --ios",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write 'src/**/*.js'",
    "docs": "jsdoc -c jsdoc.json"
  },
  "keywords": [
    "stellar",
    "blockchain",
    "identity",
    "decentralized",
    "financial-inclusion"
  ],
  "author": "StellarID Team <team@stellarid.io>",
  "license": "MIT",
  "dependencies": {
    "axios": "^0.24.0",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "helmet": "^4.6.0",
    "ipfs-http-client": "^52.0.3",
    "jsonwebtoken": "^8.5.1",
    "morgan": "^1.10.0",
    "stellar-sdk": "^10.0.0",
    "winston": "^3.3.3"
  },
  "devDependencies": {
    "chai": "^4.3.4",
    "chai-as-promised": "^7.1.1",
    "eslint": "^8.2.0",
    "jsdoc": "^3.6.7",
    "mocha": "^9.1.3",
    "nodemon": "^2.0.15",
    "prettier": "^2.4.1",
    "sinon": "^12.0.1",
    "supertest": "^6.1.6"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOL
echo -e "${GREEN}Created package.json with dependencies${NC}"

# Create .env.example
cat > ".env.example" << 'EOL'
# StellarID Configuration
NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org

# Admin Account
ADMIN_PUBLIC_KEY=GADMIN...
ADMIN_SECRET_KEY=SADMIN...

# Identity Registry
REGISTRY_PUBLIC_KEY=GREGISTRY...
REGISTRY_SECRET_KEY=SREGISTRY...

# Attestation Manager
ATTESTATION_PUBLIC_KEY=GATTESTATION...
ATTESTATION_SECRET_KEY=SATTESTATION...

# Sample Attester
ATTESTER_PUBLIC_KEY=GATTESTER...
ATTESTER_SECRET_KEY=SATTESTER...

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https

# API Server
PORT=3000
JWT_SECRET=your-jwt-secret-key

# Mobile App
EXPO_PUBLIC_API_URL=http://localhost:3000
EOL
echo -e "${GREEN}Created .env.example${NC}"

# Create .gitignore
cat > ".gitignore" << 'EOL'
# Node modules
node_modules/

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Build files
dist/
build/
*.tgz

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Deployment configs
deploy/config/*.json
!deploy/config/example.json

# Testing
coverage/
.nyc_output/

# IDEs and editors
.idea/
.vscode/
*.swp
*.swo
.DS_Store
*.sublime-project
*.sublime-workspace

# Mobile app specific
src/mobile/.expo
src/mobile/node_modules/
src/mobile/npm-debug.*
src/mobile/*.jks
src/mobile/*.p8
src/mobile/*.p12
src/mobile/*.key
src/mobile/*.mobileprovision
src/mobile/*.orig.*
src/mobile/web-build/

# Temporary files
tmp/
temp/

# Debug files
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local Netlify folder
.netlify
EOL
echo -e "${GREEN}Created .gitignore${NC}"

# Create directory structure
echo "Creating directory structure..."

# src directory
create_directory "src"

# Core directory and files
create_directory "src/core"
cat > "src/core/index.js" << 'EOL'
// ===============================================
// StellarID Core Modules - Entry Point
// ===============================================

const IdentityRegistry = require('./IdentityRegistry');
const AttestationManager = require('./AttestationManager');
const CredentialVerifier = require('./CredentialVerifier');

module.exports = {
  IdentityRegistry,
  AttestationManager,
  CredentialVerifier
};
EOL
echo -e "${GREEN}Created src/core/index.js with content${NC}"

cat > "src/core/IdentityRegistry.js" << 'EOL'
// ===============================================
// Identity Registry Implementation
// ===============================================

const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');
const IPFS = require('ipfs-http-client');

// Configure IPFS for document storage
const ipfs = IPFS.create({
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'https'
});

class IdentityRegistry {
  constructor(adminKeypair) {
    this.adminKeypair = adminKeypair;
    this.server = new StellarSdk.Server(process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org');
    this.networkPassphrase = process.env.NETWORK === 'mainnet' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET;
  }

  /**
   * Initialize the Identity Registry
   * Creates a new account that will serve as the registry
   */
  async initialize() {
    // Implementation will go here
    console.log('Initializing Identity Registry');
  }

  /**
   * Create a new identity on the Stellar blockchain
   * @param {Object} userKeypair - User's Stellar keypair
   * @param {Object} identityData - Basic identity information
   * @returns {Object} Transaction result and identity hash
   */
  async createIdentity(userKeypair, identityData) {
    // Implementation will go here
    console.log('Creating identity for user', userKeypair.publicKey());
  }

  // Additional methods will be implemented here
}

module.exports = IdentityRegistry;
EOL
echo -e "${GREEN}Created src/core/IdentityRegistry.js with basic implementation${NC}"

cat > "src/core/AttestationManager.js" << 'EOL'
// ===============================================
// Attestation Manager Implementation
// ===============================================

const StellarSdk = require('stellar-sdk');
const IPFS = require('ipfs-http-client');

// Configure IPFS for document storage
const ipfs = IPFS.create({
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'https'
});

class AttestationManager {
  constructor(adminKeypair) {
    this.adminKeypair = adminKeypair;
    this.server = new StellarSdk.Server(process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org');
    this.networkPassphrase = process.env.NETWORK === 'mainnet' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET;
  }

  /**
   * Register a new attester on the network
   * @param {Object} attesterKeypair - Attester's Stellar keypair
   * @param {Object} attesterInfo - Information about the attester
   * @returns {Object} Transaction result
   */
  async registerAttester(attesterKeypair, attesterInfo) {
    // Implementation will go here
    console.log('Registering attester', attesterKeypair.publicKey());
  }

  /**
   * Issue an attestation for a user's identity
   * @param {Object} attesterKeypair - Attester's Stellar keypair
   * @param {String} userPublicKey - User's public key
   * @param {String} identityHash - Hash of the user's identity
   * @param {Object} attestationData - Data to be attested
   * @returns {Object} Transaction result
   */
  async issueAttestation(attesterKeypair, userPublicKey, identityHash, attestationData) {
    // Implementation will go here
    console.log('Issuing attestation for user', userPublicKey);
  }

  // Additional methods will be implemented here
}

module.exports = AttestationManager;
EOL
echo -e "${GREEN}Created src/core/AttestationManager.js with basic implementation${NC}"

cat > "src/core/CredentialVerifier.js" << 'EOL'
// ===============================================
// Credential Verifier Implementation
// ===============================================

const StellarSdk = require('stellar-sdk');
const IPFS = require('ipfs-http-client');

// Configure IPFS for document storage
const ipfs = IPFS.create({
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'https'
});

class CredentialVerifier {
  constructor() {
    this.server = new StellarSdk.Server(process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org');
    this.networkPassphrase = process.env.NETWORK === 'mainnet' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET;
  }

  /**
   * Verify a user's identity and credentials
   * @param {String} userPublicKey - User's public key
   * @returns {Object} Verification result with confidence score
   */
  async verifyIdentity(userPublicKey) {
    // Implementation will go here
    console.log('Verifying identity for user', userPublicKey);
  }

  /**
   * Calculate a verification score based on attestations
   * @param {Array} attestations - List of attestations
   * @returns {Number} Verification score (0-100)
   */
  _calculateVerificationScore(attestations) {
    // Implementation will go here
    console.log('Calculating verification score');
    return 0;
  }

  // Additional methods will be implemented here
}

module.exports = CredentialVerifier;
EOL
echo -e "${GREEN}Created src/core/CredentialVerifier.js with basic implementation${NC}"

# API directory and files
create_directory "src/api"
cat > "src/api/index.js" << 'EOL'
// ===============================================
// StellarID API Server - Entry Point
// ===============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const identityRoutes = require('./routes/identity');
const attestationRoutes = require('./routes/attestation');
const attesterRoutes = require('./routes/attester');

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Apply routes
app.use('/api/identity', identityRoutes);
app.use('/api/attestation', attestationRoutes);
app.use('/api/attester', attesterRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
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

// ===============================================
// Server Initialization
// ===============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`StellarID API server running on port ${PORT}`);
});

module.exports = app;
EOL
echo -e "${GREEN}Created src/api/index.js with server implementation${NC}"

create_directory "src/api/routes"
create_file "src/api/routes/identity.js"
create_file "src/api/routes/attestation.js"
create_file "src/api/routes/attester.js"

create_directory "src/api/middleware"
create_file "src/api/middleware/auth.js"
create_file "src/api/middleware/validation.js"

create_directory "src/api/controllers"
create_file "src/api/controllers/identity.js"
create_file "src/api/controllers/attestation.js"
create_file "src/api/controllers/attester.js"

# Mobile directory and files
create_directory "src/mobile"
create_file "src/mobile/App.js"
create_file "src/mobile/babel.config.js"
cat > "src/mobile/app.json" << 'EOL'
{
  "expo": {
    "name": "StellarID",
    "slug": "stellarid",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "io.stellarid.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "io.stellarid.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOL
echo -e "${GREEN}Created src/mobile/app.json with Expo configuration${NC}"

# Create mobile package.json
cat > "src/mobile/package.json" << 'EOL'
{
  "name": "stellarid-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.17.11",
    "axios": "^0.24.0",
    "expo": "~47.0.0",
    "expo-camera": "~13.1.0",
    "expo-document-picker": "~11.0.1",
    "expo-local-authentication": "~13.0.2",
    "expo-status-bar": "~1.4.2",
    "react": "18.1.0",
    "react-native": "0.70.5",
    "stellar-sdk": "^10.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.19.3"
  },
  "private": true
}
EOL
echo -e "${GREEN}Created src/mobile/package.json${NC}"

create_directory "src/mobile/assets"
create_directory "src/mobile/assets/icons"
# Placeholder for logo file
touch "src/mobile/assets/logo.png"
echo -e "${GREEN}Created placeholder for logo.png${NC}"

create_directory "src/mobile/components"
create_file "src/mobile/components/IdentityCard.js"
create_file "src/mobile/components/AttestationItem.js"
create_file "src/mobile/components/ActionButton.js"

create_directory "src/mobile/screens"
create_file "src/mobile/screens/WelcomeScreen.js"
create_file "src/mobile/screens/CreateIdentityScreen.js"
create_file "src/mobile/screens/DashboardScreen.js"
create_file "src/mobile/screens/AttestationScreen.js"

# Utils directory and files
create_directory "src/utils"
create_file "src/utils/stellar.js"
create_file "src/utils/ipfs.js"
create_file "src/utils/crypto.js"

# Deploy directory and files
create_directory "deploy"
cat > "deploy/index.js" << 'EOL'
// ===============================================
// StellarID Deployment Script
// ===============================================

const StellarSdk = require('stellar-sdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize Stellar SDK
const server = new StellarSdk.Server(process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org');
const networkPassphrase = process.env.NETWORK === 'mainnet' 
  ? StellarSdk.Networks.PUBLIC 
  : StellarSdk.Networks.TESTNET;

// Main deployment function
async function deploy() {
  try {
    console.log('Starting StellarID deployment to testnet...');
    
    // Deployment steps will go here
    console.log('StellarID deployment completed successfully!');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the deployment if this file is executed directly
if (require.main === module) {
  deploy();
}

module.exports = { deploy };
EOL
echo -e "${GREEN}Created deploy/index.js with basic deployment script${NC}"

create_file "deploy/testnet.js"
create_directory "deploy/config"
create_file "deploy/config/admin.json"

# Tests directory and files
create_directory "tests"
create_file "tests/core.test.js"
create_file "tests/api.test.js"
create_file "tests/integration.test.js"

# Docs directory and files
create_directory "docs"
cat > "docs/api.md" << 'EOL'
# StellarID API Documentation

This document provides comprehensive documentation for the StellarID API, which enables third-party applications to integrate with the StellarID identity system.

## Base URL

```
https://api.stellarid.io/v1
```

For testnet:
```
https://testnet-api.stellarid.io/v1
```

## Authentication

All API requests must include an API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

To obtain an API key, please contact the StellarID team.

## Response Format

All responses are returned in JSON format with the following structure:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

In case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

[See full documentation for endpoints and integration examples]
EOL
echo -e "${GREEN}Created docs/api.md with API documentation${NC}"

cat > "docs/identity-flow.md" << 'EOL'
# StellarID Identity Flow Documentation

This document explains the complete user journey for creating and building a digital identity with StellarID, from initial registration to accessing financial services.

## Identity Creation Process

The StellarID identity system is designed with progressive identity building in mind, allowing users to start with minimal information and gradually build a more complete digital identity as they collect attestations.

### 1. Initial Account Creation

When a user first interacts with StellarID, they go through the following steps:

1. **Download the StellarID mobile application**
   - Available on iOS and Android app stores
   - Optimized for low-end devices with minimal storage requirements

2. **Create a new Stellar account**
   - A new Stellar keypair is generated on the device
   - The public key becomes the user's unique identifier
   - The secret key is securely stored on the device using platform-specific security features

[See full documentation for the complete identity flow]
EOL
echo -e "${GREEN}Created docs/identity-flow.md with identity flow documentation${NC}"

create_file "docs/attestation-flow.md"
create_directory "docs/images"
create_file "docs/images/architecture.png"
create_file "docs/images/user-flow.png"

# Demo directory and files
create_directory "demo"
create_file "demo/video.mp4"
cat > "demo/video-script.md" << 'EOL'
# StellarID Demo Video Script

## Introduction (0:00 - 0:30)

[Opening slide with StellarID logo]

**Voice-over:** "Welcome to StellarID, a decentralized identity solution built on the Stellar blockchain. Today, we'll demonstrate how StellarID enables individuals without traditional documentation to establish verifiable digital identities and gain access to financial services."

[Transition to presenter]

**Presenter:** "According to the World Bank, approximately 1 billion people globally lack official identification, making it impossible for them to access basic financial services. StellarID addresses this challenge by creating a self-sovereign identity platform where individuals can progressively build their digital identity through a network of trusted attesters."

[Continue with full demo script]
EOL
echo -e "${GREEN}Created demo/video-script.md with video script${NC}"

create_file "demo/slides.pdf"

echo -e "${BLUE}Project structure creation completed.${NC}"
echo -e "${GREEN}StellarID project has been set up successfully in the ${PROJECT_NAME} directory.${NC}"
echo -e "Run the following commands to get started:"
echo -e "${BLUE}cd ${PROJECT_NAME}${NC}"
echo -e "${BLUE}npm install${NC}"
echo -e "${BLUE}cp .env.example .env${NC}"
echo -e "${BLUE}npm run dev${NC}"

exit 0