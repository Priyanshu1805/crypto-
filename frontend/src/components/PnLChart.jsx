// components/PnLChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { fmt, API, COLORS } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function PnLChart() {
  const [pnl,    setPnl]    = useState({ bySymbol: [], daily: [] });
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/pnl`)
      .then(r => r.json())
      .then(j => { if (j.success) setPnl(j); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPnL = pnl.bySymbol.reduce((s, r) => s + parseFloat(r.pnl || 0), 0);

  const barData = {
    labels: pnl.daily.map(r => r.date),
    datasets: [{
      data:            pnl.daily.map(r => parseFloat(r.pnl || 0)),
      backgroundColor: pnl.daily.map(r => parseFloat(r.pnl) >= 0 ? 'rgba(29,158,117,0.7)' : 'rgba(216,90,48,0.7)'),
      borderRadius:    4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: ctx => `P&L: $${fmt(ctx.raw)}` },
      backgroundColor: '#1e1e26', bodyColor: COLORS.text, borderColor: COLORS.border, borderWidth: 1,
    }},
    scales: {
      x: { ticks: { color: COLORS.muted, font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: COLORS.muted, font: { size: 10 }, callback: v => '$' + v }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  return (
    <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>P&L Tracker</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: totalPnL >= 0 ? COLORS.green : COLORS.red }}>
          {totalPnL >= 0 ? '+' : ''}${fmt(totalPnL)}
        </span>
      </div>

      {/* Per-symbol breakdown */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {pnl.bySymbol.length === 0 && !loading && (
          <span style={{ fontSize: 12, color: COLORS.muted }}>No filled trades yet</span>
        )}
        {pnl.bySymbol.map(r => {
          const v = parseFloat(r.pnl || 0);
          return (
            <div key={r.symbol} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 12px', fontSize: 12,
            }}>
              <div style={{ color: COLORS.muted, marginBottom: 2 }}>{r.symbol}</div>
              <div style={{ color: v >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>
                {v >= 0 ? '+' : ''}${fmt(v)}
              </div>
              <div style={{ color: COLORS.muted, fontSize: 11 }}>{r.trade_count} trades</div>
            </div>
          );
        })}
      </div>

      {/* Daily bar chart */}
      {pnl.daily.length > 0 && (
        <div style={{ height: 120, position: 'relative' }}>
          <Bar data={barData} options={options} />
        </div>
      )}
    </div>
  );
}
