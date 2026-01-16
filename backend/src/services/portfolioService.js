const JsonDb = require('../utils/jsonDb');
const Portfolio = require('../models/portfolio');
const Trade = require('../models/trade');

const portfolioDb = new JsonDb('portfolios');
const tradeDb = new JsonDb('trades');

class PortfolioService {
  // Create a new portfolio
  async createPortfolio(portfolioData) {
    const errors = Portfolio.validate(portfolioData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const portfolio = await portfolioDb.create(portfolioData);
    const portfolioObj = new Portfolio(portfolio);
    portfolioObj.id = portfolio.id;
    return portfolioObj;
  }

  // Get all portfolios (optionally filtered by userId)
  async getAllPortfolios(userId = null) {
    const filter = userId ? { userId } : {};
    const portfolios = await portfolioDb.findAll(filter);
    return portfolios.map(p => {
      const portfolio = new Portfolio(p);
      portfolio.id = p.id;
      return portfolio;
    });
  }

  // Get portfolio by ID
  async getPortfolioById(id) {
    const portfolio = await portfolioDb.findById(id);
    if (!portfolio) {
      return null;
    }
    const portfolioObj = new Portfolio(portfolio);
    portfolioObj.id = portfolio.id;
    return portfolioObj;
  }

  // Get portfolio with holdings
  async getPortfolioWithHoldings(id) {
    const portfolio = await this.getPortfolioById(id);
    if (!portfolio) {
      return null;
    }

    // Get all executed trades for this portfolio
    const trades = await tradeDb.findAll({
      portfolioId: id,
      status: 'executed'
    });

    // Calculate holdings
    const holdings = {};
    trades.forEach(trade => {
      if (!holdings[trade.assetId]) {
        holdings[trade.assetId] = {
          assetId: trade.assetId,
          quantity: 0,
          totalCost: 0,
          averagePrice: 0
        };
      }

      if (trade.type === 'buy') {
        holdings[trade.assetId].quantity += trade.quantity;
        holdings[trade.assetId].totalCost += trade.totalAmount;
      } else if (trade.type === 'sell') {
        holdings[trade.assetId].quantity -= trade.quantity;
        holdings[trade.assetId].totalCost -= trade.totalAmount;
      }

      if (holdings[trade.assetId].quantity > 0) {
        holdings[trade.assetId].averagePrice =
          holdings[trade.assetId].totalCost / holdings[trade.assetId].quantity;
      }
    });

    // Remove holdings with zero quantity
    const activeHoldings = Object.values(holdings).filter(h => h.quantity > 0);

    const portfolioObj = new Portfolio(portfolio);
    portfolioObj.id = portfolio.id;
    return {
      portfolio: portfolioObj,
      holdings: activeHoldings,
      totalHoldings: activeHoldings.length
    };
  }

  // Update portfolio
  async updatePortfolio(id, updates) {
    const portfolio = await portfolioDb.findById(id);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Validate updates
    const updatedData = { ...portfolio, ...updates };
    const errors = Portfolio.validate(updatedData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const updated = await portfolioDb.updateById(id, updates);
    const portfolioObj = new Portfolio(updated);
    portfolioObj.id = updated.id;
    return portfolioObj;
  }

  // Delete portfolio
  async deletePortfolio(id) {
    const portfolio = await portfolioDb.findById(id);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Check if there are any trades for this portfolio
    const trades = await tradeDb.findAll({ portfolioId: id });
    if (trades.length > 0) {
      throw new Error('Cannot delete portfolio with existing trades. Delete trades first.');
    }

    return await portfolioDb.deleteById(id);
  }

  // Recalculate portfolio value based on current asset prices
  async recalculatePortfolioValue(id, assetPrices = {}) {
    const portfolioWithHoldings = await this.getPortfolioWithHoldings(id);
    if (!portfolioWithHoldings) {
      throw new Error('Portfolio not found');
    }

    let totalValue = 0;
    portfolioWithHoldings.holdings.forEach(holding => {
      const currentPrice = assetPrices[holding.assetId] || holding.averagePrice;
      totalValue += holding.quantity * currentPrice;
    });

    await this.updatePortfolio(id, { totalValue });
    return totalValue;
  }
}

module.exports = new PortfolioService();
