// backend/src/controllers/stellar.controller.js
const User = require('../models/user.model');
const StellarSdk = require('stellar-sdk');
const axios = require('axios');

// Configure Stellar SDK for testnet or public network
const server = process.env.STELLAR_NETWORK === 'testnet' 
  ? new StellarSdk.Server('https://horizon-testnet.stellar.org')
  : new StellarSdk.Server('https://horizon.stellar.org');
const networkPassphrase = process.env.STELLAR_NETWORK === 'testnet'
  ? StellarSdk.Networks.TESTNET
  : StellarSdk.Networks.PUBLIC;

exports.getAccountInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's Stellar keys
    const user = await User.findById(userId).select('+stellarSecretKey');
    if (!user || !user.stellarPublicKey) {
      return res.status(404).json({
        success: false,
        message: 'Stellar account not found for this user'
      });
    }
    
    try {
      // Fetch account details from Stellar network
      const account = await server.loadAccount(user.stellarPublicKey);
      
      // Format the response
      const response = {
        publicKey: user.stellarPublicKey,
        balances: account.balances.map(balance => ({
          asset_type: balance.asset_type,
          asset_code: balance.asset_code,
          asset_issuer: balance.asset_issuer,
          balance: balance.balance
        })),
        sequence: account.sequence,
        subentry_count: account.subentry_count,
        last_modified_ledger: account.last_modified_ledger
      };
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (stellarError) {
      // If account is not found on the Stellar network, return what we know
      if (stellarError.response && stellarError.response.status === 404) {
        return res.status(200).json({
          success: true,
          data: {
            publicKey: user.stellarPublicKey,
            exists: false,
            message: 'Account exists locally but not yet created on Stellar network'
          }
        });
      }
      throw stellarError;
    }
  } catch (error) {
    console.error('Get account info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving Stellar account information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.fundTestnetAccount = async (req, res) => {
  try {
    // Only available on testnet
    if (process.env.STELLAR_NETWORK !== 'testnet') {
      return res.status(400).json({
        success: false,
        message: 'This operation is only available on the Stellar testnet'
      });
    }
    
    const userId = req.user.userId;
    
    // Get user's Stellar public key
    const user = await User.findById(userId);
    if (!user || !user.stellarPublicKey) {
      return res.status(404).json({
        success: false,
        message: 'Stellar account not found for this user'
      });
    }
    
    // Use Friendbot to fund the account on testnet
    try {
      const response = await axios.get(`https://friendbot.stellar.org?addr=${user.stellarPublicKey}`);
      
      res.status(200).json({
        success: true,
        data: {
          message: 'Account funded successfully on testnet',
          transaction: response.data
        }
      });
    } catch (fundingError) {
      console.error('Friendbot funding error:', fundingError);
      return res.status(500).json({
        success: false,
        message: 'Error funding account with Friendbot',
        error: process.env.NODE_ENV === 'development' ? 
          (fundingError.response ? fundingError.response.data : fundingError.message) : 
          undefined
      });
    }
  } catch (error) {
    console.error('Fund testnet account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error funding testnet account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assetCode, assetType, memo } = req.body;
    
    if (!assetCode) {
      return res.status(400).json({
        success: false,
        message: 'Asset code is required'
      });
    }
    
    // Get user's Stellar keys
    const user = await User.findById(userId).select('+stellarSecretKey');
    if (!user || !user.stellarPublicKey || !user.stellarSecretKey) {
      return res.status(404).json({
        success: false,
        message: 'Stellar account not found for this user'
      });
    }
    
    // Load issuer account// Load the issuer account
const issuerAccount = await server.loadAccount(issuerPublicKey);

// Build a transaction
const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase
})
  .addOperation(StellarSdk.Operation.payment({
    destination: recipientPublicKey,
    asset: asset,
    amount: '1'  // Typically a symbolic amount
  }))
  .setTimeout(30)
  .addMemo(StellarSdk.Memo.text('Identity Attestation'));

// Sign and submit
const sourceKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey);
const builtTx = transaction.build();
builtTx.sign(sourceKeypair);

const result = await server.submitTransaction(builtTx);
    
    res.status(201).json({
      success: true,
      data: {
        assetCode,
        assetIssuer: user.stellarPublicKey,
        assetType: assetType || 'identity',
        transaction: result
      }
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Stellar asset',
      error: process.env.NODE_ENV === 'development' ? 
        (error.response ? error.response.data : error.message) : 
        undefined
    });
  }
};

exports.createTrustline = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { assetCode, assetIssuer, limit } = req.body;
    
    if (!assetCode || !assetIssuer) {
      return res.status(400).json({
        success: false,
        message: 'Asset code and issuer are required'
      });
    }
    
    // Get user's Stellar keys
    const user = await User.findById(userId).select('+stellarSecretKey');
    if (!user || !user.stellarPublicKey || !user.stellarSecretKey) {
      return res.status(404).json({
        success: false,
        message: 'Stellar account not found for this user'
      });
    }
    
    // Load user account
    const account = await server.loadAccount(user.stellarPublicKey);
    
    // Create asset instance
    const asset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    // Build transaction to create trustline
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset,
        limit: limit || '1000000000' // Default high limit
      }))
      .setTimeout(30)
      .addMemo(StellarSdk.Memo.text('StellarID Create Trustline'));
    
    // Sign and submit transaction
    const sourceKeypair = StellarSdk.Keypair.fromSecret(user.stellarSecretKey);
    const builtTx = transaction.build();
    builtTx.sign(sourceKeypair);
    
    const result = await server.submitTransaction(builtTx);
    
    res.status(201).json({
      success: true,
      data: {
        assetCode,
        assetIssuer,
        transaction: result
      }
    });
  } catch (error) {
    console.error('Create trustline error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trustline',
      error: process.env.NODE_ENV === 'development' ? 
        (error.response ? error.response.data : error.message) : 
        undefined
    });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's Stellar public key
    const user = await User.findById(userId);
    if (!user || !user.stellarPublicKey) {
      return res.status(404).json({
        success: false,
        message: 'Stellar account not found for this user'
      });
    }
    
    // Load account to get balances (which include assets)
    const account = await server.loadAccount(user.stellarPublicKey);
    
    // Extract assets from balances
    const assets = account.balances
      .filter(balance => balance.asset_type !== 'native')
      .map(balance => ({
        asset_code: balance.asset_code,
        asset_issuer: balance.asset_issuer,
        balance: balance.balance,
        limit: balance.limit
      }));
    
    // Include native XLM balance
    const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
    
    res.status(200).json({
      success: true,
      data: {
        assets,
        nativeBalance: xlmBalance ? xlmBalance.balance : '0'
      }
    });
  } catch (error) {
    // If account not found on network, return empty assets
    if (error.response && error.response.status === 404) {
      return res.status(200).json({
        success: true,
        data: {
          assets: [],
          nativeBalance: '0',
          message: 'Account not yet created on Stellar network'
        }
      });
    }
    
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, cursor } = req.query;
    
    // Get user's Stellar public key
    const user = await User.findById(userId);
    if (!user || !user.stellarPublicKey) {
      return res.status(404).json({
        success: false,
        message: 'Stellar account not found for this user'
      });
    }
    
    // Set up transaction query
    let transactionQuery = server.transactions()
      .forAccount(user.stellarPublicKey)
      .limit(limit);
    
    // Add cursor if provided
    if (cursor) {
      transactionQuery = transactionQuery.cursor(cursor);
    }
    
    // Execute query
    const transactions = await transactionQuery.call();
    
    res.status(200).json({
      success: true,
      data: {
        transactions: transactions.records,
        next: transactions.next,
        prev: transactions.prev
      }
    });
  } catch (error) {
    // If account not found on network, return empty transactions
    if (error.response && error.response.status === 404) {
      return res.status(200).json({
        success: true,
        data: {
          transactions: [],
          message: 'Account not yet created on Stellar network'
        }
      });
    }
    
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};