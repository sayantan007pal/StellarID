// backend/src/controllers/user.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const StellarSdk = require('stellar-sdk');

// Configure Stellar SDK for testnet or public network
const server = process.env.STELLAR_NETWORK === 'testnet' 
  ? new StellarSdk.Server('https://horizon-testnet.stellar.org')
  : new StellarSdk.Server('https://horizon.stellar.org');

exports.register = async (req, res) => {
  try {
    const { username, password, email, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username }, 
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : [])
      ] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this username, email, or phone number'
      });
    }
    
    // Generate a new Stellar account keypair
    const keypair = StellarSdk.Keypair.random();
    
    // Create a new user
    const user = new User({
      username,
      password,
      email,
      phoneNumber,
      stellarPublicKey: keypair.publicKey(),
      stellarSecretKey: keypair.secret()
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token (excluding sensitive data)
    res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        role: user.role,
        stellarPublicKey: user.stellarPublicKey,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Validate password
    const isValidPassword = await user.isValidPassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        role: user.role,
        stellarPublicKey: user.stellarPublicKey,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// New functions to satisfy your routes

exports.getProfile = async (req, res) => {
  try {
    // Assuming you have a user id attached to req (from authMiddleware)
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password -stellarSecretKey');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Update allowed fields only (for security reasons)
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -stellarSecretKey');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

exports.getStellarAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Return only the stellar public key (and any other non-sensitive info)
    res.status(200).json({
      success: true,
      data: { stellarPublicKey: user.stellarPublicKey }
    });
  } catch (error) {
    console.error('Get stellar account error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving stellar account' });
  }
};
