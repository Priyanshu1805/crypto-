// server.js — CryptoDesk main entry point
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const http       = require('http');
const WebSocket  = require('ws');
const rateLimit  = require('express-rate-limit');

const db         = require('./services/db');
const binance    = require('./services/binanceService');
const marketRoutes = require('./routes/market');
const tradeRoutes  = require('./routes/trade');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3001' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120, message: { error: 'Too many requests' } }));

// ── Routes ─────────────────────────────────────────────────
app.use('/api', marketRoutes);
app.use('/api', tradeRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode:   process.env.USE_TESTNET === 'true' ? 'TESTNET' : 'LIVE',
    time:   new Date().toISOString(),
  });
});

// ── WebSocket: broadcast live prices to frontend ───────────
function broadcast(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

wss.on('connection', ws => {
  console.log('🔌 Frontend connected');
  ws.send(JSON.stringify({ type: 'CONNECTED', mode: process.env.USE_TESTNET === 'true' ? 'TESTNET' : 'LIVE' }));
  ws.on('close', () => console.log('🔌 Frontend disconnected'));
});

// ── Binance WebSocket price stream ─────────────────────────
function startPriceStream() {
  const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
  binance.startTickerStream(SYMBOLS, tick => {
    broadcast({ type: 'PRICE_UPDATE', ...tick });
  });
  console.log('📡 Price stream started');
}

// ── Boot ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

db.connect()
  .then(() => {
    startPriceStream();
    server.listen(PORT, () => {
      console.log(`\n🚀 CryptoDesk backend running`);
      console.log(`   REST API : http://localhost:${PORT}/api`);
      console.log(`   WebSocket: ws://localhost:${PORT}`);
      console.log(`   Mode     : ${process.env.USE_TESTNET === 'true' ? '🟡 TESTNET' : '🔴 LIVE'}\n`);
    });
  })
  .catch(err => {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  });
