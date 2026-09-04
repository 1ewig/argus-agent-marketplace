'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pencil, Trash2, Check, X } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { dropdownMenuVariants } from '@/constants/animation';
import { formatRelativeTime } from '@/lib/utils';
import { ConfirmDialog } from '@/components/common';
import type { ConversationRecord } from '@/lib/db';

export interface ChatSessionsMenuProps {
  currentTitle: string;
  conversations: ConversationRecord[];
  activeConversationId: string;
  isMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  onToggleMenu: () => void;
  onSelectSession: (id: string) => void;
  onStartRename: (id: string, currentTitle: string, e: React.MouseEvent) => void;
  onSaveRename: (id: string, e?: React.MouseEvent) => Promise<void>;
  onCancelRename: () => void;
  onDeleteSession: (id: string, e?: React.MouseEvent) => Promise<void>;
}

/**
 * Dropdown popover menu allowing users to switch, rename, and delete chat sessions.
 * Pure presentation component decoupled from database queries and chat orchestration.
 * Sessions are strictly sorted by creation time descending with deletion confirmed via ConfirmDialog.
 * Memoized to prevent re-rendering when agent streams tokens in ChatClient.
 */
export const ChatSessionsMenu = React.memo(function ChatSessionsMenu({
  currentTitle,
  conversations,
  activeConversationId,
  isMenuOpen,
  menuRef,
  editingId,
  editTitle,
  setEditTitle,
  onToggleMenu,
  onSelectSession,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDeleteSession,
}: ChatSessionsMenuProps) {
  const [sessionToDelete, setSessionToDelete] = useState<ConversationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guarantee conversations are sorted by creation time descending (newest first)
  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0)
    );
  }, [conversations]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={onToggleMenu}
        title={APP_CONTENT.sessions.openMenuAria}
        aria-label={APP_CONTENT.sessions.openMenuAria}
        className="h-8 flex items-center gap-spacing-xs text-2xs font-semibold bg-theme-bg-elevated/70 hover:bg-theme-bg-surface text-theme-text-primary border border-theme-border-subtle hover:border-theme-border-strong rounded-xl px-spacing-sm cursor-pointer transition-all shadow-2xs max-w-[160px] sm:max-w-[220px]"
      >
        <span className="truncate">{currentTitle}</span>
        <ChevronDown
          className={`size-3 text-theme-text-muted shrink-0 transition-transform duration-200 ${
            isMenuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={dropdownMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 mt-spacing-xs w-72 sm:w-80 bg-theme-bg-surface border border-theme-border-subtle rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-spacing-sm py-spacing-xs bg-theme-bg-elevated border-b border-theme-border-subtle text-2xs font-semibold text-theme-text-secondary">
              <span>{APP_CONTENT.sessions.menuTitle}</span>
              <span className="px-spacing-xs py-0.5 rounded bg-theme-bg-surface text-theme-text-muted border border-theme-border-subtle text-2xs font-mono">
                {sortedConversations.length}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-theme-border-subtle">
              {sortedConversations.length === 0 ? (
                <div className="p-spacing-sm text-2xs text-theme-text-muted text-center">
                  {APP_CONTENT.sessions.emptyState}
                </div>
              ) : (
                sortedConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = editingId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      className={`flex items-center justify-between gap-spacing-xs px-spacing-sm py-spacing-xs transition-colors rounded-xl mx-1 my-0.5 ${
                        isActive
                          ? 'bg-theme-bg-elevated text-theme-text-primary font-semibold shadow-2xs'
                          : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/80'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-spacing-xs w-full py-0.5">
                          <input
                            type="text"
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                void onSaveRename(conv.id);
                              } else if (e.key === 'Escape') {
                                onCancelRename();
                              }
                            }}
                            placeholder={APP_CONTENT.sessions.renamePlaceholder}
                            className="flex-1 bg-theme-bg-surface text-2xs text-theme-text-primary px-spacing-xs py-1 rounded border border-theme-border-strong focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={(e) => void onSaveRename(conv.id, e)}
                            title={APP_CONTENT.sessions.saveLabel}
                            aria-label={APP_CONTENT.sessions.saveLabel}
                            className="p-1 rounded hover:bg-theme-bg-surface text-theme-status-success cursor-pointer"
                          >
                            <Check className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={onCancelRename}
                            title={APP_CONTENT.sessions.cancelLabel}
                            aria-label={APP_CONTENT.sessions.cancelLabel}
                            className="p-1 rounded hover:bg-theme-bg-surface text-theme-text-muted hover:text-theme-text-primary cursor-pointer"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onSelectSession(conv.id)}
                            className="flex items-center gap-spacing-xs flex-1 text-left min-w-0 cursor-pointer py-1"
                          >
                            {isActive && (
                              <span className="size-1.5 rounded-full bg-theme-brand-binance shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className={`text-2xs truncate ${
                                  isActive
                                    ? 'text-theme-text-primary font-bold'
                                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                                }`}
                              >
                                {conv.title}
                              </span>
                              {conv.createdAt ? (
                                <span className="text-2xs text-theme-text-muted leading-tight">
                                  {formatRelativeTime(conv.createdAt)}
                                </span>
                              ) : null}
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => onStartRename(conv.id, conv.title, e)}
                              title={APP_CONTENT.sessions.renameLabel}
                              aria-label={APP_CONTENT.sessions.renameLabel}
                              className="p-1 rounded text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-surface cursor-pointer transition-colors"
                            >
                              <Pencil className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDelete(conv);
                              }}
                              title={APP_CONTENT.sessions.deleteLabel}
                              aria-label={APP_CONTENT.sessions.deleteLabel}
                              className="p-1 rounded text-theme-text-muted hover:text-theme-status-danger hover:bg-theme-bg-surface cursor-pointer transition-colors"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reusable Confirmation Dialog for Deleting Sessions */}
      <ConfirmDialog
        isOpen={sessionToDelete !== null}
        title={APP_CONTENT.sessions.deleteDialogTitle}
        description={APP_CONTENT.sessions.deleteDialogDescription(sessionToDelete?.title)}
        confirmLabel={APP_CONTENT.sessions.deleteDialogConfirm}
        cancelLabel={APP_CONTENT.sessions.deleteDialogCancel}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (!sessionToDelete) return;
          try {
            setIsDeleting(true);
            await onDeleteSession(sessionToDelete.id);
          } finally {
            setIsDeleting(false);
            setSessionToDelete(null);
          }
        }}
        onCancel={() => {
          if (!isDeleting) {
            setSessionToDelete(null);
          }
        }}
      />
    </div>
  );
});

