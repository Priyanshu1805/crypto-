#!/bin/bash
# CryptoDesk — One-click setup
# Run: chmod +x setup.sh && ./setup.sh

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║       CryptoDesk Setup Script        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Check Node.js ─────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# ── Check MySQL ────────────────────────────────────────────
if ! command -v mysql &> /dev/null; then
  echo "⚠️  MySQL not found. Please install MySQL 8+ first."
  echo "   Mac: brew install mysql"
  echo "   Ubuntu: sudo apt install mysql-server"
  exit 1
fi
echo "✅ MySQL found"

# ── Setup .env ─────────────────────────────────────────────
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo ""
  echo "📝 Created backend/.env — please fill in:"
  echo "   - BINANCE_API_KEY"
  echo "   - BINANCE_API_SECRET"
  echo "   - DB_PASSWORD"
  echo ""
  echo "   (Keep USE_TESTNET=true until you're ready for live trading)"
  echo ""
  read -p "Press ENTER after editing backend/.env to continue..."
fi

# ── Read DB password from .env ─────────────────────────────
DB_PASS=$(grep '^DB_PASSWORD' backend/.env | cut -d'=' -f2)
DB_USER=$(grep '^DB_USER'     backend/.env | cut -d'=' -f2)
DB_USER=${DB_USER:-root}

# ── Create database ────────────────────────────────────────
echo ""
echo "🗄️  Setting up MySQL database..."
mysql -u "$DB_USER" -p"$DB_PASS" < backend/setup.sql
echo "✅ Database ready"

# ── Install backend dependencies ───────────────────────────
echo ""
echo "📦 Installing backend packages..."
cd backend && npm install && cd ..
echo "✅ Backend packages installed"

# ── Install frontend dependencies ──────────────────────────
echo ""
echo "📦 Installing frontend packages..."
cd frontend && npm install && cd ..
echo "✅ Frontend packages installed"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║            Setup Complete! ✅         ║"
echo "╠══════════════════════════════════════╣"
echo "║  Start backend:                      ║"
echo "║    cd backend && npm start           ║"
echo "║                                      ║"
echo "║  Start frontend (new terminal):      ║"
echo "║    cd frontend && npm start          ║"
echo "║                                      ║"
echo "║  Dashboard: http://localhost:3001    ║"
echo "╚══════════════════════════════════════╝"
echo ""
