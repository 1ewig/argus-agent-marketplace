'use client';

import React, { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition } from '@/constants/animation';
import { useTheme, useSidebar, useChatSessions } from '@/hooks';
import {
  SidebarHeader,
  SidebarNavViews,
  SidebarSessionList,
  SidebarThemeToggle,
} from './sidebar';

const noopSubscribe = () => () => {};

/**
 * LeftSidebar Orchestrator Component
 */
export function LeftSidebar() {
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

  const {
    conversations,
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

  useEffect(() => {
    if (isSidebarCollapsed && editingId) {
      handleCancelRename();
    }
  }, [isSidebarCollapsed, editingId, handleCancelRename]);

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

  const handleSelectSessionMobile = useCallback(
    (id: string) => {
      handleSelectSession(id);
      closeMobileSidebar();
    },
    [handleSelectSession, closeMobileSidebar]
  );

  return (
    <>
      {/* Desktop Persistent Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 68 : 280 }}
        transition={hasMounted ? sidebarSpringTransition : { duration: 0 }}
        className="hidden md:flex h-full bg-theme-bg-surface border-r border-theme-border-subtle flex-col shrink-0 select-none z-30 overflow-hidden relative will-change-[width]"
      >
        <SidebarHeader
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        <SidebarNavViews
          isCollapsed={isSidebarCollapsed}
          isActive={true}
        />

        <SidebarSessionList
          conversations={conversations}
          activeConversationId={activeConversationId}
          editingId={editingId}
          editTitle={editTitle}
          isCollapsed={isSidebarCollapsed}
          onSelectSession={handleSelectSession}
          onStartRename={handleStartRename}
          onSaveRename={handleSaveRename}
          onCancelRename={handleCancelRename}
          onEditTitleChange={setEditTitle}
          onOpenDelete={handleOpenDeleteDialog}
        />

        <SidebarThemeToggle
          isCollapsed={isSidebarCollapsed}
          isDark={isDark}
          onToggle={toggleTheme}
        />
      </motion.aside>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
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
              <SidebarHeader
                isCollapsed={false}
                onToggle={closeMobileSidebar}
              />

              <SidebarNavViews
                isCollapsed={false}
                isActive={true}
                onClick={closeMobileSidebar}
              />

              <SidebarSessionList
                conversations={conversations}
                activeConversationId={activeConversationId}
                editingId={editingId}
                editTitle={editTitle}
                isCollapsed={false}
                onSelectSession={handleSelectSessionMobile}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onEditTitleChange={setEditTitle}
                onOpenDelete={handleOpenDeleteDialog}
              />

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
