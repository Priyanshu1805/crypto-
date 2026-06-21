// hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

export default function useWebSocket(url) {
  const [status, setStatus]   = useState('connecting');
  const [lastMsg, setLastMsg] = useState(null);
  const wsRef    = useRef(null);
  const retryRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('live');
        if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
      };

      ws.onmessage = e => {
        try { setLastMsg(JSON.parse(e.data)); } catch {}
      };

      ws.onclose = () => {
        setStatus('reconnecting');
        retryRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    } catch {
      setStatus('error');
      retryRef.current = setTimeout(connect, 5000);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status, lastMsg };
}
