'use client';

import { useCallback, useEffect, useState } from 'react';
import { ORDERS_UPDATED_EVENT } from '@/app/lib/orderStatus';

export function usePendingOrderCount(pollIntervalMs = 30000) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/pending-count');
      if (!res.ok) return;
      const data = await res.json();
      setCount(typeof data.count === 'number' ? data.count : 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(ORDERS_UPDATED_EVENT, onUpdate);
    const interval = setInterval(refresh, pollIntervalMs);
    return () => {
      window.removeEventListener(ORDERS_UPDATED_EVENT, onUpdate);
      clearInterval(interval);
    };
  }, [refresh, pollIntervalMs]);

  return { count, refresh };
}
