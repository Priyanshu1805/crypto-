// routes/market.js
const router   = require('express').Router();
const binance  = require('../services/binanceService');
const db       = require('../services/db');

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

// GET /api/market-data
router.get('/market-data', async (req, res) => {
  try {
    const data = await binance.getMarketData(SYMBOLS);
    // Save snapshots async (don't block response)
    data.forEach(d => db.saveSnapshot(d).catch(() => {}));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/candles?symbol=BTCUSDT&interval=1m&limit=60
router.get('/candles', async (req, res) => {
  const { symbol = 'BTCUSDT', interval = '1m', limit = 60 } = req.query;
  try {
    const candles = await binance.getCandles(symbol, interval, parseInt(limit));
    res.json({ success: true, data: candles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/price-history?symbol=BTCUSDT&hours=24
router.get('/price-history', async (req, res) => {
  const { symbol = 'BTCUSDT', hours = 24 } = req.query;
  try {
    const data = await db.getPriceHistory(symbol, parseInt(hours));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
