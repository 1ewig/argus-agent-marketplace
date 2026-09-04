'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition } from '@/constants/animation';
import type { ConversationRecord } from '@/lib/db';
import { SidebarSessionItem } from './sidebar-session-item';

interface SidebarSessionListProps {
  conversations: ConversationRecord[];
  activeConversationId: string;
  editingId: string | null;
  editTitle: string;
  isCollapsed: boolean;
  onSelectSession: (id: string) => void;
  onStartRename: (id: string, title: string, e: React.MouseEvent) => void;
  onSaveRename: (id: string, e?: React.FormEvent | React.MouseEvent) => void;
  onCancelRename: () => void;
  onEditTitleChange: (value: string) => void;
  onOpenDelete: (id: string, e: React.MouseEvent) => void;
}

export function SidebarSessionList({
  conversations,
  activeConversationId,
  editingId,
  editTitle,
  isCollapsed,
  onSelectSession,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditTitleChange,
  onOpenDelete,
}: SidebarSessionListProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 py-spacing-sm px-3.5 overflow-hidden">
      {/* Section Heading: Collapses height to 0 */}
      <motion.div
        initial={false}
        animate={{
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
          marginBottom: isCollapsed ? 0 : 4,
        }}
        transition={sidebarSpringTransition}
        className="overflow-hidden w-full"
      >
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-0.5 whitespace-nowrap block">
          {APP_CONTENT.sidebar.historyTitle}
        </span>
      </motion.div>

      {/* Scrollable Conversation List Container */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 ${
          isCollapsed ? 'items-center' : 'pr-0.5'
        } custom-scrollbar`}
      >
        {conversations.length === 0 ? (
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              height: isCollapsed ? 0 : 'auto',
            }}
            className="overflow-hidden"
          >
            <span className="text-2xs text-theme-text-muted italic px-2 py-2 whitespace-nowrap block">
              {APP_CONTENT.sidebar.emptyHistory}
            </span>
          </motion.div>
        ) : (
          conversations.map((conv) => (
            <SidebarSessionItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              isEditing={editingId === conv.id}
              editTitle={editTitle}
              isCollapsed={isCollapsed}
              onSelect={() => onSelectSession(conv.id)}
              onStartRename={(e) => onStartRename(conv.id, conv.title, e)}
              onSaveRename={(e) => onSaveRename(conv.id, e)}
              onCancelRename={onCancelRename}
              onEditTitleChange={onEditTitleChange}
              onOpenDelete={(e) => onOpenDelete(conv.id, e)}
            />
          ))
        )}
      </div>
    </div>
  );
}
