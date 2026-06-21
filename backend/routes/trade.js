// routes/trade.js
const router      = require('express').Router();
const binance     = require('../services/binanceService');
const riskManager = require('../services/riskManager');
const db          = require('../services/db');

// POST /api/trade
// Body: { symbol, side, type, quantity, price, stopLoss, takeProfit }
router.post('/trade', async (req, res) => {
  const { symbol, side, type, quantity, price, stopLoss, takeProfit } = req.body;

  if (!symbol || !side || !quantity || !price) {
    return res.status(400).json({ success: false, error: 'Missing required fields: symbol, side, quantity, price' });
  }

  // 1. Risk check — blocks bad trades before hitting Binance
  const risk = riskManager.check({ side, price, stopLoss, takeProfit, quantity });
  if (!risk.approved) {
    return res.status(400).json({ success: false, error: risk.reason });
  }

  try {
    // 2. Place order on Binance
    const order = await binance.placeOrder({ symbol, side, type, quantity, price });

    // 3. Save to DB
    const tradeId = await db.saveTrade({
      symbol,
      side:        side.toUpperCase(),
      order_type:  type || 'LIMIT',
      quantity,
      price,
      stop_loss:   risk.slPrice,
      take_profit: risk.tpPrice,
      order_id:    order.orderId,
      status:      order.status,
    });

    console.log(`✅ Trade #${tradeId} executed: ${side.toUpperCase()} ${quantity} ${symbol} @ $${price}`);

    res.json({ success: true, tradeId, order, risk });
  } catch (err) {
    console.error('Trade error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trades
router.get('/trades', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const trades = await db.getTrades(parseInt(limit));
    res.json({ success: true, data: trades });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/pnl
router.get('/pnl', async (req, res) => {
  try {
    const [bySymbol, daily] = await Promise.all([db.getPnL(), db.getDailyPnL()]);
    res.json({ success: true, bySymbol, daily });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/portfolio
router.get('/portfolio', async (req, res) => {
  try {
    const balances = await binance.getPortfolio();
    res.json({ success: true, data: balances });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
