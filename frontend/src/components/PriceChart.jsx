// components/PriceChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { fmt, API, COLORS } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const INTERVALS = ['1m','5m','15m','1h','4h','1d'];

export default function PriceChart({ symbol, liveHistory }) {
  const [interval, setInterval] = useState('1m');
  const [candles,  setCandles]  = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/candles?symbol=${symbol}&interval=${interval}&limit=60`);
        const j   = await res.json();
        if (j.success) setCandles(j.data);
      } catch {}
    }
    load();
  }, [symbol, interval]);

  // Merge DB candles with live WebSocket ticks
  const hist = liveHistory[symbol] || { labels: [], prices: [] };
  const useLive = hist.prices.length > 0;

  const chartData = {
    labels: useLive ? hist.labels : candles.map(c => {
      const d = new Date(c.time);
      return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    }),
    datasets: [{
      data:            useLive ? hist.prices : candles.map(c => c.close),
      borderColor:     COLORS.blue,
      borderWidth:     1.5,
      pointRadius:     0,
      fill:            true,
      backgroundColor: 'rgba(55,138,221,0.06)',
      tension:         0.3,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: ctx => `$${fmt(ctx.raw)}` },
      backgroundColor: '#1e1e26',
      titleColor: COLORS.muted,
      bodyColor: COLORS.text,
      borderColor: COLORS.border,
      borderWidth: 1,
    }},
    scales: {
      x: { ticks: { color: COLORS.muted, font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: COLORS.muted, font: { size: 10 }, callback: v => '$' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  return (
    <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: COLORS.muted }}>
          {symbol} — {useLive ? <span style={{ color: COLORS.green }}>● Live</span> : interval}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {INTERVALS.map(iv => (
            <button key={iv} onClick={() => setInterval(iv)} style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: interval === iv ? COLORS.blue : 'rgba(255,255,255,0.06)',
              color: interval === iv ? '#fff' : COLORS.muted,
            }}>{iv}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 240, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
