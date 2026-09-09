'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db, triggerAgentExecutionCycle } from '@/lib/db';

const DEFAULT_TICK_INTERVAL_MS = 15000; // 15 seconds

export interface UseAutoExecutionTickerOptions {
  intervalMs?: number;
  initialEnabled?: boolean;
}

export function useAutoExecutionTicker({
  intervalMs = DEFAULT_TICK_INTERVAL_MS,
  initialEnabled = true,
}: UseAutoExecutionTickerOptions = {}) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [lastTickTime, setLastTickTime] = useState<number | null>(null);
  const isExecutingRef = useRef(false);

  const triggerAllActiveCycles = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    try {
      const activeAgents = await db.hiredAgents
        .where('status')
        .equals('active')
        .toArray();

      if (activeAgents.length > 0) {
        // Run cycles in sequence to avoid database locking contention
        for (const agent of activeAgents) {
          await triggerAgentExecutionCycle(agent.id);
        }
        setLastTickTime(Date.now());
      }
    } catch (err) {
      console.error('[AutoExecutionTicker] Error cycling agents:', err);
    } finally {
      isExecutingRef.current = false;
    }
  }, []);

  const toggleTicker = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const timer = setInterval(() => {
      triggerAllActiveCycles();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isEnabled, intervalMs, triggerAllActiveCycles]);

  return {
    isEnabled,
    toggleTicker,
    triggerAllActiveCycles,
    lastTickTime,
  };
}
