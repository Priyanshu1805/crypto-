// components/Portfolio.jsx
import React, { useEffect, useState } from 'react';
import { API, COLORS } from '../utils/format';

export default function Portfolio() {
  const [balances, setBalances] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/api/portfolio`);
      const json = await res.json();
      if (json.success) setBalances(json.data);
      else setError(json.error);
    } catch (e) {
      setError('Could not fetch portfolio — check backend connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Portfolio</span>
        <button onClick={load} style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 6, border: `1px solid ${COLORS.border}`,
          background: 'transparent', color: COLORS.muted, cursor: 'pointer',
        }}>↺ Refresh</button>
      </div>

      {loading && <div style={{ fontSize: 13, color: COLORS.muted }}>Loading balances…</div>}
      {error   && <div style={{ fontSize: 12, color: '#f09595' }}>{error}</div>}

      {!loading && !error && balances.length === 0 && (
        <div style={{ fontSize: 13, color: COLORS.muted }}>No non-zero balances found</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {balances.map(b => (
          <div key={b.asset} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{b.asset}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13 }}>{b.total.toFixed(6)}</div>
              {b.locked > 0 && (
                <div style={{ fontSize: 11, color: COLORS.muted }}>
                  {b.free.toFixed(6)} free · {b.locked.toFixed(6)} locked
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
