'use client';

import { useAppStore } from '@/stores/app-store';

/**
 * Custom hook to manage or access the Binance Agent OS execution mode (paper trading sandbox).
 * Backed by the global Zustand app store to guarantee zero re-render flashes or state loss.
 * 
 * @returns Execution mode state and state modifier functions
 */
export function useExecutionMode() {
  const executionMode = useAppStore((state) => state.executionMode);
  const setExecutionMode = useAppStore((state) => state.setExecutionMode);

  return {
    executionMode,
    setExecutionMode,
    isSimulation: true,
    isLiveMcp: false,
  };
}
