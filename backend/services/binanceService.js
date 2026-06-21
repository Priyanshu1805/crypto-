// services/binanceService.js
// Wraps binance-api-node with testnet / live toggle

require('dotenv').config();
const Binance = require('binance-api-node').default;

const USE_TESTNET = process.env.USE_TESTNET === 'true';

const client = Binance({
  apiKey:    process.env.BINANCE_API_KEY    || '',
  apiSecret: process.env.BINANCE_API_SECRET || '',
  ...(USE_TESTNET ? {
    httpBase:   'https://testnet.binance.vision',
    wsBase:     'wss://testnet.binance.vision/ws',
    httpFutures:'https://testnet.binancefuture.com',
  } : {}),
});

console.log(`🔑 Binance client ready [${USE_TESTNET ? 'TESTNET' : 'LIVE'}]`);

// ── Fetch prices + 24h stats for given symbols ─────────────
async function getMarketData(symbols) {
  const [prices, statsArr] = await Promise.all([
    client.prices(),
    client.dailyStats(),
  ]);

  return symbols.map(sym => {
    const stats = Array.isArray(statsArr)
      ? statsArr.find(s => s.symbol === sym) || {}
      : statsArr || {};

    return {
      symbol:     sym,
      price:      parseFloat(prices[sym] || 0),
      change_pct: parseFloat(stats.priceChangePercent || 0),
      volume_24h: parseFloat(stats.volume            || 0),
      high_24h:   parseFloat(stats.highPrice         || 0),
      low_24h:    parseFloat(stats.lowPrice          || 0),
    };
  });
}

// ── Fetch candlestick history ──────────────────────────────
async function getCandles(symbol, interval = '1m', limit = 60) {
  const candles = await client.candles({ symbol, interval, limit });
  return candles.map(c => ({
    time:   c.openTime,
    open:   parseFloat(c.open),
    high:   parseFloat(c.high),
    low:    parseFloat(c.low),
    close:  parseFloat(c.close),
    volume: parseFloat(c.volume),
  }));
}

// ── Place a trade order ────────────────────────────────────
async function placeOrder({ symbol, side, type, quantity, price }) {
  const params = {
    symbol,
    side:     side.toUpperCase(),
    type:     type || 'LIMIT',
    quantity: String(quantity),
  };
  if (type === 'LIMIT' || !type) {
    params.timeInForce = 'GTC';
    params.price       = String(price);
  }
  return await client.order(params);
}

// ── Get account balances ───────────────────────────────────
async function getPortfolio() {
  const account = await client.accountInfo();
  return account.balances
    .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
    .map(b => ({
      asset:  b.asset,
      free:   parseFloat(b.free),
      locked: parseFloat(b.locked),
      total:  parseFloat(b.free) + parseFloat(b.locked),
    }));
}

// ── WebSocket: mini-ticker stream for live prices ──────────
function startTickerStream(symbols, onTick) {
  const streamSymbols = symbols.map(s => s.toLowerCase());
  return client.ws.miniTicker(streamSymbols, tick => {
    onTick({
      symbol:     tick.symbol,
      price:      parseFloat(tick.close),
      change_pct: parseFloat(tick.priceChangePercent || 0),
      volume:     parseFloat(tick.volume || 0),
    });
  });
}

module.exports = { getMarketData, getCandles, placeOrder, getPortfolio, startTickerStream };
