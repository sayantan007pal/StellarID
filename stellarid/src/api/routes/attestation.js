// ===============================================
// Attestation Routes
// ===============================================

const express = require('express');
const router = express.Router();
const attestationController = require('../controllers/attestation');

// Request an attestation
router.post('/request', attestationController.requestAttestation);

// Issue an attestation (for attesters only)
router.post('/issue', attestationController.issueAttestation);

module.exports = router;