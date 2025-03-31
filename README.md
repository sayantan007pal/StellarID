
# StellarID: Decentralized Identity for Financial Inclusion

StellarID is a decentralized identity solution built on the Stellar blockchain that addresses one of the fundamental barriers to financial inclusion. It enables individuals without traditional documentation to establish verifiable digital identities, allowing the unbanked and underserved populations to progressively build financial credibility through a network of trusted attesters.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technical Architecture](#technical-architecture)
4. [Setup Instructions](#setup-instructions)
5. [Development Environment](#development-environment)
6. [API Documentation](#api-documentation)
7. [User Guide](#user-guide)
8. [Stellar Blockchain Integration](#stellar-blockchain-integration)
9. [Future Improvements](#future-improvements)

## Project Overview

StellarID solves a critical problem: approximately 1 billion people worldwide lack official identification, preventing them from accessing basic financial services. The platform creates a pathway to trusted digital identity that can be built progressively through various attestations and verifications, without requiring traditional documentation.

## Key Features

1. **Progressive Identity Building**: Users start with minimal information and gradually build verifiable credentials through various attestation sources.
2. **Multi-tier Verification System**: Different levels of identity verification to accommodate various user situations.
3. **Privacy-Preserving Credentials**: Selective disclosure of identity attributes using cryptographic techniques.
4. **Mobile-First Design**: Optimized for smartphones with offline capability for areas with limited connectivity.
5. **Integration Framework**: APIs for financial services providers to verify identities with user consent.
6. **Blockchain-based Trust**: Leverages Stellar's blockchain for secure, transparent, and immutable identity records.

## Technical Architecture

The StellarID platform consists of the following key components:

1. **User Interface Layer**: Web and mobile interfaces for users to create and manage their digital identities.
2. **Application Layer**: Backend services that handle identity management, attestations, and verifications.
3. **Stellar Blockchain Layer**: Integration with the Stellar blockchain for creating immutable identity records.
4. **External Integration Layer**: APIs and services for integration with financial institutions and attesters.

## Setup Instructions

### Prerequisites

- Node.js (v14.x or later)
- MongoDB (v4.4 or later)
- Stellar account (for development)

### Local Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/stellarid.git
   cd stellarid
   ```

2. Install dependencies
   ```
   npm run install-all
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stellarid
   JWT_SECRET=your_jwt_secret
   STELLAR_NETWORK=testnet
   CORS_ORIGIN=http://localhost:3000
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Production Deployment

For production deployment, additional steps are required:

1. Build the frontend
   ```
   cd frontend
   npm run build
   ```

2. Set up secure environment variables in your production environment.

3. Start the server
   ```
   npm start
   ```

## Development Environment

The project is set up with a complete development environment:

- Backend: Node.js with Express
- Frontend: React with Material-UI
- Database: MongoDB
- Blockchain: Stellar SDK

### Project Structure

```
stellarid/
├── backend/
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   ├── config.js      # Configuration
│   │   └── server.js      # Entry point
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main component
│   │   ├── index.js       # Entry point
│   │   └── config.js      # Configuration
├── .env                   # Environment variables
├── package.json           # Project dependencies
└── README.md              # Documentation
```

## API Documentation

The StellarID API provides endpoints for managing identities, attestations, and verifications.

### Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Identity API

- `POST /api/identities`: Create a new identity
- `GET /api/identities`: Retrieve user's identity
- `PUT /api/identities`: Update identity profile
- `POST /api/identities/documents`: Upload identity documents
- `GET /api/identities/verification-status`: Check verification status
- `POST /api/identities/challenge-response`: Verify identity challenge

### Attestation API

- `POST /api/attestations`: Create a new attestation
- `GET /api/attestations/received`: Get attestations received by the user
- `GET /api/attestations/issued`: Get attestations issued by the attester
- `GET /api/attestations/:id`: Get attestation details
- `PUT /api/attestations/:id/revoke`: Revoke an attestation

### Verification API

- `POST /api/verifications/request`: Request identity verification
- `GET /api/verifications/requested`: Get verification requests made
- `GET /api/verifications/received`: Get verification requests received
- `GET /api/verifications/:id`: Get verification details
- `POST /api/verifications/:id/consent`: Provide consent for verification
- `DELETE /api/verifications/:id/consent`: Revoke consent for verification

### Stellar API

- `GET /api/stellar/account`: Get Stellar account information
- `POST /api/stellar/fund-testnet`: Fund testnet account
- `POST /api/stellar/create-asset`: Create custom asset
- `POST /api/stellar/create-trustline`: Create trustline
- `GET /api/stellar/assets`: Get account assets
- `GET /api/stellar/transactions`: Get account transactions

## User Guide

### Getting Started

1. **Create an Account**:
   - Sign up with a username and password
   - A new Stellar account is automatically created for you

2. **Build Your Identity Profile**:
   - Fill in your personal information
   - The more information you provide, the higher your identity tier can become

3. **Get Attestations**:
   - Connect with trusted attesters who can verify aspects of your identity
   - Attesters create blockchain-based verification records

4. **Respond to Verification Requests**:
   - Financial institutions can request to verify specific parts of your identity
   - You control which information to share through consent management

### Identity Tiers

StellarID uses a tier-based approach to identity verification:

1. **Tier 0 (Basic)**: Initial identity with minimal verification
2. **Tier 1 (Standard)**: Identity with basic personal information verified
3. **Tier 2 (Enhanced)**: Identity with full profile and multiple attestations
4. **Tier 3 (Premium)**: Fully verified identity with official document verification

Each tier requires more verified information and attestations, providing a pathway to progressively build a trusted identity.

## Stellar Blockchain Integration

StellarID leverages Stellar blockchain in several innovative ways:

### Custom Assets for Credentials

Each attestation is represented by a custom asset on the Stellar blockchain. These assets serve as tamper-proof credential tokens that verify specific attributes of a user's identity.

```javascript
// Example of creating a custom asset for an attestation
const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
```

### Attestation Registry

A decentralized registry of trusted attesters is implemented using Stellar's capabilities. This registry ensures that only authorized entities can issue valid attestations.

### Claimable Balances

Stellar's claimable balances feature is used for conditional credential issuance. This allows for sophisticated verification flows where credentials are only issued when specific conditions are met.

```javascript
// Example of creating a claimable balance with conditions
transaction.addOperation(
  StellarSdk.Operation.createClaimableBalance({
    asset: asset,
    amount: '1',
    claimants: [
      new StellarSdk.Claimant(
        recipientPublicKey,
        StellarSdk.Claimant.predicateBeforeRelativeTime('86400')
      )
    ]
  })
);
```

### Multi-signature Accounts

For creating governance structures around credential validation, Stellar's multi-signature accounts are utilized. This provides an additional layer of security and trust for high-value attestations.

## Future Improvements

Future development of StellarID will focus on:

1. **Biometric Integration**: Adding support for biometric verification methods
2. **Zero-Knowledge Proofs**: Implementing more advanced privacy-preserving techniques
3. **Cross-Chain Compatibility**: Enabling identity verification across multiple blockchain networks
4. **AI-Based Verification**: Utilizing AI for document verification and fraud detection
5. **Decentralized Governance**: Creating a DAO for managing the attestation registry
6. **Mobile App Development**: Building dedicated mobile applications for Android and iOS
7. **Offline Functionality**: Enhancing offline capabilities for areas with limited connectivity

## Contributing

Contributions to StellarID are welcome! Please refer to our contributing guidelines for more information on how to get involved.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 StellarID Project. All rights reserved.
