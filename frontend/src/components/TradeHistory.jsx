// components/TradeHistory.jsx
import React from 'react';
import { fmt, COLORS } from '../utils/format';

export default function TradeHistory({ trades }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Trade History</div>
      {trades.length === 0
        ? <div style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', padding: '20px 0' }}>No trades yet</div>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ color: COLORS.muted }}>
                  {['Symbol','Side','Qty','Price','SL','TP','Status','Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                    <td style={td}>{t.symbol}</td>
                    <td style={td}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: t.side === 'BUY' ? 'rgba(29,158,117,0.15)' : 'rgba(216,90,48,0.15)',
                        color: t.side === 'BUY' ? COLORS.green : COLORS.red,
                      }}>{t.side}</span>
                    </td>
                    <td style={td}>{t.quantity}</td>
                    <td style={td}>${fmt(t.price)}</td>
                    <td style={{ ...td, color: COLORS.red }}>${fmt(t.stop_loss)}</td>
                    <td style={{ ...td, color: COLORS.green }}>${fmt(t.take_profit)}</td>
                    <td style={td}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 4, fontSize: 11,
                        background: t.status === 'FILLED' ? 'rgba(29,158,117,0.15)' : 'rgba(186,117,23,0.15)',
                        color: t.status === 'FILLED' ? COLORS.green : COLORS.amber,
                      }}>{t.status}</span>
                    </td>
                    <td style={{ ...td, color: COLORS.muted }}>
                      {new Date(t.created_at).toLocaleTimeString('en-US', { hour12: false })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

const td = { padding: '8px 8px', color: '#e8e8e4' };
