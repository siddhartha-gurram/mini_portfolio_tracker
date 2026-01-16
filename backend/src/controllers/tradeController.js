const tradeService = require('../services/tradeService');
const portfolioService = require('../services/portfolioService');

class TradeController {
  async createTrade(req, res) {
    try {
      // Verify portfolio ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(req.body.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      const trade = await tradeService.createTrade(req.body);
      res.status(201).json({
        success: true,
        message: 'Trade created successfully',
        data: trade
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllTrades(req, res) {
    try {
      // If not admin, filter by user's portfolios
      if (req.user.role !== 'admin') {
        const portfolios = await portfolioService.getAllPortfolios(req.user.userId);
        const portfolioIds = portfolios.map(p => p.id);
        if (portfolioIds.length === 0) {
          return res.json({
            success: true,
            data: []
          });
        }
        // For non-admin, we need to get trades for all their portfolios
        // Since tradeService.getAllTrades only accepts simple filters,
        // we'll need to handle this differently
        const allTrades = [];
        for (const portfolioId of portfolioIds) {
          const portfolioTrades = await tradeService.getAllTrades({ portfolioId });
          allTrades.push(...portfolioTrades);
        }
        return res.json({
          success: true,
          data: allTrades
        });
      } else {
        // Admin can filter by any query params
        const trades = await tradeService.getAllTrades(req.query);
        return res.json({
          success: true,
          data: trades
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTradeById(req, res) {
    try {
      const trade = await tradeService.getTradeById(req.params.id);
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: 'Trade not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(trade.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      res.json({
        success: true,
        data: trade
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTradesByPortfolio(req, res) {
    try {
      // Verify portfolio ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(req.params.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      const trades = await tradeService.getTradesByPortfolio(req.params.portfolioId);
      res.json({
        success: true,
        data: trades
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateTrade(req, res) {
    try {
      const trade = await tradeService.getTradeById(req.params.id);
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: 'Trade not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(trade.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      const updated = await tradeService.updateTrade(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Trade updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(
        error.message === 'Trade not found' ? 404 :
        error.message.includes('Cannot modify') ? 400 : 400
      ).json({
        success: false,
        message: error.message
      });
    }
  }

  async executeTrade(req, res) {
    try {
      const trade = await tradeService.getTradeById(req.params.id);
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: 'Trade not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(trade.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      const executed = await tradeService.executeTrade(req.params.id);
      res.json({
        success: true,
        message: 'Trade executed successfully',
        data: executed
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelTrade(req, res) {
    try {
      const trade = await tradeService.getTradeById(req.params.id);
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: 'Trade not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(trade.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      const cancelled = await tradeService.cancelTrade(req.params.id);
      res.json({
        success: true,
        message: 'Trade cancelled successfully',
        data: cancelled
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteTrade(req, res) {
    try {
      const trade = await tradeService.getTradeById(req.params.id);
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: 'Trade not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin') {
        const portfolio = await portfolioService.getPortfolioById(trade.portfolioId);
        if (!portfolio || portfolio.userId !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      await tradeService.deleteTrade(req.params.id);
      res.json({
        success: true,
        message: 'Trade deleted successfully'
      });
    } catch (error) {
      res.status(
        error.message === 'Trade not found' ? 404 : 400
      ).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTradeStatistics(req, res) {
    try {
      // If not admin, get stats for all user's portfolios
      if (req.user.role !== 'admin') {
        const portfolios = await portfolioService.getAllPortfolios(req.user.userId);
        const portfolioIds = portfolios.map(p => p.id);
        
        // Aggregate stats across all user portfolios
        const allStats = {
          total: 0,
          byStatus: {},
          byType: { buy: 0, sell: 0 },
          totalVolume: 0,
          executed: 0
        };
        
        for (const portfolioId of portfolioIds) {
          const stats = await tradeService.getTradeStatistics(portfolioId);
          allStats.total += stats.total;
          allStats.executed += stats.executed;
          allStats.totalVolume += stats.totalVolume;
          
          // Merge status counts
          Object.keys(stats.byStatus).forEach(status => {
            allStats.byStatus[status] = (allStats.byStatus[status] || 0) + stats.byStatus[status];
          });
          
          // Merge type counts
          allStats.byType.buy += stats.byType.buy;
          allStats.byType.sell += stats.byType.sell;
        }
        
        return res.json({
          success: true,
          data: allStats
        });
      } else {
        // Admin can filter by specific portfolio
        const portfolioId = req.query.portfolioId || null;
        const stats = await tradeService.getTradeStatistics(portfolioId);
        return res.json({
          success: true,
          data: stats
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TradeController();
