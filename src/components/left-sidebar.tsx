'use client';

import React, { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition } from '@/constants/animation';
import { useTheme, useSidebar } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import {
  SidebarHeader,
  SidebarNavViews,
  SidebarSessionList,
  SidebarThemeToggle,
} from './sidebar';

const noopSubscribe = () => () => {};

/**
 * LeftSidebar Orchestrator Component
 *
 * Coordinates layout width animations, theme toggling, symbol workspace navigation,
 * and deletion confirmation while delegating presentation to modular subcomponents.
 */
export function LeftSidebar() {
  const { isDark, toggleTheme } = useTheme();
  const stageView = useAppStore((state) => state.stageView);
  const setStageView = useAppStore((state) => state.setStageView);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const hasMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const {
    conversations,
    symbolGroups,
    activeConversationId,
    editingId,
    editTitle,
    setEditTitle,
    handleSelectSession,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    handleNewSession,
    isNewChatDisabled,
  } = useChatSessions();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Edge Case Guard: cancel renaming if sidebar is collapsed while an input is open
  useEffect(() => {
    if (isSidebarCollapsed && editingId) {
      handleCancelRename();
    }
  }, [isSidebarCollapsed, editingId, handleCancelRename]);

  const targetDeleteConversation = conversations.find((c) => c.id === deleteTargetId);

  const handleOpenDeleteDialog = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTargetId) {
      await handleDeleteSession(deleteTargetId);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, handleDeleteSession]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const handleSelectSessionClick = useCallback(
    (id: string) => {
      setStageView('agent');
      handleSelectSession(id);
    },
    [setStageView, handleSelectSession]
  );

  const handleNewChatInSymbol = useCallback(
    async (symbol: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setStageView('agent');
      await handleNewSession(symbol);
    },
    [setStageView, handleNewSession]
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 68 : 280 }}
        transition={hasMounted ? sidebarSpringTransition : { duration: 0 }}
        className="h-full bg-theme-bg-surface border-r border-theme-border-subtle flex flex-col shrink-0 select-none z-30 overflow-hidden relative"
      >
        {/* 1. Top Header & Brand */}
        <SidebarHeader
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* 2. Workspace Views Navigation */}
        <SidebarNavViews
          isCollapsed={isSidebarCollapsed}
          stageView={stageView}
          onViewSelect={setStageView}
        />

        {/* 3. Conversation Symbol Workspaces List */}
        <SidebarSessionList
          groups={symbolGroups}
          activeConversationId={activeConversationId}
          activeSymbol={selectedSymbol}
          editingId={editingId}
          editTitle={editTitle}
          isCollapsed={isSidebarCollapsed}
          isNewChatDisabled={isNewChatDisabled}
          onSelectSession={handleSelectSessionClick}
          onStartRename={handleStartRename}
          onSaveRename={handleSaveRename}
          onCancelRename={handleCancelRename}
          onEditTitleChange={setEditTitle}
          onOpenDelete={handleOpenDeleteDialog}
          onNewChatInSymbol={handleNewChatInSymbol}
        />

        {/* 4. Bottom Theme Toggle Utility */}
        <SidebarThemeToggle
          isCollapsed={isSidebarCollapsed}
          isDark={isDark}
          onToggle={toggleTheme}
        />
      </motion.aside>

      {/* Delete Chat Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title={APP_CONTENT.sidebar.deleteDialogTitle}
        description={APP_CONTENT.sidebar.deleteDialogDescription(targetDeleteConversation?.title)}
        confirmLabel={APP_CONTENT.sidebar.deleteDialogConfirm}
        cancelLabel={APP_CONTENT.sidebar.deleteDialogCancel}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}