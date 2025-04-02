// ===============================================
// StellarID Integration Test Suite
// ===============================================

const chai = require('chai');
const expect = chai.expect;
const StellarSdk = require('stellar-sdk');
const axios = require('axios');

// Set up test server configuration
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

describe('StellarID Blockchain Integration', function() {
  // Increase timeout for blockchain operations
  this.timeout(30000);
  
  let server;
  let adminKeypair;
  let testKeypair;
  
  before(async function() {
    // Check for both RUN_INTEGRATION_TESTS and ADMIN_SECRET_KEY
    if (!process.env.RUN_INTEGRATION_TESTS || !process.env.ADMIN_SECRET_KEY) {
      console.log('Skipping integration tests. To run them, use:');
      console.log('RUN_INTEGRATION_TESTS=1 ADMIN_SECRET_KEY=<your-key> npm run test:integration');
      this.skip();
      return;
    }
    
    console.log('Setting up Stellar integration test environment...');
    
    try {
      // Connect to Stellar testnet
      server = new StellarSdk.Server(HORIZON_URL);
      
      adminKeypair = StellarSdk.Keypair.fromSecret(process.env.ADMIN_SECRET_KEY);
      console.log('Admin account:', adminKeypair.publicKey());
      
      // Create test account
      testKeypair = StellarSdk.Keypair.random();
      console.log('Test account:', testKeypair.publicKey());
      
      // Fund test account using friendbot
      await fundAccount(testKeypair.publicKey());
      console.log('Test account funded successfully');
      
    } catch (error) {
      console.error('Failed to set up integration tests:', error);
      throw error;
    }
  });
  
  describe('Stellar Account Operations', function() {
    it('should be able to create and fund a Stellar account', async function() {
      // This test is already satisfied by the setup
      // We just verify the account exists on the testnet
      
      const account = await server.loadAccount(testKeypair.publicKey());
      
      expect(account.accountId()).to.equal(testKeypair.publicKey());
      expect(account.balances).to.have.length.above(0);
      expect(account.balances[0].balance).to.be.a('string');
      
      // Log the balance
      console.log(`Account balance: ${account.balances[0].balance} XLM`);
    });
    
    it('should be able to add a data entry to an account', async function() {
      // Add a data entry to the account
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(testKeypair.publicKey()),
        { 
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET
        }
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: 'StellarID_Test',
            value: 'Integration Test'
          })
        )
        .setTimeout(30)
        .build();
      
      transaction.sign(testKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      expect(result).to.have.property('hash');
      console.log('Data entry added, transaction hash:', result.hash);
      
      // Verify the data entry was added
      const updatedAccount = await server.loadAccount(testKeypair.publicKey());
      expect(updatedAccount.data_attr).to.have.property('StellarID_Test');
      
      // Log the data value (it's base64 encoded)
      const encodedValue = updatedAccount.data_attr['StellarID_Test'];
      const decodedValue = Buffer.from(encodedValue, 'base64').toString('utf-8');
      console.log('Data entry value:', decodedValue);
      expect(decodedValue).to.equal('Integration Test');
    });
    
    it('should be able to make a payment between accounts', async function() {
      // Create another test account
      const recipientKeypair = StellarSdk.Keypair.random();
      console.log('Recipient account:', recipientKeypair.publicKey());
      
      // Fund the recipient account
      await fundAccount(recipientKeypair.publicKey());
      
      // Make a payment from testKeypair to recipientKeypair
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(testKeypair.publicKey()),
        { 
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET
        }
      )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: recipientKeypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: '10.0000000'
          })
        )
        .setTimeout(30)
        .build();
      
      transaction.sign(testKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      expect(result).to.have.property('hash');
      console.log('Payment made, transaction hash:', result.hash);
      
      // Verify the payment was received
      const recipientAccount = await server.loadAccount(recipientKeypair.publicKey());
      const balance = recipientAccount.balances.find(b => b.asset_type === 'native').balance;
      console.log(`Recipient balance: ${balance} XLM`);
      
      // Balance should be greater than 10 (the initial funding plus our payment)
      const balanceNum = parseFloat(balance);
      expect(balanceNum).to.be.above(10);
    });
    
    it('should be able to add a memo to a transaction', async function() {
      // Create a transaction with a memo
      const transaction = new StellarSdk.TransactionBuilder(
        await server.loadAccount(testKeypair.publicKey()),
        { 
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET
        }
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: 'Test_Memo',
            value: 'With Memo'
          })
        )
        .addMemo(StellarSdk.Memo.text('IPFS:test-cid'))
        .setTimeout(30)
        .build();
      
      transaction.sign(testKeypair);
      
      const result = await server.submitTransaction(transaction);
      
      expect(result).to.have.property('hash');
      console.log('Transaction with memo submitted, hash:', result.hash);
      
      // Get the transaction details to verify the memo
      const tx = await server.transactions().transaction(result.hash).call();
      expect(tx).to.have.property('memo');
      expect(tx.memo_type).to.equal('text');
      expect(tx.memo).to.equal('IPFS:test-cid');
      
      console.log('Transaction memo verified:', tx.memo);
    });
  });
  
  // Helper function to fund a Stellar account using friendbot
  async function fundAccount(publicKey) {
    try {
      const response = await axios.get(
        `https://friendbot.stellar.org?addr=${publicKey}`
      );
      
      if (response.status !== 200) {
        throw new Error(`Failed to fund account: ${response.statusText}`);
      }
      
      // Wait a moment for the funding transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return true;
    } catch (error) {
      console.error(`Error funding account ${publicKey}:`, error.message);
      throw error;
    }
  }
});