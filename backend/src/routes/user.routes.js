
// backend/src/routes/user.routes.js
const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/stellar-account', authMiddleware, userController.getStellarAccount);

module.exports = router;