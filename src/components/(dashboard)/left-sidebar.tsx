'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Bot,
  LineChart,
  Sun,
  Moon,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ArgusIcon } from '@/components/common';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { APP_CONTENT } from '@/constants/content';
import {
  tapScaleButton,
  tapScaleIcon,
  tapScalePill,
  sidebarSpringTransition,
  sidebarContentVariants,
} from '@/constants/animation';
import { useTheme } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
import { useChatSessions } from '@/hooks/use-chat-sessions';

/**
 * Architectural Left Navigation Sidebar.
 * Houses workspace branding, view navigation, full conversation history,
 * collapsible rail controls, and theme toggling with 60fps spring animations.
 */
export function LeftSidebar() {
  const { isDark, toggleTheme } = useTheme();
  const stageView = useAppStore((state) => state.stageView);
  const setStageView = useAppStore((state) => state.setStageView);
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

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
    handleNewSession,
  } = useChatSessions();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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

  const handleNewChatClick = useCallback(async () => {
    setStageView('agent');
    await handleNewSession();
  }, [setStageView, handleNewSession]);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 68 : 280 }}
        transition={sidebarSpringTransition}
        className="h-full bg-theme-bg-surface border-r border-theme-border-subtle flex flex-col shrink-0 select-none z-30 overflow-hidden relative"
      >
        {/* 1. Top Brand Header & Collapse Toggle */}
        <div className="h-14 p-spacing-sm px-3 flex items-center justify-between border-b border-theme-border-subtle shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
            <motion.button
              type="button"
              whileTap={tapScaleIcon}
              onClick={() => {
                if (isSidebarCollapsed) toggleSidebar();
              }}
              className="p-1 rounded-lg hover:bg-theme-bg-elevated text-theme-brand-binance shrink-0 cursor-pointer transition-colors"
              title={isSidebarCollapsed ? APP_CONTENT.sidebar.expandSidebar : APP_CONTENT.sidebar.brand}
            >
              <ArgusIcon className="size-6 text-theme-brand-binance" />
            </motion.button>

            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div
                  key="brand-text"
                  variants={sidebarContentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap"
                >
                  <span className="text-sm font-extrabold tracking-tight text-theme-text-primary leading-none">
                    {APP_CONTENT.sidebar.brand}
                  </span>
                  <span className="text-2xs font-semibold text-theme-text-muted leading-tight mt-0.5">
                    {APP_CONTENT.sidebar.subtitle}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={tapScaleIcon}
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated cursor-pointer transition-colors shrink-0"
            title={isSidebarCollapsed ? APP_CONTENT.sidebar.expandSidebar : APP_CONTENT.sidebar.collapseSidebar}
            aria-label={isSidebarCollapsed ? APP_CONTENT.sidebar.expandSidebar : APP_CONTENT.sidebar.collapseSidebar}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </motion.button>
        </div>

        {/* 2. New Chat Action */}
        <div className="p-spacing-sm px-3 border-b border-theme-border-subtle shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={tapScaleButton}
            onClick={handleNewChatClick}
            title={APP_CONTENT.sidebar.newChat}
            className={`w-full flex items-center justify-center rounded-xl bg-theme-brand-binance text-theme-bg-overlay font-bold text-xs cursor-pointer shadow-2xs hover:brightness-105 transition-all ${
              isSidebarCollapsed ? 'p-2' : 'gap-2 py-2 px-3'
            }`}
          >
            <Plus className="size-4 stroke-[2.5] shrink-0" />
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.span
                  key="new-chat-text"
                  variants={sidebarContentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="whitespace-nowrap overflow-hidden"
                >
                  {APP_CONTENT.sidebar.newChat}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* 3. Workspace Views Navigation */}
        <div className="p-spacing-sm px-3 flex flex-col gap-1 border-b border-theme-border-subtle shrink-0">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                key="views-title"
                variants={sidebarContentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-0.5 whitespace-nowrap overflow-hidden"
              >
                {APP_CONTENT.sidebar.viewsTitle}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Agent View Option */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => setStageView('agent')}
            title={APP_CONTENT.sidebar.agentView}
            className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            } ${
              stageView === 'agent'
                ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
            }`}
          >
            <Bot
              className={`size-4 shrink-0 ${
                stageView === 'agent' ? 'text-theme-brand-binance' : 'text-theme-text-muted'
              }`}
            />
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.span
                  key="agent-view-text"
                  variants={sidebarContentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="whitespace-nowrap overflow-hidden"
                >
                  {APP_CONTENT.sidebar.agentView}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Chart View Option */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => setStageView('chart')}
            title={APP_CONTENT.sidebar.chartView}
            className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            } ${
              stageView === 'chart'
                ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
            }`}
          >
            <LineChart
              className={`size-4 shrink-0 ${
                stageView === 'chart' ? 'text-theme-brand-binance' : 'text-theme-text-muted'
              }`}
            />
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.span
                  key="chart-view-text"
                  variants={sidebarContentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="whitespace-nowrap overflow-hidden"
                >
                  {APP_CONTENT.sidebar.chartView}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* 4. Saved Conversations List */}
        <div className="flex-1 flex flex-col min-h-0 p-spacing-sm px-3 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                key="history-title"
                variants={sidebarContentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-0.5 whitespace-nowrap overflow-hidden"
              >
                {APP_CONTENT.sidebar.historyTitle}
              </motion.span>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 mt-1 pr-0.5">
            {conversations.length === 0 ? (
              !isSidebarCollapsed && (
                <span className="text-2xs text-theme-text-muted italic px-2 py-2 whitespace-nowrap">
                  {APP_CONTENT.sidebar.emptyHistory}
                </span>
              )
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isEditing = editingId === conv.id;

                if (isEditing && !isSidebarCollapsed) {
                  return (
                    <div
                      key={conv.id}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl bg-theme-bg-elevated border border-theme-border-strong"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        autoFocus
                        className="flex-1 min-w-0 bg-transparent text-xs text-theme-text-primary font-medium focus:outline-none px-1"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 rounded text-theme-status-success hover:bg-theme-bg-surface cursor-pointer"
                        title={APP_CONTENT.sessions.saveLabel}
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-1 rounded text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-surface cursor-pointer"
                        title={APP_CONTENT.sessions.cancelLabel}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={conv.id}
                    title={conv.title || APP_CONTENT.chat.defaultSessionTitle}
                    onClick={() => {
                      setStageView('agent');
                      handleSelectSession(conv.id);
                    }}
                    className={`group relative flex items-center rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSidebarCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between gap-2 px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-semibold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare
                        className={`size-3.5 shrink-0 ${
                          isActive
                            ? 'text-theme-brand-binance'
                            : 'text-theme-text-muted group-hover:text-theme-text-secondary'
                        }`}
                      />
                      <AnimatePresence mode="wait">
                        {!isSidebarCollapsed && (
                          <motion.span
                            key="chat-title-text"
                            variants={sidebarContentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className="truncate whitespace-nowrap"
                          >
                            {conv.title || APP_CONTENT.chat.defaultSessionTitle}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Actions on hover/active in expanded mode */}
                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                          className="p-1 rounded hover:bg-theme-bg-surface text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
                          title={APP_CONTENT.sidebar.renameChat}
                        >
                          <Edit2 className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDeleteDialog(conv.id, e)}
                          className="p-1 rounded hover:bg-theme-bg-surface text-theme-text-muted hover:text-theme-status-danger cursor-pointer transition-colors"
                          title={APP_CONTENT.sidebar.deleteChat}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 5. Bottom Utilities: Theme Switcher */}
        <div className="p-spacing-sm px-3 flex flex-col border-t border-theme-border-subtle bg-theme-bg-surface shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={tapScaleIcon}
            onClick={toggleTheme}
            title={isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
            className={`w-full flex items-center rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            }`}
          >
            <div className="flex items-center gap-2">
              {isDark ? (
                <Sun className="size-3.5 text-theme-brand-binance shrink-0" />
              ) : (
                <Moon className="size-3.5 text-theme-text-primary shrink-0" />
              )}
              <AnimatePresence mode="wait">
                {!isSidebarCollapsed && (
                  <motion.span
                    key="theme-label"
                    variants={sidebarContentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.kbd
                  key="theme-kbd"
                  variants={sidebarContentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="text-2xs px-1.5 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-muted font-mono whitespace-nowrap"
                >
                  {isDark ? 'LIGHT' : 'DARK'}
                </motion.kbd>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
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

