// backend/src/routes/attestation.routes.js
const express = require('express');
const attestationController = require('../controllers/attestation.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// All attestation routes require authentication
router.use(authMiddleware);

// Routes for attesters
router.post('/', roleMiddleware(['attester', 'admin']), attestationController.createAttestation);
router.get('/issued', roleMiddleware(['attester', 'admin']), attestationController.getIssuedAttestations);
router.put('/:id/revoke', roleMiddleware(['attester', 'admin']), attestationController.revokeAttestation);

// Routes for users
router.get('/received', attestationController.getReceivedAttestations);
router.get('/:id', attestationController.getAttestationDetails);

module.exports = router;
