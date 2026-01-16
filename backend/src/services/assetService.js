const JsonDb = require('../utils/jsonDb');
const Asset = require('../models/asset');

const assetDb = new JsonDb('assets');

class AssetService {
  // Create a new asset
  async createAsset(assetData) {
    const errors = Asset.validate(assetData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Check if asset with same symbol already exists
    const existing = await assetDb.findOne({ symbol: assetData.symbol });
    if (existing) {
      throw new Error('Asset with this symbol already exists');
    }

    const asset = await assetDb.create(assetData);
    const assetObj = new Asset(asset);
    assetObj.id = asset.id;
    return assetObj;
  }

  // Get all assets (with optional filters)
  async getAllAssets(filter = {}) {
    const assets = await assetDb.findAll(filter);
    return assets.map(a => {
      const assetObj = new Asset(a);
      assetObj.id = a.id;
      return assetObj;
    });
  }

  // Get asset by ID
  async getAssetById(id) {
    const asset = await assetDb.findById(id);
    if (!asset) {
      return null;
    }
    const assetObj = new Asset(asset);
    assetObj.id = asset.id;
    return assetObj;
  }

  // Get asset by symbol
  async getAssetBySymbol(symbol) {
    const asset = await assetDb.findOne({ symbol });
    if (!asset) {
      return null;
    }
    const assetObj = new Asset(asset);
    assetObj.id = asset.id;
    return assetObj;
  }

  // Update asset
  async updateAsset(id, updates) {
    const asset = await assetDb.findById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Validate updates
    const updatedData = { ...asset, ...updates };
    const errors = Asset.validate(updatedData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const updated = await assetDb.updateById(id, updates);
    return new Asset(updated);
  }

  // Update asset price
  async updateAssetPrice(id, price, addToHistory = true) {
    const asset = await assetDb.findById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }

    const updates = { currentPrice: price };
    
    if (addToHistory) {
      const priceHistory = asset.priceHistory || [];
      priceHistory.push({
        price,
        timestamp: new Date().toISOString()
      });
      // Keep only last 100 price points
      updates.priceHistory = priceHistory.slice(-100);
    }

    const updated = await assetDb.updateById(id, updates);
    const assetObj = new Asset(updated);
    assetObj.id = updated.id;
    return assetObj;
  }

  // Delete asset
  async deleteAsset(id) {
    const asset = await assetDb.findById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }

    return await assetDb.deleteById(id);
  }

  // Bulk update prices (for market data ingestion simulation)
  async bulkUpdatePrices(priceUpdates) {
    const results = [];
    for (const { assetId, price } of priceUpdates) {
      try {
        const updated = await this.updateAssetPrice(assetId, price);
        results.push({ assetId, success: true, asset: updated });
      } catch (error) {
        results.push({ assetId, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new AssetService();
