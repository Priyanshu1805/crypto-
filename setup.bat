@echo off
echo.
echo ╔══════════════════════════════════════╗
echo ║       CryptoDesk Setup (Windows)    ║
echo ╚══════════════════════════════════════╝
echo.

REM Check Node
node -v >nul 2>&1 || (echo ❌ Node.js not found. Install from nodejs.org && pause && exit /b)
echo ✅ Node.js found

REM Copy .env
if not exist backend\.env (
  copy backend\.env.example backend\.env
  echo.
  echo 📝 Created backend\.env
  echo    Please open it and fill in:
  echo      BINANCE_API_KEY, BINANCE_API_SECRET, DB_PASSWORD
  echo.
  notepad backend\.env
  pause
)

REM Install backend
echo 📦 Installing backend...
cd backend && npm install && cd ..
echo ✅ Backend ready

REM Install frontend
echo 📦 Installing frontend...
cd frontend && npm install && cd ..
echo ✅ Frontend ready

echo.
echo ╔══════════════════════════════════════╗
echo ║  Done! Now run in TWO terminals:    ║
echo ║  1. cd backend ^&^& npm start          ║
echo ║  2. cd frontend ^&^& npm start         ║
echo ║  Open: http://localhost:3001         ║
echo ╚══════════════════════════════════════╝
pause
