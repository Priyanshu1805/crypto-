# CryptoDesk — Full Crypto Trading Tool

> Live charts · One-click trading · Risk management · P&L tracking · Portfolio viewer

---

## Quick Start

### Mac / Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Windows
```
Double-click setup.bat
```

Then start in two terminals:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

Open: **http://localhost:3001**

---

## Project Structure

```
cryptodesk/
├── setup.sh / setup.bat       ← One-click installer
├── backend/
│   ├── server.js              ← Express + WebSocket server
│   ├── routes/
│   │   ├── market.js          ← /api/market-data, /api/candles
│   │   └── trade.js           ← /api/trade, /api/trades, /api/pnl, /api/portfolio
│   ├── services/
│   │   ├── binanceService.js  ← All Binance API calls
│   │   ├── riskManager.js     ← Stop-loss / take-profit validation
│   │   └── db.js              ← MySQL queries
│   ├── setup.sql              ← Database creation script
│   └── .env.example           ← Config template
└── frontend/
    └── src/
        ├── App.jsx            ← Main layout, tabs, WebSocket
        ├── components/
        │   ├── TickerBar.jsx  ← Live price strip
        │   ├── PriceChart.jsx ← Chart.js line chart (1m/5m/15m/1h/4h/1d)
        │   ├── OrderForm.jsx  ← Buy/Sell form with live SL/TP preview
        │   ├── TradeHistory.jsx ← All trades from DB
        │   ├── PnLChart.jsx   ← P&L by symbol + daily bar chart
        │   ├── Portfolio.jsx  ← Binance account balances
        │   └── Toast.jsx      ← Success/error notifications
        ├── hooks/
        │   └── useWebSocket.js ← Auto-reconnect WS hook
        └── utils/
            └── format.js      ← Number formatters, constants
```

---

## Features

| Feature | How it works |
|---|---|
| **Live price ticker** | Binance WebSocket → Express WS → React state |
| **Interactive chart** | Candlestick history from Binance API + live overlay |
| **One-click trading** | POST /api/trade → risk check → Binance order |
| **Risk management** | Stop-loss %, take-profit %, R:R ratio, position size cap |
| **Trade history** | Every order saved to MySQL, shown in table |
| **P&L tracking** | Calculated from filled trades per symbol + daily bar chart |
| **Portfolio viewer** | Live Binance account balances |

---

## Configuration (backend/.env)

```env
# Binance (get from binance.com > API Management)
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret

# IMPORTANT: Keep true until ready for real money
USE_TESTNET=true

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cryptodesk

# Risk limits
MAX_POSITION_USD=500     ← Max $ per trade
MIN_STOP_LOSS_PCT=0.5    ← Min stop-loss %
MAX_STOP_LOSS_PCT=10     ← Max stop-loss %
MIN_RR_RATIO=1.5         ← Min reward:risk (TP must be 1.5x the SL)
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/health | Server status + mode |
| GET | /api/market-data | Live prices (all 4 symbols) |
| GET | /api/candles?symbol=BTCUSDT&interval=1m&limit=60 | Candlestick history |
| POST | /api/trade | Place order (with risk check) |
| GET | /api/trades | Trade history from DB |
| GET | /api/pnl | P&L by symbol + daily breakdown |
| GET | /api/portfolio | Binance account balances |

---

## Going Live (LIVE trading)

1. Go to https://binance.com > Settings > API Management
2. Create API key — enable **Read Info** + **Spot Trading**
3. In `backend/.env` set `USE_TESTNET=false`
4. Start with small quantities (0.001 BTC)

⚠️ **Never commit `.env` to git. API keys = real money.**

---

## Deployment

### Frontend → Netlify
```bash
cd frontend
npm run build
# Upload /build folder to netlify.com/drop
```

### Backend → AWS EC2
```bash
npm install -g pm2
cd backend && npm install
pm2 start server.js --name cryptodesk
pm2 save && pm2 startup
```
