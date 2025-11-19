const express = require('express');
const router = express.Router();

// Import module routes
const authRoutes = require('./auth/auth.routes');

// Register routes
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
