'use client';

import React, { createContext, useContext, useState } from 'react';
import type { ExecutionMode } from '@/lib/types';

export interface ExecutionModeContextType {
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;
  isSimulation: boolean;
  isLiveMcp: boolean;
}

export const ExecutionModeContext = createContext<ExecutionModeContextType | null>(null);

export interface ExecutionModeProviderProps {
  children: React.ReactNode;
  initialMode?: ExecutionMode;
}

export function ExecutionModeProvider({
  children,
  initialMode = 'simulation',
}: ExecutionModeProviderProps) {
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(initialMode);

  return (
    <ExecutionModeContext.Provider
      value={{
        executionMode,
        setExecutionMode,
        isSimulation: executionMode === 'simulation',
        isLiveMcp: executionMode === 'live_mcp',
      }}
    >
      {children}
    </ExecutionModeContext.Provider>
  );
}

export function useExecutionModeContext(): ExecutionModeContextType {
  const context = useContext(ExecutionModeContext);
  if (!context) {
    throw new Error('useExecutionModeContext must be used within an ExecutionModeProvider');
  }
  return context;
}
