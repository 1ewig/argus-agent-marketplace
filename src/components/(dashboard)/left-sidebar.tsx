'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { ArgusIcon } from '@/components/common';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { APP_CONTENT } from '@/constants/content';
import { tapScaleButton, tapScaleIcon, tapScalePill } from '@/constants/animation';
import { useTheme } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
import { useChatSessions } from '@/hooks/use-chat-sessions';

/**
 * Architectural Left Navigation Sidebar.
 * Houses workspace branding, view navigation, full conversation history,
 * live market connection status, and theme controls.
 */
export function LeftSidebar() {
  const { isDark, toggleTheme } = useTheme();
  const stageView = useAppStore((state) => state.stageView);
  const setStageView = useAppStore((state) => state.setStageView);

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
      <aside className="w-64 sm:w-72 h-full bg-theme-bg-surface border-r border-theme-border-subtle flex flex-col shrink-0 select-none z-30">
        {/* 1. Top Brand Header */}
        <div className="p-spacing-md flex items-center gap-spacing-sm border-b border-theme-border-subtle">
          <ArgusIcon className="size-6 text-theme-brand-binance shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-theme-text-primary leading-none">
              {APP_CONTENT.sidebar.brand}
            </span>
            <span className="text-2xs font-semibold text-theme-text-muted leading-tight mt-0.5">
              {APP_CONTENT.sidebar.subtitle}
            </span>
          </div>
        </div>

        {/* 2. New Chat Action */}
        <div className="p-spacing-sm px-spacing-md border-b border-theme-border-subtle">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={tapScaleButton}
            onClick={handleNewChatClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-theme-brand-binance text-theme-bg-overlay font-bold text-xs cursor-pointer shadow-2xs hover:brightness-105 transition-all"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>{APP_CONTENT.sidebar.newChat}</span>
          </motion.button>
        </div>

        {/* 3. Workspace Views Navigation */}
        <div className="p-spacing-sm px-spacing-md flex flex-col gap-1 border-b border-theme-border-subtle">
          <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-1">
            {APP_CONTENT.sidebar.viewsTitle}
          </span>

          {/* Agent View Option */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => setStageView('agent')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              stageView === 'agent'
                ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
            }`}
          >
            <Bot className={`size-4 ${stageView === 'agent' ? 'text-theme-brand-binance' : 'text-theme-text-muted'}`} />
            <span>{APP_CONTENT.sidebar.agentView}</span>
          </motion.button>

          {/* Chart View Option */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => setStageView('chart')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              stageView === 'chart'
                ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
            }`}
          >
            <LineChart className={`size-4 ${stageView === 'chart' ? 'text-theme-brand-binance' : 'text-theme-text-muted'}`} />
            <span>{APP_CONTENT.sidebar.chartView}</span>
          </motion.button>
        </div>

        {/* 4. Saved Conversations List */}
        <div className="flex-1 flex flex-col min-h-0 p-spacing-sm px-spacing-md">
          <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-1">
            {APP_CONTENT.sidebar.historyTitle}
          </span>

          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 pr-1 mt-1">
            {conversations.length === 0 ? (
              <span className="text-2xs text-theme-text-muted italic px-2 py-2">
                {APP_CONTENT.sidebar.emptyHistory}
              </span>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isEditing = editingId === conv.id;

                if (isEditing) {
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
                    onClick={() => {
                      setStageView('agent');
                      handleSelectSession(conv.id);
                    }}
                    className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-semibold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare
                        className={`size-3.5 shrink-0 ${
                          isActive ? 'text-theme-brand-binance' : 'text-theme-text-muted group-hover:text-theme-text-secondary'
                        }`}
                      />
                      <span className="truncate">{conv.title || APP_CONTENT.chat.defaultSessionTitle}</span>
                    </div>

                    {/* Actions on hover/active */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 5. Bottom Utilities: Theme Switcher */}
        <div className="p-spacing-md flex flex-col gap-spacing-sm border-t border-theme-border-subtle bg-theme-bg-surface">
          {/* Theme Toggle Button */}
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={tapScaleIcon}
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              {isDark ? (
                <Sun className="size-3.5 text-theme-brand-binance" />
              ) : (
                <Moon className="size-3.5 text-theme-text-primary" />
              )}
              <span>{isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}</span>
            </div>
            <kbd className="text-2xs px-1.5 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-muted font-mono">
              {isDark ? 'LIGHT' : 'DARK'}
            </kbd>
          </motion.button>
        </div>
      </aside>

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
