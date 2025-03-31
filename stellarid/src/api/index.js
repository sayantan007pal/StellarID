// ===============================================
// StellarID API Server - Entry Point
// ===============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const identityRoutes = require('./routes/identity');
const attestationRoutes = require('./routes/attestation');
const attesterRoutes = require('./routes/attester');

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Apply routes
app.use('/api/identity', identityRoutes);
app.use('/api/attestation', attestationRoutes);
app.use('/api/attester', attesterRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ===============================================
// Error Handler
// ===============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// ===============================================
// Server Initialization
// ===============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`StellarID API server running on port ${PORT}`);
});

module.exports = app;
