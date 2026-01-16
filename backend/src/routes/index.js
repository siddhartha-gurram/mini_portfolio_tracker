const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const assetRoutes = require('./assetRoutes');
const tradeRoutes = require('./tradeRoutes');

// API routes
router.use('/users', userRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/assets', assetRoutes);
router.use('/trades', tradeRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
