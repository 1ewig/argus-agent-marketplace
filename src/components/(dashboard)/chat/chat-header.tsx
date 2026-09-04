'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { tapScaleIcon } from '@/constants/animation';
import { ChatSessionsMenu } from './chat-sessions-menu';
import type { ConversationRecord } from '@/lib/db';

export interface ChatHeaderProps {
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
  onNewSession: () => void | Promise<void>;
}

/**
 * Top architectural header bar for the chat workspace.
 * Encapsulates brand metadata, session management menu, and new session creation.
 * Memoized to prevent re-renders during token streaming.
 */
export const ChatHeader = memo(function ChatHeader({
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
  onNewSession,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-spacing-xs px-spacing-md py-spacing-sm bg-theme-bg-surface border-b border-theme-border-subtle shrink-0">
      {/* Brand Icon & Description */}
      <div className="flex items-center gap-spacing-sm min-w-0">
        <ArgusIcon className="size-5 text-theme-brand-binance shrink-0" />
        <h2 className="text-xs font-medium text-theme-text-secondary tracking-normal truncate">
          {APP_CONTENT.chat.subtitle}
        </h2>
      </div>

      {/* Sessions Dropdown and New Session Action */}
      <div className="flex items-center gap-spacing-xs">
        <ChatSessionsMenu
          currentTitle={currentTitle}
          conversations={conversations}
          activeConversationId={activeConversationId}
          isMenuOpen={isMenuOpen}
          menuRef={menuRef}
          editingId={editingId}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          onToggleMenu={onToggleMenu}
          onSelectSession={onSelectSession}
          onStartRename={onStartRename}
          onSaveRename={onSaveRename}
          onCancelRename={onCancelRename}
          onDeleteSession={onDeleteSession}
        />

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={tapScaleIcon}
          onClick={() => void onNewSession()}
          title={APP_CONTENT.chat.newSessionButton}
          aria-label={APP_CONTENT.chat.newSessionButton}
          className="size-8 flex items-center justify-center rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-surface border border-theme-border-subtle hover:border-theme-border-strong text-theme-brand-binance hover:text-theme-brand-accent cursor-pointer transition-colors shadow-2xs shrink-0 select-none"
        >
          <Plus className="size-3.5 transition-transform duration-200" />
        </motion.button>
      </div>
    </div>
  );
});
