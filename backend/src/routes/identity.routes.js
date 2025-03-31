// backend/src/routes/identity.routes.js
const express = require('express');
const identityController = require('../controllers/identity.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All identity routes require authentication
router.use(authMiddleware);

router.post('/', identityController.createIdentity);
router.get('/', identityController.getMyIdentity);
router.put('/', identityController.updateIdentity);
router.post('/documents', identityController.uploadDocument);
router.get('/verification-status', identityController.getVerificationStatus);
router.post('/challenge-response', identityController.verifyChallenge);

module.exports = router;