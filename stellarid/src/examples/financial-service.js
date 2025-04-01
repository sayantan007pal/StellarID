// ===============================================
// StellarID Financial Service Integration Example
// ===============================================

// This example demonstrates how a financial service provider can integrate
// with StellarID to verify user identities before providing financial services.

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const config = {
  stellarIdApi: process.env.STELLAR_ID_API || 'https://testnet-api.stellarid.io/v1',
  apiKey: process.env.STELLAR_ID_API_KEY,
  clientId: process.env.STELLAR_ID_CLIENT_ID,
  clientSecret: process.env.STELLAR_ID_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/callback',
  jwtSecret: process.env.JWT_SECRET,
  minVerificationScore: 60 // Minimum verification score required for financial services
};

// ===============================================
// Routes
// ===============================================

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>Micro-Finance Provider Example</h1>
    <p>This is an example integration of a financial service with StellarID.</p>
    <a href="/login">Login with StellarID</a>
  `);
});

// Initiate StellarID authentication
app.get('/login', (req, res) => {
  // Generate a random state parameter to prevent CSRF attacks
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store the state in the session (in a real app, this would use session middleware)
  // For this example, we'll just set a cookie
  res.cookie('stellarid_state', state, { httpOnly: true });
  
  // Redirect to StellarID authorization endpoint
  const authUrl = `https://auth.stellarid.io/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}&scope=identity`;
  
  res.redirect(authUrl);
});

// Handle the callback from StellarID
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify the state parameter to prevent CSRF attacks
  // In a real app, this would use session middleware
  const storedState = req.cookies.stellarid_state;
  
  if (state !== storedState) {
    return res.status(400).send('Invalid state parameter');
  }
  
  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post('https://auth.stellarid.io/token', {
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri
    });
    
    const { access_token, token_type, expires_in, refresh_token } = tokenResponse.data;
    
    // Use the access token to get the user's identity information
    const identityResponse = await axios.get(`${config.stellarIdApi}/identity/me`, {
      headers: {
        Authorization: `${token_type} ${access_token}`
      }
    });
    
    const userIdentity = identityResponse.data.data;
    
    // Check if the user's verification score meets our requirements
    if (userIdentity.verificationScore >= config.minVerificationScore) {
      // User has sufficient identity verification
      // Create a session for the user
      const sessionToken = jwt.sign(
        {
          userPublicKey: userIdentity.userPublicKey,
          verificationScore: userIdentity.verificationScore,
          attestations: userIdentity.attestations.map(a => a.attestationData.type)
        },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      
      // In a real app, you would store the session token in a cookie or localStorage
      res.cookie('session_token', sessionToken, { httpOnly: true });
      
      // Redirect to the dashboard
      res.redirect('/dashboard');
    } else {
      // User does not have sufficient identity verification
      res.redirect(`/insufficient-verification?score=${userIdentity.verificationScore}&required=${config.minVerificationScore}`);
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

// Dashboard page for authenticated users
app.get('/dashboard', authenticateUser, (req, res) => {
  const user = req.user;
  
  res.send(`
    <h1>Welcome to Micro-Finance Provider</h1>
    <p>You have been successfully authenticated with StellarID.</p>
    <p>Your verification score: ${user.verificationScore}</p>
    <p>Attestations: ${user.attestations.join(', ')}</p>
    <h2>Available Services</h2>
    <ul>
      <li><a href="/services/savings">Savings Account</a></li>
      <li><a href="/services/loans">Micro Loans</a></li>
      <li><a href="/services/payments">Payment Services</a></li>
    </ul>
    <a href="/logout">Logout</a>
  `);
});

// Insufficient verification page
app.get('/insufficient-verification', (req, res) => {
  const { score, required } = req.query;
  
  res.send(`
    <h1>Identity Verification Insufficient</h1>
    <p>Your current verification score (${score}) does not meet our minimum requirement (${required}).</p>
    <p>To increase your verification score, please add more attestations to your StellarID.</p>
    <p>You can do this by visiting the StellarID mobile app and requesting additional attestations.</p>
    <a href="/">Back to Home</a>
  `);
});

// Logout
app.get('/logout', (req, res) => {
  // Clear the session
  res.clearCookie('session_token');
  res.redirect('/');
});

// Example service endpoint: Micro Loans
app.get('/services/loans', authenticateUser, (req, res) => {
  const user = req.user;
  
  res.send(`
    <h1>Micro Loans</h1>
    <p>Based on your identity verification, you are eligible for the following loans:</p>
    <ul>
      <li>Small Business Loan - Up to $500</li>
      <li>Agricultural Loan - Up to $300</li>
      <li>Education Loan - Up to $200</li>
    </ul>
    <h2>Apply for a Loan</h2>
    <form action="/services/loans/apply" method="post">
      <div>
        <label for="loanType">Loan Type:</label>
        <select id="loanType" name="loanType">
          <option value="small-business">Small Business Loan</option>
          <option value="agricultural">Agricultural Loan</option>
          <option value="education">Education Loan</option>
        </select>
      </div>
      <div>
        <label for="amount">Amount ($):</label>
        <input type="number" id="amount" name="amount" min="50" max="500">
      </div>
      <div>
        <label for="purpose">Purpose:</label>
        <textarea id="purpose" name="purpose"></textarea>
      </div>
      <button type="submit">Apply</button>
    </form>
    <a href="/dashboard">Back to Dashboard</a>
  `);
});

// ===============================================
// API Endpoints
// ===============================================

// Apply for a loan
app.post('/services/loans/apply', authenticateUser, (req, res) => {
  const { loanType, amount, purpose } = req.body;
  const user = req.user;
  
  // In a real application, you would:
  // 1. Validate the loan application
  // 2. Check the user's credit worthiness
  // 3. Create a loan record in your database
  // 4. Initiate a Stellar payment transaction if approved
  
  res.send(`
    <h1>Loan Application Submitted</h1>
    <p>Thank you for your application. We have received your request for a ${loanType} loan of $${amount}.</p>
    <p>Purpose: ${purpose}</p>
    <p>We will review your application and get back to you within 24 hours.</p>
    <a href="/dashboard">Back to Dashboard</a>
  `);
});

// ===============================================
// Middleware
// ===============================================

// Authenticate user middleware
function authenticateUser(req, res, next) {
  const sessionToken = req.cookies.session_token;
  
  if (!sessionToken) {
    return res.redirect('/login');
  }
  
  try {
    // Verify and decode the session token
    const user = jwt.verify(sessionToken, config.jwtSecret);
    
    // Attach the user object to the request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error verifying session token:', error);
    res.clearCookie('session_token');
    res.redirect('/login');
  }
}

// ===============================================
// Server
// ===============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Financial service integration example running on port ${PORT}`);
});

// ===============================================
// Stellar Integration for Loan Disbursement
// ===============================================

const StellarSdk = require('stellar-sdk');

/**
 * Disburse a loan payment to a user on the Stellar network
 * @param {string} userPublicKey - User's Stellar public key
 * @param {number} amount - Loan amount
 * @param {string} currency - Currency code (e.g., 'USDC')
 * @returns {Promise<object>} Transaction result
 */
async function disburseLoan(userPublicKey, amount, currency = 'USDC') {
  try {
    // Initialize Stellar SDK
    const server = new StellarSdk.Server(
      process.env.NETWORK === 'mainnet'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org'
    );
    
    const networkPassphrase = process.env.NETWORK === 'mainnet'
      ? StellarSdk.Networks.PUBLIC
      : StellarSdk.Networks.TESTNET;
    
    // Load the financial service's account
    const financialServiceKeypair = StellarSdk.Keypair.fromSecret(
      process.env.FINANCIAL_SERVICE_SECRET_KEY
    );
    
    const financialServiceAccount = await server.loadAccount(
      financialServiceKeypair.publicKey()
    );
    
    // Check if the user's account exists and has a trustline
    let userAccount;
    try {
      userAccount = await server.loadAccount(userPublicKey);
    } catch (error) {
      throw new Error('User account does not exist on the Stellar network');
    }
    
    // Check if the user has a trustline for the specified currency
    const hasTrustline = userAccount.balances.some(
      balance => 
        balance.asset_type !== 'native' && 
        balance.asset_code === currency
    );
    
    if (!hasTrustline) {
      throw new Error(`User does not have a trustline for ${currency}`);
    }
    
    // Define the currency asset
    const currencyAsset = new StellarSdk.Asset(
      currency,
      process.env.CURRENCY_ISSUER_PUBLIC_KEY
    );
    
    // Build the loan disbursement transaction
    const transaction = new StellarSdk.TransactionBuilder(financialServiceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: userPublicKey,
          asset: currencyAsset,
          amount: amount.toString()
        })
      )
      .addMemo(StellarSdk.Memo.text('Loan Disbursement'))
      .setTimeout(30)
      .build();
    
    // Sign the transaction
    transaction.sign(financialServiceKeypair);
    
    // Submit the transaction
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      transactionHash: result.hash,
      ledger: result.ledger,
      amount,
      currency,
      recipient: userPublicKey
    };
  } catch (error) {
    console.error('Error disbursing loan:', error);
    throw error;
  }
}

/**
 * Create a loan repayment plan on the Stellar blockchain
 * @param {string} userPublicKey - User's Stellar public key
 * @param {number} totalAmount - Total loan amount
 * @param {number} termMonths - Loan term in months
 * @param {number} interestRate - Annual interest rate (in decimal, e.g., 0.05 for 5%)
 * @param {string} currency - Currency code (e.g., 'USDC')
 * @returns {Promise<object>} Loan details and payment schedule
 */
async function createLoanRepaymentPlan(
  userPublicKey,
  totalAmount,
  termMonths,
  interestRate,
  currency = 'USDC'
) {
  try {
    // Calculate monthly payment
    // Formula: P = (r * PV) / (1 - (1 + r)^-n)
    // Where:
    // P = Monthly payment
    // PV = Present value (loan amount)
    // r = Monthly interest rate
    // n = Number of months
    
    const monthlyInterestRate = interestRate / 12;
    const monthlyPayment = 
      (monthlyInterestRate * totalAmount) /
      (1 - Math.pow(1 + monthlyInterestRate, -termMonths));
    
    // Create payment schedule
    const paymentSchedule = [];
    let remainingBalance = totalAmount;
    
    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      paymentSchedule.push({
        month,
        paymentDate: addMonths(new Date(), month),
        totalPayment: monthlyPayment.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        remainingBalance: Math.max(0, remainingBalance).toFixed(2)
      });
    }
    
    // Initialize Stellar SDK
    const server = new StellarSdk.Server(
      process.env.NETWORK === 'mainnet'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org'
    );
    
    const networkPassphrase = process.env.NETWORK === 'mainnet'
      ? StellarSdk.Networks.PUBLIC
      : StellarSdk.Networks.TESTNET;
    
    // Load the financial service's account
    const financialServiceKeypair = StellarSdk.Keypair.fromSecret(
      process.env.FINANCIAL_SERVICE_SECRET_KEY
    );
    
    const financialServiceAccount = await server.loadAccount(
      financialServiceKeypair.publicKey()
    );
    
    // Store loan details on the blockchain
    const loanDetailsHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          borrower: userPublicKey,
          totalAmount,
          termMonths,
          interestRate,
          currency,
          monthlyPayment,
          paymentSchedule,
          createdAt: new Date().toISOString()
        })
      )
      .digest('hex');
    
    const transaction = new StellarSdk.TransactionBuilder(financialServiceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(
        StellarSdk.Operation.manageData({
          name: `loan-${loanDetailsHash.substring(0, 10)}`,
          value: loanDetailsHash
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(financialServiceKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      loanId: loanDetailsHash,
      transactionHash: result.hash,
      borrower: userPublicKey,
      totalAmount,
      termMonths,
      interestRate,
      currency,
      monthlyPayment: monthlyPayment.toFixed(2),
      paymentSchedule
    };
  } catch (error) {
    console.error('Error creating loan repayment plan:', error);
    throw error;
  }
}

// Helper function to add months to a date
function addMonths(date, months) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate.toISOString().split('T')[0];
}

module.exports = {
  disburseLoan,
  createLoanRepaymentPlan
};