// components/Toast.jsx
import React, { useEffect } from 'react';
import { COLORS } from '../utils/format';

export default function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;

  const colors = {
    success: { bg: 'rgba(29,158,117,0.15)', border: COLORS.green, text: '#6dd9b2' },
    error:   { bg: 'rgba(216,90,48,0.15)',  border: COLORS.red,   text: '#f09595' },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 10, padding: '12px 16px', fontSize: 13,
      maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      {msg}
      <span onClick={onClose} style={{ marginLeft: 12, cursor: 'pointer', opacity: 0.6 }}>✕</span>
    </div>
  );
}
