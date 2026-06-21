// App.jsx — CryptoDesk full dashboard
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TickerBar    from './components/TickerBar';
import PriceChart   from './components/PriceChart';
import OrderForm    from './components/OrderForm';
import TradeHistory from './components/TradeHistory';
import PnLChart     from './components/PnLChart';
import Portfolio    from './components/Portfolio';
import Toast        from './components/Toast';
import useWebSocket from './hooks/useWebSocket';
import { API, WS, SYMBOLS, COLORS, fmt, fmtPct, timeNow } from './utils/format';

const TABS = ['Dashboard', 'Trades', 'P&L', 'Portfolio'];

export default function App() {
  const [tab,    setTab]    = useState('Dashboard');
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState([]);
  const [toast,  setToast]  = useState(null);

  // Chart history: rolling 60-tick buffer per symbol
  const liveHistory = useRef({});

  // WebSocket
  const { status, lastMsg } = useWebSocket(WS);

  // Handle incoming WS messages
  useEffect(() => {
    if (!lastMsg) return;
    if (lastMsg.type === 'PRICE_UPDATE') {
      const { symbol, price, change_pct } = lastMsg;
      setPrices(prev => ({
        ...prev,
        [symbol]: { ...prev[symbol], price, change_pct },
      }));
      if (!liveHistory.current[symbol])
        liveHistory.current[symbol] = { labels: [], prices: [] };
      const h = liveHistory.current[symbol];
      h.labels.push(timeNow());
      h.prices.push(price);
      if (h.labels.length > 60) { h.labels.shift(); h.prices.shift(); }
    }
  }, [lastMsg]);

  // Fetch initial market data + trades
  useEffect(() => {
    fetch(`${API}/api/market-data`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          const map = {};
          j.data.forEach(d => { map[d.symbol] = d; });
          setPrices(map);
        }
      }).catch(() => {});
    loadTrades();
  }, []);

  const loadTrades = () => {
    fetch(`${API}/api/trades`)
      .then(r => r.json())
      .then(j => { if (j.success) setTrades(j.data.slice(0, 30)); })
      .catch(() => {});
  };

  const handleOrderPlaced = useCallback((result) => {
    const r = result.risk;
    setToast({
      type: 'success',
      msg: `✅ Order placed — SL: $${fmt(r.slPrice)} · TP: $${fmt(r.tpPrice)} · R:R ${r.rrRatio}`,
    });
    loadTrades();
  }, []);

  const [activeSym, setActiveSym] = useState('BTCUSDT');

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}`,
        background: '#14141a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>₿ CryptoDesk</span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
            background: status === 'live' ? 'rgba(29,158,117,0.2)' : 'rgba(186,117,23,0.2)',
            color:      status === 'live' ? COLORS.green             : COLORS.amber,
          }}>
            {status === 'live' ? '● LIVE' : '◌ ' + status.toUpperCase()}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 14px', fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? 'rgba(55,138,221,0.2)' : 'transparent',
              color:      tab === t ? COLORS.blue              : COLORS.muted,
              fontWeight: tab === t ? 600 : 400,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Ticker bar */}
      <TickerBar prices={prices} />

      {/* Main content */}
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>

        {tab === 'Dashboard' && (
          <>
            {/* Symbol selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {SYMBOLS.map(s => {
                const d  = prices[s] || {};
                const up = (d.change_pct || 0) >= 0;
                return (
                  <button key={s} onClick={() => setActiveSym(s)} style={{
                    padding: '8px 16px', borderRadius: 8, border: `1px solid`,
                    borderColor: activeSym === s ? COLORS.blue : COLORS.border,
                    background:  activeSym === s ? 'rgba(55,138,221,0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>{s}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>${fmt(d.price)}</div>
                    <div style={{ fontSize: 11, color: up ? COLORS.green : COLORS.red }}>{fmtPct(d.change_pct)}</div>
                  </button>
                );
              })}
            </div>

            {/* Chart + Order form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 14, marginBottom: 14 }}>
              <PriceChart symbol={activeSym} liveHistory={liveHistory.current} />
              <OrderForm  prices={prices} onOrderPlaced={handleOrderPlaced} />
            </div>

            {/* Recent trades preview */}
            <TradeHistory trades={trades.slice(0, 6)} />
          </>
        )}

        {tab === 'Trades'    && <TradeHistory trades={trades} />}
        {tab === 'P&L'       && <PnLChart />}
        {tab === 'Portfolio' && <Portfolio />}
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
