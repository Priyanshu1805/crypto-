// components/OrderForm.jsx
import React, { useState } from 'react';
import { fmt, API, SYMBOLS, COLORS } from '../utils/format';

export default function OrderForm({ prices, onOrderPlaced }) {
  const [form, setForm] = useState({
    symbol: 'BTCUSDT', type: 'LIMIT',
    quantity: '0.001', stopLoss: '2', takeProfit: '5',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (side) => {
    setError('');
    const price = prices[form.symbol]?.price;
    if (!price) return setError('Price not available yet — wait for connection');

    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/trade`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, side, price }),
      });
      const json = await res.json();
      if (json.success) {
        onOrderPlaced(json);
      } else {
        setError(json.error);
      }
    } catch (e) {
      setError('Server error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const cur = prices[form.symbol];

  const field = (label, key, type = 'text', opts = null) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: COLORS.muted, display: 'block', marginBottom: 4 }}>{label}</label>
      {opts ? (
        <select value={form[key]} onChange={e => set(key, e.target.value)} style={inputStyle}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} step="any" style={inputStyle} />
      )}
    </div>
  );

  return (
    <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Place Order</div>

      {field('Symbol',      'symbol',     'text',   SYMBOLS)}
      {field('Order type',  'type',       'text',   ['LIMIT','MARKET'])}
      {field('Quantity',    'quantity',   'number')}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Stop loss %</label>
          <input type="number" value={form.stopLoss}   onChange={e => set('stopLoss', e.target.value)}   step="0.1" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Take profit %</label>
          <input type="number" value={form.takeProfit} onChange={e => set('takeProfit', e.target.value)} step="0.1" style={inputStyle} />
        </div>
      </div>

      {cur && (
        <div style={{ fontSize: 11, color: COLORS.muted, margin: '10px 0', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
          Current: <strong style={{ color: COLORS.text }}>${fmt(cur.price)}</strong>
          &nbsp;·&nbsp; SL: <span style={{ color: COLORS.red }}>${fmt(cur.price * (1 - form.stopLoss/100))}</span>
          &nbsp;·&nbsp; TP: <span style={{ color: COLORS.green }}>${fmt(cur.price * (1 + form.takeProfit/100))}</span>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12, color: '#f09595', background: 'rgba(240,149,149,0.1)', borderRadius: 6, padding: '8px 10px', marginBottom: 10 }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <button onClick={() => submit('buy')}  disabled={loading} style={{ ...btnBase, background: COLORS.green }}>
          {loading ? '...' : '▲ BUY'}
        </button>
        <button onClick={() => submit('sell')} disabled={loading} style={{ ...btnBase, background: COLORS.red }}>
          {loading ? '...' : '▼ SELL'}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '7px 10px', fontSize: 13,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, color: '#e8e8e4', outline: 'none',
};

const btnBase = {
  padding: '10px 0', fontSize: 13, fontWeight: 600,
  border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff',
};
