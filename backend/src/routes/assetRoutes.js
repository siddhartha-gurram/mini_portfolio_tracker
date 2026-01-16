const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (market data can be accessed without auth)
router.get('/', assetController.getAllAssets);
router.get('/symbol/:symbol', assetController.getAssetBySymbol);
router.get('/:id', assetController.getAssetById);

// Protected routes (admin only for modifications)
router.post('/', authenticate, authorize('admin', 'analyst'), assetController.createAsset);
router.put('/:id', authenticate, authorize('admin', 'analyst'), assetController.updateAsset);
router.put('/:id/price', authenticate, authorize('admin', 'analyst'), assetController.updateAssetPrice);
router.delete('/:id', authenticate, authorize('admin'), assetController.deleteAsset);
router.post('/bulk-update-prices', authenticate, authorize('admin', 'analyst'), assetController.bulkUpdatePrices);

module.exports = router;
