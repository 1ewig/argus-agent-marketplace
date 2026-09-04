'use client';

import { useContext, useState } from 'react';
import { ExecutionModeContext } from '@/context/execution-mode-context';
import type { ExecutionMode } from '@/lib/types';

/**
 * Custom hook to manage or access the Binance Agent OS execution mode (simulation vs live_mcp).
 * Automatically consumes the global ExecutionModeContext when mounted inside ExecutionModeProvider,
 * with graceful fallback to isolated local state when used independently.
 * 
 * @param initialMode - Initial execution mode, defaulting to 'simulation'
 * @returns Execution mode state and state modifier functions
 */
export function useExecutionMode(initialMode: ExecutionMode = 'simulation') {
  const context = useContext(ExecutionModeContext);
  const [localMode, setLocalMode] = useState<ExecutionMode>(initialMode);

  if (context) {
    return context;
  }

  return {
    executionMode: localMode,
    setExecutionMode: setLocalMode,
    isSimulation: localMode === 'simulation',
    isLiveMcp: localMode === 'live_mcp',
  };
}
