// backend/src/routes/verification.routes.js
const express = require('express');
const verificationController = require('../controllers/verification.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// All verification routes require authentication
router.use(authMiddleware);

// Routes for verifiers (financial institutions, etc.)
router.post('/request', roleMiddleware(['verifier', 'admin']), verificationController.requestVerification);
router.get('/requested', roleMiddleware(['verifier', 'admin']), verificationController.getRequestedVerifications);

// Routes for users
router.get('/received', verificationController.getReceivedVerifications);
router.post('/:id/consent', verificationController.provideConsent);
router.delete('/:id/consent', verificationController.revokeConsent);

// Common routes
router.get('/:id', verificationController.getVerificationDetails);

module.exports = router;
