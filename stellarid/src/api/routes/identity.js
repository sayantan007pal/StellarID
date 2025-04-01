// ===============================================
// Identity Routes
// ===============================================

const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identity');

// Create a new identity
router.post('/', identityController.createIdentity);

// Verify an identity
router.get('/verify/:userPublicKey', identityController.verifyIdentity);

module.exports = router;