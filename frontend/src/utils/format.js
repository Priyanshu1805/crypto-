// utils/format.js

export const fmt   = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtPct = n => (n >= 0 ? '+' : '') + Number(n || 0).toFixed(2) + '%';
export const fmtVol = n => {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Number(n).toFixed(2);
};
export const timeNow = () => new Date().toLocaleTimeString('en-US', { hour12: false });

export const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const WS  = process.env.REACT_APP_WS_URL  || 'ws://localhost:3000';
export const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

export const COLORS = {
  blue:   '#378add',
  green:  '#1d9e75',
  red:    '#d85a30',
  amber:  '#ba7517',
  border: 'rgba(255,255,255,0.08)',
  card:   '#1a1a1f',
  bg:     '#0f0f11',
  text:   '#e8e8e4',
  muted:  '#888780',
};
