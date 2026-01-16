const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');

// All portfolio routes require authentication
router.use(authenticate);

router.post('/', portfolioController.createPortfolio);
router.get('/', portfolioController.getAllPortfolios);
router.get('/:id', portfolioController.getPortfolioById);
router.get('/:id/holdings', portfolioController.getPortfolioWithHoldings);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);
router.post('/:id/recalculate', portfolioController.recalculatePortfolioValue);

module.exports = router;
