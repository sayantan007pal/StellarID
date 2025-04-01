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
   - For testnet, the account is automatically funded via Friendbot
   - For mainnet, a sponsorship system is used to cover initial account creation costs

3. **Establish basic identity record**
   - User provides minimal initial information:
     - Self-declared name
     - Birth year
     - Country of residence
   - This information is hashed and stored on IPFS
   - A reference to the IPFS content is recorded on the Stellar blockchain
   - The user now has a Level 1 (Self-declared) identity

### 2. Identity Attestation Collection

After establishing a basic identity, users improve their identity verification level by collecting attestations:

1. **Request attestation from verifiers**
   - The mobile app presents available attestation types based on the user's location and identity level
   - User selects an attestation type (e.g., government ID, proof of address, biometric)
   - App guides user through the required documentation for that attestation type

2. **Documentation submission**
   - User captures or uploads required documents
   - Documents are encrypted with the attester's public key
   - Encrypted documents are stored on IPFS
   - A reference to the IPFS content is sent to the attester

3. **Verification process**
   - Attester retrieves and reviews the submitted documents
   - If approved, attester issues an attestation transaction on the Stellar blockchain
   - Transaction includes a reference to the attestation details (stored on IPFS)
   - The attestation is marked as a custom Stellar asset (e.g., "ATTEST")

4. **Identity level progression**
   - Each attestation contributes to the user's overall identity verification score
   - Users progress through identity levels as they collect more attestations:
     - Level 1: Self-declared (0-19 points)
     - Level 2: Partially verified (20-39 points)
     - Level 3: Basic verification (40-59 points)
     - Level 4: Strong verification (60-79 points)
     - Level 5: Full verification (80-100 points)

### 3. Accessing Financial Services

Once a user has built sufficient identity verification, they can access financial services:

1. **Connect to financial service provider**
   - User selects a financial service from within the StellarID app
   - Alternatively, user is redirected to StellarID from a financial service's app

2. **Identity verification request**
   - Financial service requests identity verification at a specific level
   - User reviews the requested information and provides consent

3. **Selective disclosure**
   - User can choose which specific attestations to share
   - Only the minimum required information is disclosed

4. **Verification confirmation**
   - The financial service receives verification that the user's identity meets their requirements
   - User's identity score and relevant attestations are shared (with user consent)
   - Financial service can now onboard the user

## User Experience Flow Diagrams

### Account Creation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Download   │     │  Generate   │     │ Create Basic│     │  Dashboard  │
│    App      │ ──> │  Keypair    │ ──> │  Identity   │ ──> │    View     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Attestation Collection Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │     │   Submit    │     │  Attester   │     │ Attestation │
│ Attestation │ ──> │ Documents   │ ──> │  Verifies   │ ──> │  Received   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                                                           │
       │                                                           ▼
       │                                                    ┌─────────────┐
       │                                                    │   Updated   │
       └────────────────────────────────────────────────── │  Dashboard  │
                                                           └─────────────┘
```

### Financial Service Access Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Select    │     │   Review    │     │  Selective  │     │  Service    │
│   Service   │ ──> │  Request    │ ──> │  Disclosure │ ──> │   Access    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Identity Levels and Permissions

StellarID implements a multi-tier identity system with different levels of verification:

### Level 1: Self-declared (0-19 points)
- **Attestations required:** None (self-declaration only)
- **Permitted financial activities:**
  - Receive payments
  - Make small value payments
  - Basic wallet functionality

### Level 2: Partially verified (20-39 points)
- **Attestations required:** At least one of:
  - Social verification
  - Community vouching
  - Basic address verification
- **Permitted financial activities:**
  - Level 1 activities
  - Higher value payments (with limits)
  - Basic savings accounts

### Level 3: Basic verification (40-59 points)
- **Attestations required:** At least two of:
  - Proof of address
  - Phone number verification
  - Social security or tax ID reference
- **Permitted financial activities:**
  - Level 2 activities
  - Small loans
  - Basic investment products
  - Mobile money services

### Level 4: Strong verification (60-79 points)
- **Attestations required:** Government ID plus at least one of:
  - Proof of address
  - Biometric verification
  - Employment verification
- **Permitted financial activities:**
  - Level 3 activities
  - Larger loans
  - Full banking services
  - Investment accounts

### Level 5: Full verification (80-100 points)
- **Attestations required:** Government ID plus at least two of:
  - Biometric verification
  - Proof of address
  - Employment verification
  - Financial history
- **Permitted financial activities:**
  - All financial services
  - Unlimited transactions
  - Premium financial products
  - Cross-border services

## Privacy and Security Considerations

StellarID is designed with privacy and security as core principles:

### Data Minimization
- Only essential information is collected
- Users control what information is shared
- Information is shared on a need-to-know basis

### Data Encryption
- All personal documents are encrypted before storage
- Only authorized attesters can decrypt relevant documents
- Encryption uses industry-standard protocols

### Key Security
- Secret keys never leave the user's device
- Biometric authentication for key access
- Backup mechanisms for key recovery

### Consent Management
- Explicit user consent required for all data sharing
- Granular permission control for attestation sharing
- Ability to revoke permissions at any time

### Immutable Audit Trail
- All identity transactions are recorded on the blockchain
- Users can review all attestations and data sharing events
- Tamper-proof record of consent and verification

## Special Considerations for Vulnerable Populations

StellarID is designed to be accessible to vulnerable populations:

### Refugees and Displaced Persons
- Ability to build identity without requiring government documentation
- Progressive identity building starting with NGO attestations
- Multiple verification pathways accommodating different documentation situations

### Low Literacy Users
- Voice guidance throughout the application
- Visual cues and minimal text
- Tutorial videos embedded in the app

### Limited Connectivity Areas
- Offline functionality for document collection
- Minimal data transmission requirements
- Queue system for syncing when connectivity is available

### Persons with Disabilities
- Screen reader compatibility
- Voice control options
- High contrast modes and adjustable text sizes

## Implementation for Different Regions

StellarID adapts to regional requirements and standards:

### North America and Europe
- Integration with government eID systems where available
- Compliance with GDPR and similar privacy regulations
- Integration with banking KYC requirements

### Africa
- Focus on mobile money integration
- Support for feature phones with USSD interface
- Offline verification capabilities

### Southeast Asia
- Integration with national ID systems
- Support for local attestation authorities
- Mobile-first approach

### Latin America
- Support for cooperative financial institutions
- Community-based verification networks
- Integration with existing microfinance infrastructure

## Future Identity Evolution

StellarID roadmap for identity capabilities:

### Zero-Knowledge Proofs
- Allow users to prove attributes without revealing the underlying data
- Example: Prove age over 18 without revealing birthdate

### Cross-Chain Identity
- Support for identity portability across different blockchain networks
- Integration with other decentralized identity standards

### AI-Assisted Verification
- Machine learning to assist human attesters
- Automated document verification for certain attestation types

### Decentralized Reputation
- Reputation scores based on financial behavior
- Opt-in credit scoring alternatives

## Educational Resources

StellarID includes built-in educational resources:

- Interactive tutorials on identity security
- Financial literacy modules
- Privacy protection guides
- Blockchain technology explanations

These resources help users understand the value of their digital identity and how to protect it.