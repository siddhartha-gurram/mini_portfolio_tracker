const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const { authenticate } = require('../middleware/auth');

// All trade routes require authentication
router.use(authenticate);

router.post('/', tradeController.createTrade);
router.get('/stats', tradeController.getTradeStatistics);
router.get('/', tradeController.getAllTrades);
router.get('/portfolio/:portfolioId', tradeController.getTradesByPortfolio);
router.get('/:id', tradeController.getTradeById);
router.put('/:id', tradeController.updateTrade);
router.post('/:id/execute', tradeController.executeTrade);
router.post('/:id/cancel', tradeController.cancelTrade);
router.delete('/:id', tradeController.deleteTrade);

module.exports = router;
