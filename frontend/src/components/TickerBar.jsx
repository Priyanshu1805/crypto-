// components/TickerBar.jsx
import React from 'react';
import { fmt, fmtPct, SYMBOLS, COLORS } from '../utils/format';

export default function TickerBar({ prices }) {
  return (
    <div style={{
      display: 'flex', gap: 24, padding: '10px 20px',
      borderBottom: `1px solid ${COLORS.border}`,
      background: '#14141a', overflowX: 'auto',
    }}>
      {SYMBOLS.map(sym => {
        const d  = prices[sym] || {};
        const up = (d.change_pct || 0) >= 0;
        return (
          <div key={sym} style={{ display: 'flex', gap: 10, alignItems: 'baseline', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>{sym}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>${fmt(d.price)}</span>
            <span style={{ fontSize: 12, color: up ? COLORS.green : COLORS.red }}>
              {up ? '▲' : '▼'} {fmtPct(d.change_pct)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
