'use client';

import { useState } from 'react';
import type { ExecutionMode } from '@/lib/types';

/**
 * Custom hook to manage the Binance Agent OS execution mode (simulation vs live_mcp)
 * 
 * @param initialMode - Initial execution mode, defaulting to 'simulation'
 * @returns Execution mode state and state modifier functions
 */
export function useExecutionMode(initialMode: ExecutionMode = 'simulation') {
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(initialMode);

  return {
    executionMode,
    setExecutionMode,
    isSimulation: executionMode === 'simulation',
    isLiveMcp: executionMode === 'live_mcp',
  };
}
