// ===============================================
// StellarID Deployment Script
// ===============================================

const StellarSdk = require('stellar-sdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load environment variables
// Update the dotenv configuration line
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Stellar SDK
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Console output helpers
const logStep = (step) => console.log(`\n🚀 ${step}`);
const logSuccess = (message) => console.log(`✅ ${message}`);
const logInfo = (message) => console.log(`ℹ️ ${message}`);
const logWarning = (message) => console.log(`⚠️ ${message}`);
const logError = (message) => console.error(`❌ ${message}`);

/**
 * Create and fund a new Stellar account
 * @param {string} accountName - Name for logging purposes
 * @returns {Object} The keypair for the new account
 */
async function createAndFundAccount(accountName) {
  logStep(`Creating ${accountName} account...`);
  
  // Generate a new keypair
  const keypair = StellarSdk.Keypair.random();
  const publicKey = keypair.publicKey();
  
  logInfo(`Public Key: ${publicKey}`);
  logInfo(`Secret Key: ${keypair.secret()}`);
  
  // Fund the account using Friendbot (testnet only)
  try {
    const response = await axios.get(
      `https://friendbot.stellar.org?addr=${publicKey}`
    );
    
    if (response.status === 200) {
      logSuccess(`${accountName} account funded successfully`);
      
      // Save keypair to a configuration file
      const configPath = path.join(__dirname, 'config', `${accountName.toLowerCase()}.json`);
      fs.writeFileSync(configPath, JSON.stringify({
        publicKey,
        secretKey: keypair.secret()
      }, null, 2));
      
      logInfo(`Keypair saved to ${configPath}`);
    }
  } catch (error) {
    logError(`Failed to fund ${accountName} account: ${error.message}`);
    process.exit(1);
  }
  
  return keypair;
}

/**
 * Create a trustline for an asset
 * @param {Object} sourceKeypair - Source account keypair
 * @param {Object} assetIssuerKeypair - Asset issuer keypair
 * @param {string} assetCode - Asset code
 * @returns {Object} Transaction result
 */
async function createTrustline(sourceKeypair, assetIssuerKeypair, assetCode) {
  logStep(`Creating trustline for ${assetCode}...`);
  
  try {
    const asset = new StellarSdk.Asset(
      assetCode,
      assetIssuerKeypair.publicKey()
    );
    
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset,
          limit: '1000000' // The maximum amount of this asset the account can hold
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(sourceKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    logSuccess(`Trustline for ${assetCode} created successfully`);
    logInfo(`Transaction hash: ${result.hash}`);
    
    return result;
  } catch (error) {
    logError(`Failed to create trustline: ${error.message}`);
    throw error;
  }
}

/**
 * Issue an asset to an account
 * @param {Object} issuerKeypair - Asset issuer keypair
 * @param {string} recipientPublicKey - Recipient's public key
 * @param {string} assetCode - Asset code
 * @param {string} amount - Amount to issue
 * @returns {Object} Transaction result
 */
async function issueAsset(issuerKeypair, recipientPublicKey, assetCode, amount) {
  logStep(`Issuing ${amount} ${assetCode} to ${recipientPublicKey.substring(0, 10)}...`);
  
  try {
    const asset = new StellarSdk.Asset(
      assetCode,
      issuerKeypair.publicKey()
    );
    
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: recipientPublicKey,
          asset,
          amount
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(issuerKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    logSuccess(`${amount} ${assetCode} issued successfully`);
    logInfo(`Transaction hash: ${result.hash}`);
    
    return result;
  } catch (error) {
    logError(`Failed to issue asset: ${error.message}`);
    throw error;
  }
}

/**
 * Deploy the Identity Registry
 * @param {Object} adminKeypair - Admin account keypair
 * @returns {Object} Registry account information
 */
async function deployIdentityRegistry(adminKeypair) {
  logStep('Deploying Identity Registry...');
  
  try {
    // Create a new account for the registry
    const registryKeypair = await createAndFundAccount('IdentityRegistry');
    
    // Create the IDENTITY asset
    const assetCode = 'IDENTITY';
    
    // Create a trustline from the registry to the admin for the IDENTITY asset
    await createTrustline(registryKeypair, adminKeypair, assetCode);
    
    // Set up registry data
    const adminAccount = await server.loadAccount(adminKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: 'StellarID_Registry',
          value: registryKeypair.publicKey()
        })
      )
      .addOperation(
        StellarSdk.Operation.manageData({
          name: 'Registry_Version',
          value: '1.0.0'
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(adminKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    logSuccess('Identity Registry deployed successfully');
    logInfo(`Registry account: ${registryKeypair.publicKey()}`);
    logInfo(`Transaction hash: ${result.hash}`);
    
    return {
      registryKeypair,
      transactionHash: result.hash
    };
  } catch (error) {
    logError(`Failed to deploy Identity Registry: ${error.message}`);
    throw error;
  }
}

/**
 * Deploy the Attestation Manager
 * @param {Object} adminKeypair - Admin account keypair
 * @returns {Object} Attestation manager account information
 */
async function deployAttestationManager(adminKeypair) {
  logStep('Deploying Attestation Manager...');
  
  try {
    // Create a new account for the attestation manager
    const attestationKeypair = await createAndFundAccount('AttestationManager');
    
    // Set up attestation manager data
    const adminAccount = await server.loadAccount(adminKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: 'StellarID_Attestation',
          value: attestationKeypair.publicKey()
        })
      )
      .addOperation(
        StellarSdk.Operation.manageData({
          name: 'Attestation_Version',
          value: '1.0.0'
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(adminKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    logSuccess('Attestation Manager deployed successfully');
    logInfo(`Attestation account: ${attestationKeypair.publicKey()}`);
    logInfo(`Transaction hash: ${result.hash}`);
    
    return {
      attestationKeypair,
      transactionHash: result.hash
    };
  } catch (error) {
    logError(`Failed to deploy Attestation Manager: ${error.message}`);
    throw error;
  }
}

/**
 * Register a sample attester
 * @param {Object} adminKeypair - Admin account keypair
 * @param {Object} attestationManagerKeypair - Attestation manager keypair
 * @returns {Object} Attester account information
 */
async function registerSampleAttester(adminKeypair, attestationManagerKeypair) {
  logStep('Registering sample attester...');
  
  try {
    // Create a new account for the attester
    const attesterKeypair = await createAndFundAccount('SampleAttester');
    
    // Register the attester in the attestation manager
    const managerAccount = await server.loadAccount(
      attestationManagerKeypair.publicKey()
    );
    
    const transaction = new StellarSdk.TransactionBuilder(managerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: `attester-${attesterKeypair.publicKey().substring(0, 10)}`,
          value: 'gov-id-official' // Shortened value to avoid 64-byte limit
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(attestationManagerKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    logSuccess('Sample attester registered successfully');
    logInfo(`Attester account: ${attesterKeypair.publicKey()}`);
    logInfo(`Transaction hash: ${result.hash}`);
    
    // Create the ATTEST asset for the attester
    const assetCode = 'ATTEST';
    
    // First, create a trustline from attester to admin
    await createTrustline(attesterKeypair, adminKeypair, assetCode);
    
    // Then issue some initial ATTEST tokens to the attester
    const issueAmount = '1000';
    await issueAsset(adminKeypair, attesterKeypair.publicKey(), assetCode, issueAmount);
    
    return {
      attesterKeypair,
      transactionHash: result.hash
    };
  } catch (error) {
    logError(`Failed to register sample attester: ${error.message}`);
    throw error;
  }
}

/**
 * Create a sample user account
 * @returns {Object} User account information
 */
async function createSampleUser() {
  logStep('Creating sample user account...');
  
  try {
    // Create a new account for the user
    const userKeypair = await createAndFundAccount('SampleUser');
    
    logSuccess('Sample user created successfully');
    logInfo(`User account: ${userKeypair.publicKey()}`);
    
    return {
      userKeypair
    };
  } catch (error) {
    logError(`Failed to create sample user: ${error.message}`);
    throw error;
  }
}

/**
 * Create the .env file for the project
 * @param {Object} adminKeypair - Admin account keypair
 * @param {Object} registryInfo - Registry account information
 * @param {Object} attestationInfo - Attestation manager account information
 * @param {Object} attesterInfo - Attester account information
 * @param {Object} userInfo - User account information
 */
function createEnvFile(
  adminKeypair,
  registryInfo,
  attestationInfo,
  attesterInfo,
  userInfo
) {
  logStep('Creating .env file...');
  
  const envContent = `
# StellarID Configuration
NETWORK=testnet
HORIZON_URL=https://horizon-testnet.stellar.org

# Admin Account
ADMIN_PUBLIC_KEY=${adminKeypair.publicKey()}
ADMIN_SECRET_KEY=${adminKeypair.secret()}

# Identity Registry
REGISTRY_PUBLIC_KEY=${registryInfo.registryKeypair.publicKey()}
REGISTRY_SECRET_KEY=${registryInfo.registryKeypair.secret()}

# Attestation Manager
ATTESTATION_PUBLIC_KEY=${attestationInfo.attestationKeypair.publicKey()}
ATTESTATION_SECRET_KEY=${attestationInfo.attestationKeypair.secret()}

# Sample Attester
ATTESTER_PUBLIC_KEY=${attesterInfo.attesterKeypair.publicKey()}
ATTESTER_SECRET_KEY=${attesterInfo.attesterKeypair.secret()}

# Sample User
USER_PUBLIC_KEY=${userInfo.userKeypair.publicKey()}
USER_SECRET_KEY=${userInfo.userKeypair.secret()}

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https

# API Server
PORT=3000
JWT_SECRET=your-jwt-secret-key
`;

  // Ensure the config directory exists
  const configDir = path.join(__dirname, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  
  // Write the .env file
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  
  logSuccess('.env file created successfully');
}

/**
 * Verify the deployment by checking account details
 * @param {string} adminPublicKey - Admin public key
 * @param {string} registryPublicKey - Registry public key
 * @param {string} attestationPublicKey - Attestation manager public key
 * @param {string} attesterPublicKey - Attester public key
 * @param {string} userPublicKey - User public key
 */
async function verifyDeployment(
  adminPublicKey,
  registryPublicKey,
  attestationPublicKey,
  attesterPublicKey,
  userPublicKey
) {
  logStep('Verifying deployment...');
  
  try {
    // Check admin account
    const adminAccount = await server.loadAccount(adminPublicKey);
    logInfo(`Admin account verified: ${adminPublicKey}`);
    
    // Check registry account
    const registryAccount = await server.loadAccount(registryPublicKey);
    logInfo(`Registry account verified: ${registryPublicKey}`);
    
    // Check attestation manager account
    const attestationAccount = await server.loadAccount(attestationPublicKey);
    logInfo(`Attestation manager account verified: ${attestationPublicKey}`);
    
    // Check attester account
    const attesterAccount = await server.loadAccount(attesterPublicKey);
    logInfo(`Attester account verified: ${attesterPublicKey}`);
    
    // Check user account
    const userAccount = await server.loadAccount(userPublicKey);
    logInfo(`User account verified: ${userPublicKey}`);
    
    logSuccess('Deployment verification completed successfully');
  } catch (error) {
    logError(`Deployment verification failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main deployment function
 */
async function deploy() {
  try {
    logStep('Starting StellarID deployment to testnet...');
    
    // Create or load admin account
    let adminKeypair;
    const adminConfigPath = path.join(__dirname, 'config', 'admin.json');
    console.log('Checking for admin config at:', adminConfigPath);
    console.log('File exists:', fs.existsSync(adminConfigPath));

    if (fs.existsSync(adminConfigPath)) {
      try {
        const fileContent = fs.readFileSync(adminConfigPath, 'utf8');
        if (!fileContent || fileContent.trim() === '') {
          logWarning('Admin config file exists but is empty. Creating new admin account.');
          adminKeypair = await createAndFundAccount('Admin');
        } else {
          const adminConfig = JSON.parse(fileContent);
          adminKeypair = StellarSdk.Keypair.fromSecret(adminConfig.secretKey);
          logInfo(`Using existing admin account: ${adminKeypair.publicKey()}`);
        }
      } catch (error) {
        logWarning(`Error reading admin config: ${error.message}. Creating new admin account.`);
        adminKeypair = await createAndFundAccount('Admin');
      }
    } else {
      adminKeypair = await createAndFundAccount('Admin');
    }
    
    // Deploy the Identity Registry
    const registryInfo = await deployIdentityRegistry(adminKeypair);
    
    // Deploy the Attestation Manager
    const attestationInfo = await deployAttestationManager(adminKeypair);
    
    // Register a sample attester
    const attesterInfo = await registerSampleAttester(
      adminKeypair,
      attestationInfo.attestationKeypair
    );
    
    // Create a sample user
    const userInfo = await createSampleUser();
    
    // Create the .env file
    createEnvFile(
      adminKeypair,
      registryInfo,
      attestationInfo,
      attesterInfo,
      userInfo
    );
    
    // Verify the deployment
    await verifyDeployment(
      adminKeypair.publicKey(),
      registryInfo.registryKeypair.publicKey(),
      attestationInfo.attestationKeypair.publicKey(),
      attesterInfo.attesterKeypair.publicKey(),
      userInfo.userKeypair.publicKey()
    );
    
    logSuccess('StellarID deployment completed successfully!');
    
    // Print deployment summary
    console.log('\n📝 Deployment Summary:');
    console.log('=============================================');
    console.log(`Admin Account: ${adminKeypair.publicKey()}`);
    console.log(`Identity Registry: ${registryInfo.registryKeypair.publicKey()}`);
    console.log(`Attestation Manager: ${attestationInfo.attestationKeypair.publicKey()}`);
    console.log(`Sample Attester: ${attesterInfo.attesterKeypair.publicKey()}`);
    console.log(`Sample User: ${userInfo.userKeypair.publicKey()}`);
    console.log('=============================================');
    console.log('Configuration saved to .env file and config directory');
    console.log('\nTo view these accounts on Stellar Expert:');
    console.log(`https://testnet.stellar.expert/explorer/testnet/account/${adminKeypair.publicKey()}`);
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment if this file is executed directly
if (require.main === module) {
  deploy();
}

module.exports = {
  deploy,
  createAndFundAccount,
  createTrustline,
  issueAsset,
  deployIdentityRegistry,
  deployAttestationManager,
  registerSampleAttester,
  createSampleUser,
  verifyDeployment
};