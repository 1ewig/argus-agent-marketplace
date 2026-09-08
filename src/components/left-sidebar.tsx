'use client';

import React, { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition } from '@/constants/animation';
import { useTheme, useSidebar, useChatSessions } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
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
 * Single orchestrator for sidebar layout animations, theme toggles,
 * symbol workspace collapsing, session selections, deletion confirmation dialogs,
 * and responsive mobile drawer presentation.
 * Delegates presentation exclusively to pure reusable subcomponents.
 */
export function LeftSidebar() {
  // Theme & sidebar layout hooks
  const { isDark, toggleTheme } = useTheme();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    closeMobileSidebar,
  } = useSidebar();
  const hasMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  // App store subscriptions
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const collapsedWorkspaceGroups = useAppStore((state) => state.collapsedWorkspaceGroups);
  const toggleWorkspaceGroupCollapsed = useAppStore((state) => state.toggleWorkspaceGroupCollapsed);
  const setWorkspaceGroupCollapsed = useAppStore((state) => state.setWorkspaceGroupCollapsed);


  // Chat sessions orchestration hook
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
  } = useChatSessions();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Edge Case Guard: cancel renaming if sidebar is collapsed while an input is open
  useEffect(() => {
    if (isSidebarCollapsed && editingId) {
      handleCancelRename();
    }
  }, [isSidebarCollapsed, editingId, handleCancelRename]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen, closeMobileSidebar]);

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

  const handleToggleWorkspaceGroup = useCallback(
    (symbol: string) => {
      toggleWorkspaceGroupCollapsed(symbol);
    },
    [toggleWorkspaceGroupCollapsed]
  );

  const handleSelectSessionClick = useCallback(
    (id: string) => {
      const targetConv = conversations.find((c) => c.id === id);
      if (targetConv?.symbol) {
        setWorkspaceGroupCollapsed(targetConv.symbol, false);
      }
      handleSelectSession(id);
    },
    [conversations, setWorkspaceGroupCollapsed, handleSelectSession]
  );

  const handleSelectSessionMobile = useCallback(
    (id: string) => {
      handleSelectSessionClick(id);
      closeMobileSidebar();
    },
    [handleSelectSessionClick, closeMobileSidebar]
  );

  return (
    <>
      {/* 1. Desktop Persistent Collapsible Sidebar (Hidden on mobile) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 68 : 280 }}
        transition={hasMounted ? sidebarSpringTransition : { duration: 0 }}
        className="hidden md:flex h-full bg-theme-bg-surface border-r border-theme-border-subtle flex-col shrink-0 select-none z-30 overflow-hidden relative will-change-[width]"
      >
        {/* Top Header & Brand */}
        <SidebarHeader
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* Workspace Views Navigation */}
        <SidebarNavViews
          isCollapsed={isSidebarCollapsed}
          isActive={true}
        />

        {/* Conversation Symbol Workspaces List */}
        <SidebarSessionList
          groups={symbolGroups}
          activeConversationId={activeConversationId}
          activeSymbol={selectedSymbol}
          collapsedWorkspaceGroups={collapsedWorkspaceGroups}
          editingId={editingId}
          editTitle={editTitle}
          isCollapsed={isSidebarCollapsed}
          onSelectSession={handleSelectSessionClick}
          onToggleWorkspaceGroup={handleToggleWorkspaceGroup}
          onStartRename={handleStartRename}
          onSaveRename={handleSaveRename}
          onCancelRename={handleCancelRename}
          onEditTitleChange={setEditTitle}
          onOpenDelete={handleOpenDeleteDialog}
        />

        {/* Bottom Theme Toggle Utility */}
        <SidebarThemeToggle
          isCollapsed={isSidebarCollapsed}
          isDark={isDark}
          onToggle={toggleTheme}
        />
      </motion.aside>

      {/* 2. Mobile Optimized Slide-Over Drawer & Backdrop Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              key="mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-theme-bg-overlay/80 backdrop-blur-xs z-50 md:hidden"
              aria-hidden="true"
            />

            {/* Slide-Over Drawer */}
            <motion.aside
              key="mobile-sidebar-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={APP_CONTENT.sidebar.brand}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] sm:w-[320px] max-w-[85vw] h-dvh max-h-dvh bg-theme-bg-surface border-r border-theme-border-subtle z-50 flex flex-col md:hidden select-none overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* Top Header & Brand with Close Action */}
              <SidebarHeader
                isCollapsed={false}
                onToggle={closeMobileSidebar}
              />

              {/* Workspace Views Navigation */}
              <SidebarNavViews
                isCollapsed={false}
                isActive={true}
                onClick={closeMobileSidebar}
              />

              {/* Conversation Symbol Workspaces List */}
              <SidebarSessionList
                groups={symbolGroups}
                activeConversationId={activeConversationId}
                activeSymbol={selectedSymbol}
                collapsedWorkspaceGroups={collapsedWorkspaceGroups}
                editingId={editingId}
                editTitle={editTitle}
                isCollapsed={false}
                onSelectSession={handleSelectSessionMobile}
                onToggleWorkspaceGroup={handleToggleWorkspaceGroup}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onEditTitleChange={setEditTitle}
                onOpenDelete={handleOpenDeleteDialog}
              />

              {/* Bottom Theme Toggle Utility */}
              <SidebarThemeToggle
                isCollapsed={false}
                isDark={isDark}
                onToggle={toggleTheme}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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