# StellarID: Decentralized Identity for Financial Inclusion

<img width="1352" alt="Screenshot 2025-04-01 at 12 05 05 PM" src="https://github.com/user-attachments/assets/a68b8d00-cf67-4a57-bc45-3117d7ffb09b" />
<img width="1352" alt="Screenshot 2025-04-01 at 12 20 20 PM" src="https://github.com/user-attachments/assets/37c59228-df43-4085-ad40-141a694620d8" />
<img width="1352" alt="Screenshot 2025-04-01 at 12 20 31 PM" src="https://github.com/user-attachments/assets/a2c279d8-d028-4e8f-927b-aa35aa27235b" />




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

StellarID leverages the Stellar blockchain's unique features to create a secure, decentralized identity system:

### Blockchain Layer
- **Custom Assets for Credentials**: Using Stellar's asset issuance functionality to create tamper-proof credential tokens
- **Attestation Registry**: A decentralized registry of trusted attesters using Stellar's smart contract capabilities
- **Claimable Balances**: Using Stellar's claimable balances feature for conditional credential issuance
- **Multi-signature Accounts**: For creating governance structures around credential validation

### Application Layer
- **Mobile App**: A React Native application for users to manage their digital identities
- **Attester Portal**: Web interface for attesters to review and issue credentials
- **API Server**: Backend services connecting the application with the Stellar blockchain
- **IPFS Integration**: For storing encrypted identity documents off-chain

## 🛠️ Technical Implementation

### Smart Contracts on Stellar

StellarID utilizes Stellar's Turing Signing Servers (TSS) for implementing the identity registry and attestation management logic. The smart contracts handle:

1. Identity creation and registration
2. Credential issuance and verification
3. Attestation management
4. Privacy-preserving disclosures

### Mobile Application

The mobile application is built with React Native, providing a cross-platform solution that works on both Android and iOS devices. Key features of the app include:

1. Secure key management using device-level encryption
2. QR code scanning for identity verification
3. Offline capability for use in areas with limited connectivity
4. Step-by-step guidance for building identity credentials
5. Simple interface for requesting attestations

### Backend Services

The backend API server provides:

1. Integration with the Stellar blockchain
2. IPFS document storage and retrieval
3. Attestation request management
4. Identity verification services for third parties

## 📋 Project Justification

StellarID addresses the "Better Access" track by focusing on identity solutions that increase accessibility and inclusion in the financial system. The project:

1. **Removes Barriers**: Enables individuals without traditional documentation to establish trusted digital identities
2. **Promotes Inclusion**: Creates pathways for the unbanked to access financial services
3. **Empowers Users**: Gives individuals control over their identity and privacy
4. **Builds Trust**: Creates a network of verifiable credentials through trusted attesters


## 💻 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- React Native environment
- Stellar SDK
- IPFS client

### Setting Up the Project

1. Clone the repository:
   ```
   git clone https://github.com/sayantan007pal/StellarID.git
   cd StellarID
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
5. Run all tests:
   ```
   NODE_ENV=test npm test
   ```

6. Start the API server:
   ```
   npm run dev
   ```

7. Run the web app:

   ```
   cd stellarid/web-client
   sudo npm run build
   serve -s build

   ```
7. Run the mobile app:
   ```
   cd stellarid/src/mobile
   npm start
   
   ```

## 🧪 Testing

The project includes comprehensive test suites for all components:

1. Run backend core tests:
   ```
   npm install --save-dev proxyquire
   npm run test:core
   ```
2. Run backend api tests:
   ```
   npm install --save-dev supertest
   npm run test:api
   ```
3. Run backend integration tests:
   ```
   npm install --save-dev proxyquire
   ```
   ```
   ADMIN_SECRET_KEY=get from stellarid/deploy/.env
   ```
   ```
   RUN_INTEGRATION_TESTS=1 npm run test:integration
   ```

   ```
  StellarID Blockchain Integration
  Skipping integration tests. To run them, use:
  
  ```
  RUN_INTEGRATION_TESTS=1 ADMIN_SECRET_KEY=<your-key> npm run test:integration

   ```
Stellar Account Operations
      - should be able to create and fund a Stellar account
      - should be able to add a data entry to an account
      - should be able to make a payment between accounts
      - should be able to add a memo to a transaction

2. Run smart contract tests:
   ```
   npm run test:contracts
   ```

3. Run mobile app tests:
   ```
   npm run test:app
   ```

## 📚 API Documentation

API documentation is available at [https://api.stellarid.io/docs](https://api.stellarid.io/docs) (demo link) and also in the `/docs` folder of this repository.

## 🔍 Use Cases

### 1. Refugee Identity

Refugees who have lost their documentation can build a new digital identity through a network of trusted attesters, including NGOs, camp administrators, and international organizations.

### 2. Rural Banking Access

Individuals in rural areas without access to traditional banking infrastructure can build a digital identity to access microfinance services, mobile banking, and digital payments.

### 3. Informal Economy Workers

Workers in the informal economy can build verifiable employment histories and financial credentials to access credit and other financial services.

## 🌐 Deployed Contract Links

- Identity Registry: [View on Stellar Expert](https://testnet.stellar.expert/explorer/testnet/contract/CAAXXXXX)
- Attestation Manager: [View on Stellar Expert](https://testnet.stellar.expert/explorer/testnet/contract/CBBXXXXX)

## 📊 Project Status

StellarID is currently in the prototype phase with:

- ✅ Core identity registry implemented
- ✅ Attestation management system
- ✅ Mobile application prototype
- ✅ API server for blockchain integration
- 🚧 Attester portal (in progress)
- 🚧 Production deployment (planned)

## 🚀 Future Development

Our roadmap for future development includes:

1. **Expanded Attestation Network**: Onboarding more trusted attesters across different regions
2. **Enhanced Privacy Features**: Zero-knowledge proofs for selective disclosure
3. **Integration with Financial Services**: API integration with microfinance providers and mobile money services
4. **Offline Identity Verification**: Capability to verify identity credentials without internet connectivity
5. **Cross-Chain Compatibility**: Interoperability with other blockchain identity solutions

## 👥 Team Experience

Our team has extensive experience with Stellar development:

- Implemented financial inclusion solutions using Stellar in 3 countries
- Contributed to open-source Stellar projects
- Participated in multiple Stellar hackathons
- Active members of the Stellar development community

## 📞 Contact Information

- Github: [github.com/stellarid](https://github.com/stellarid)
- Email: team@stellarid.io
- Twitter: [@StellarID_io](https://twitter.com/StellarID_io)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*StellarID - Building bridges to financial inclusion through decentralized identity.*
