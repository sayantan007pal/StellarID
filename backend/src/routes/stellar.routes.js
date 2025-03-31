
// backend/src/routes/stellar.routes.js
const express = require('express');
const stellarController = require('../controllers/stellar.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All Stellar routes require authentication
router.use(authMiddleware);

router.get('/account', stellarController.getAccountInfo);
router.post('/fund-testnet', stellarController.fundTestnetAccount);
router.post('/create-asset', stellarController.createAsset);
router.post('/create-trustline', stellarController.createTrustline);
router.get('/assets', stellarController.getAssets);
router.get('/transactions', stellarController.getTransactions);

module.exports = router;