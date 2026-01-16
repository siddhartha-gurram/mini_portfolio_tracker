const assetService = require('../services/assetService');

class AssetController {
  async createAsset(req, res) {
    try {
      const asset = await assetService.createAsset(req.body);
      res.status(201).json({
        success: true,
        message: 'Asset created successfully',
        data: asset
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllAssets(req, res) {
    try {
      const assets = await assetService.getAllAssets(req.query);
      res.json({
        success: true,
        data: assets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAssetById(req, res) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
      }
      res.json({
        success: true,
        data: asset
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAssetBySymbol(req, res) {
    try {
      const asset = await assetService.getAssetBySymbol(req.params.symbol);
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
      }
      res.json({
        success: true,
        data: asset
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAsset(req, res) {
    try {
      const asset = await assetService.updateAsset(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Asset updated successfully',
        data: asset
      });
    } catch (error) {
      res.status(error.message === 'Asset not found' ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateAssetPrice(req, res) {
    try {
      const { price, addToHistory } = req.body;
      if (!price || typeof price !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Valid price is required'
        });
      }

      const asset = await assetService.updateAssetPrice(
        req.params.id,
        price,
        addToHistory !== false
      );
      res.json({
        success: true,
        message: 'Asset price updated successfully',
        data: asset
      });
    } catch (error) {
      res.status(error.message === 'Asset not found' ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteAsset(req, res) {
    try {
      await assetService.deleteAsset(req.params.id);
      res.json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      res.status(error.message === 'Asset not found' ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async bulkUpdatePrices(req, res) {
    try {
      const { priceUpdates } = req.body;
      if (!Array.isArray(priceUpdates)) {
        return res.status(400).json({
          success: false,
          message: 'priceUpdates must be an array'
        });
      }

      const results = await assetService.bulkUpdatePrices(priceUpdates);
      res.json({
        success: true,
        message: 'Bulk price update completed',
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AssetController();
