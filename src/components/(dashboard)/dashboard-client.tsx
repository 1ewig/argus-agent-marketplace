'use client';

import React, { useCallback } from 'react';
import { useChatSessions } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { ChatClient } from './chat';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

/**
 * Main orchestrator for the dashboard layout.
 */
export function DashboardClient({ mode = 'simulation' }: DashboardClientProps) {
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);

  const { isNewChatDisabled, handleNewSession } = useChatSessions();

  const handleNewChat = useCallback(() => {
    handleNewSession();
  }, [handleNewSession]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      <DashboardHeader
        isNewChatDisabled={isNewChatDisabled}
        onToggleMobileSidebar={toggleMobileSidebar}
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
