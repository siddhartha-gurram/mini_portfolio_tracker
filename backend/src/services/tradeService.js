const JsonDb = require('../utils/jsonDb');
const Trade = require('../models/trade');
const portfolioService = require('./portfolioService');
const assetService = require('./assetService');

const tradeDb = new JsonDb('trades');

class TradeService {
  // Create a new trade
  async createTrade(tradeData) {
    const errors = Trade.validate(tradeData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Verify portfolio exists
    const portfolio = await portfolioService.getPortfolioById(tradeData.portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Verify asset exists
    const asset = await assetService.getAssetById(tradeData.assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Use current asset price if price not provided
    if (!tradeData.price && asset.currentPrice) {
      tradeData.price = asset.currentPrice;
    }

    // Calculate total amount
    tradeData.totalAmount = tradeData.quantity * tradeData.price;

    const trade = await tradeDb.create(tradeData);
    const tradeObj = new Trade(trade);
    tradeObj.id = trade.id;
    return tradeObj;
  }

  // Get all trades (with optional filters)
  async getAllTrades(filter = {}) {
    const trades = await tradeDb.findAll(filter);
    return trades.map(t => {
      const trade = new Trade(t);
      trade.id = t.id;
      return trade;
    });
  }

  // Get trade by ID
  async getTradeById(id) {
    const trade = await tradeDb.findById(id);
    if (!trade) {
      return null;
    }
    const tradeObj = new Trade(trade);
    tradeObj.id = trade.id;
    return tradeObj;
  }

  // Get trades by portfolio
  async getTradesByPortfolio(portfolioId) {
    const trades = await this.getAllTrades({ portfolioId });
    return trades.map(t => {
      const trade = new Trade(t);
      trade.id = t.id;
      return trade;
    });
  }

  // Update trade
  async updateTrade(id, updates) {
    const trade = await tradeDb.findById(id);
    if (!trade) {
      throw new Error('Trade not found');
    }

    // Don't allow updating executed trades
    if (trade.status === 'executed' && updates.status !== 'executed') {
      throw new Error('Cannot modify an executed trade');
    }

    // Recalculate total amount if quantity or price changes
    if (updates.quantity || updates.price) {
      const newQuantity = updates.quantity || trade.quantity;
      const newPrice = updates.price || trade.price;
      updates.totalAmount = newQuantity * newPrice;
    }

    const updated = await tradeDb.updateById(id, updates);
    const tradeObj = new Trade(updated);
    tradeObj.id = updated.id;
    return tradeObj;
  }

  // Execute trade
  async executeTrade(id) {
    const trade = await tradeDb.findById(id);
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status !== 'pending') {
      throw new Error(`Cannot execute trade with status: ${trade.status}`);
    }

    // Verify portfolio has sufficient funds/holdings for the trade
    const portfolio = await portfolioService.getPortfolioWithHoldings(trade.portfolioId);
    
    if (trade.type === 'sell') {
      // Check if portfolio has enough holdings
      const holding = portfolio.holdings.find(h => h.assetId === trade.assetId);
      if (!holding || holding.quantity < trade.quantity) {
        throw new Error('Insufficient holdings to execute sell trade');
      }
    }

    // Execute the trade
    const updated = await tradeDb.updateById(id, {
      status: 'executed',
      executedAt: new Date().toISOString()
    });

    // Update portfolio value (simplified - in real system would recalculate)
    await portfolioService.recalculatePortfolioValue(trade.portfolioId);

    const tradeObj = new Trade(updated);
    tradeObj.id = updated.id;
    return tradeObj;
  }

  // Cancel trade
  async cancelTrade(id) {
    const trade = await tradeDb.findById(id);
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status === 'executed') {
      throw new Error('Cannot cancel an executed trade');
    }

    const updated = await tradeDb.updateById(id, { status: 'cancelled' });
    const tradeObj = new Trade(updated);
    tradeObj.id = updated.id;
    return tradeObj;
  }

  // Delete trade
  async deleteTrade(id) {
    const trade = await tradeDb.findById(id);
    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status === 'executed') {
      throw new Error('Cannot delete an executed trade');
    }

    return await tradeDb.deleteById(id);
  }

  // Get trade statistics
  async getTradeStatistics(portfolioId = null) {
    // If portfolioId is provided, filter by it
    // Otherwise, get all trades (controller handles filtering for user portfolios)
    const filter = portfolioId ? { portfolioId } : {};
    const trades = await tradeDb.findAll(filter);

    const stats = {
      total: trades.length,
      byStatus: {},
      byType: { buy: 0, sell: 0 },
      totalVolume: 0,
      executed: 0
    };

    trades.forEach(trade => {
      // Count by status
      const status = trade.status || 'pending';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Count by type
      const type = trade.type || 'buy';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Total volume
      if (trade.status === 'executed') {
        stats.totalVolume += trade.totalAmount || 0;
        stats.executed += 1;
      }
    });

    return stats;
  }
}

module.exports = new TradeService();
