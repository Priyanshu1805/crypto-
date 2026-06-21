// services/db.js
// MySQL connection pool + all DB queries

require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

async function connect() {
  pool = await mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'cryptodesk',
    waitForConnections: true,
    connectionLimit:    10,
    timezone:           '+00:00',
  });
  await pool.execute('SELECT 1');
  console.log('✅ MySQL connected');
  return pool;
}

// ── Trades ─────────────────────────────────────────────────
async function saveTrade(trade) {
  const { symbol, side, order_type, quantity, price, stop_loss, take_profit, order_id, status } = trade;
  const [r] = await pool.execute(
    `INSERT INTO trades (symbol,side,order_type,quantity,price,stop_loss,take_profit,order_id,status)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [symbol, side, order_type, quantity, price, stop_loss, take_profit, order_id, status]
  );
  return r.insertId;
}

async function getTrades(limit = 50) {
  const [rows] = await pool.execute(
    'SELECT * FROM trades ORDER BY created_at DESC LIMIT ?', [limit]
  );
  return rows;
}

async function getPnL() {
  const [rows] = await pool.execute(`
    SELECT
      symbol,
      SUM(CASE WHEN side='BUY'  THEN quantity * price * -1 ELSE 0 END) +
      SUM(CASE WHEN side='SELL' THEN quantity * price       ELSE 0 END) AS pnl,
      COUNT(*) AS trade_count
    FROM trades
    WHERE status = 'FILLED'
    GROUP BY symbol
  `);
  return rows;
}

async function getDailyPnL() {
  const [rows] = await pool.execute(`
    SELECT
      DATE(created_at) AS date,
      SUM(CASE WHEN side='SELL' THEN quantity * price ELSE quantity * price * -1 END) AS pnl
    FROM trades
    WHERE status = 'FILLED'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `);
  return rows;
}

// ── Market Snapshots ───────────────────────────────────────
async function saveSnapshot(data) {
  await pool.execute(
    `INSERT INTO market_snapshots (symbol,price,volume_24h,change_pct,high_24h,low_24h)
     VALUES (?,?,?,?,?,?)`,
    [data.symbol, data.price, data.volume_24h, data.change_pct, data.high_24h, data.low_24h]
  );
}

async function getPriceHistory(symbol, hours = 24) {
  const [rows] = await pool.execute(`
    SELECT price, captured_at
    FROM market_snapshots
    WHERE symbol = ? AND captured_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    ORDER BY captured_at ASC
  `, [symbol, hours]);
  return rows;
}

module.exports = { connect, saveTrade, getTrades, getPnL, getDailyPnL, saveSnapshot, getPriceHistory };
