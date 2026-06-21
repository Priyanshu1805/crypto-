-- CryptoDesk Database Setup
-- Run: mysql -u root -p < setup.sql

CREATE DATABASE IF NOT EXISTS cryptodesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cryptodesk;

CREATE TABLE IF NOT EXISTS trades (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  symbol       VARCHAR(20)           NOT NULL,
  side         ENUM('BUY','SELL')    NOT NULL,
  order_type   VARCHAR(20)           NOT NULL DEFAULT 'LIMIT',
  quantity     DECIMAL(18,8)         NOT NULL,
  price        DECIMAL(18,2)         NOT NULL,
  stop_loss    DECIMAL(18,2),
  take_profit  DECIMAL(18,2),
  order_id     VARCHAR(64),
  status       VARCHAR(20)           DEFAULT 'PENDING',
  pnl          DECIMAL(18,2)         DEFAULT 0,
  created_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_symbol (symbol),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS market_snapshots (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  symbol      VARCHAR(20)    NOT NULL,
  price       DECIMAL(18,2)  NOT NULL,
  volume_24h  DECIMAL(28,8),
  change_pct  DECIMAL(8,4),
  high_24h    DECIMAL(18,2),
  low_24h     DECIMAL(18,2),
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_symbol_time (symbol, captured_at)
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  total_usd   DECIMAL(18,2) NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'CryptoDesk DB ready ✅' AS result;
