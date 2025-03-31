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
