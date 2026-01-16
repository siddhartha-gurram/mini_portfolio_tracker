const portfolioService = require('../services/portfolioService');

class PortfolioController {
  async createPortfolio(req, res) {
    try {
      const portfolio = await portfolioService.createPortfolio({
        ...req.body,
        userId: req.user.userId
      });
      res.status(201).json({
        success: true,
        message: 'Portfolio created successfully',
        data: portfolio
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllPortfolios(req, res) {
    try {
      const userId = req.user.role === 'admin' ? null : req.user.userId;
      const portfolios = await portfolioService.getAllPortfolios(userId);
      res.json({
        success: true,
        data: portfolios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPortfolioById(req, res) {
    try {
      const portfolio = await portfolioService.getPortfolioById(req.params.id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && portfolio.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPortfolioWithHoldings(req, res) {
    try {
      const portfolioWithHoldings = await portfolioService.getPortfolioWithHoldings(req.params.id);
      if (!portfolioWithHoldings) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && portfolioWithHoldings.portfolio.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: portfolioWithHoldings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePortfolio(req, res) {
    try {
      const portfolio = await portfolioService.getPortfolioById(req.params.id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && portfolio.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const updated = await portfolioService.updatePortfolio(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Portfolio updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(error.message === 'Portfolio not found' ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deletePortfolio(req, res) {
    try {
      const portfolio = await portfolioService.getPortfolioById(req.params.id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && portfolio.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await portfolioService.deletePortfolio(req.params.id);
      res.json({
        success: true,
        message: 'Portfolio deleted successfully'
      });
    } catch (error) {
      res.status(error.message === 'Portfolio not found' ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  async recalculatePortfolioValue(req, res) {
    try {
      const portfolio = await portfolioService.getPortfolioById(req.params.id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && portfolio.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const totalValue = await portfolioService.recalculatePortfolioValue(
        req.params.id,
        req.body.assetPrices || {}
      );
      res.json({
        success: true,
        message: 'Portfolio value recalculated',
        data: { totalValue }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PortfolioController();
