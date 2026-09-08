'use client';

import React, { useCallback } from 'react';
import { useChatSessions } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { ChatClient } from './chat';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

/**
 * Main orchestrator for the dashboard layout, header controls, and workspace stages.
 * Pure layout shell hosting ChatClient.
 */
export function DashboardClient({ mode = 'simulation' }: DashboardClientProps) {
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);

  const cleanSymbol = normalizeSymbolForDisplay(selectedSymbol) || 'BTCUSDT';
  const isGlobalWorkspace = isGlobalSymbol(cleanSymbol);

  const { isNewChatDisabled, handleNewSession } = useChatSessions();

  const handleOpenSymbolSearch = useCallback(() => {
    setIsSymbolSearchOpen(true);
  }, [setIsSymbolSearchOpen]);

  const handleNewChat = useCallback(() => {
    handleNewSession();
  }, [handleNewSession]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      <DashboardHeader
        symbol={cleanSymbol}
        isGlobal={isGlobalWorkspace}
        isNewChatDisabled={isNewChatDisabled}
        onToggleMobileSidebar={toggleMobileSidebar}
        onOpenSymbolSearch={handleOpenSymbolSearch}
        onNewChat={handleNewChat}
      />

      <div className="relative flex-1 min-h-0 w-full flex flex-row overflow-hidden">
        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <ChatClient mode={mode} />
        </div>
      </div>
    </div>
  );
}

