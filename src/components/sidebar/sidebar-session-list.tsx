'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { sidebarHeadingCollapseVariants } from '@/constants/animation';
import type { SymbolWorkspaceGroup } from '@/hooks/use-chat-sessions';
import { SidebarWorkspaceGroup } from './sidebar-workspace-group';

interface SidebarSessionListProps {
  groups: SymbolWorkspaceGroup[];
  activeConversationId: string;
  activeSymbol: string;
  editingId: string | null;
  editTitle: string;
  isCollapsed: boolean;
  isNewChatDisabled: boolean;
  onSelectSession: (id: string) => void;
  onStartRename: (id: string, title: string, e: React.MouseEvent) => void;
  onSaveRename: (id: string, e?: React.FormEvent | React.MouseEvent) => void;
  onCancelRename: () => void;
  onEditTitleChange: (value: string) => void;
  onOpenDelete: (id: string, e: React.MouseEvent) => void;
  onNewChatInSymbol: (symbol: string, e: React.MouseEvent) => void;
}

export function SidebarSessionList({
  groups,
  activeConversationId,
  activeSymbol,
  editingId,
  editTitle,
  isCollapsed,
  isNewChatDisabled,
  onSelectSession,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditTitleChange,
  onOpenDelete,
  onNewChatInSymbol,
}: SidebarSessionListProps) {
  // Store collapsed state per symbol (defaults to expanded)
  const [collapsedSymbols, setCollapsedSymbols] = useState<Record<string, boolean>>({});

  const handleToggleGroup = (symbol: string) => {
    setCollapsedSymbols((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 py-spacing-sm px-3.5 overflow-hidden">
      {/* Section Heading: Collapses height to 0 */}
      <motion.div
        initial={false}
        variants={sidebarHeadingCollapseVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className="overflow-hidden w-full"
      >
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-0.5 whitespace-nowrap block">
          {APP_CONTENT.sidebar.workspaceGroupsTitle}
        </span>
      </motion.div>

      {/* Scrollable Conversation List Container */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1.5 ${
          isCollapsed ? 'items-center' : 'pr-0.5'
        } custom-scrollbar`}
      >
        {groups.length === 0 ? (
          <motion.div
            initial={false}
            animate={{
              opacity: isCollapsed ? 0 : 1,
              height: isCollapsed ? 0 : 'auto',
            }}
            className="overflow-hidden"
          >
            <span className="text-2xs text-theme-text-muted italic px-2 py-2 whitespace-nowrap block">
              {APP_CONTENT.sidebar.emptyWorkspaces}
            </span>
          </motion.div>
        ) : (
          groups.map((group) => {
            const isGroupExpanded = !collapsedSymbols[group.symbol];
            return (
              <SidebarWorkspaceGroup
                key={group.symbol}
                group={group}
                activeConversationId={activeConversationId}
                activeSymbol={activeSymbol}
                isExpanded={isGroupExpanded}
                onToggleExpand={() => handleToggleGroup(group.symbol)}
                editingId={editingId}
                editTitle={editTitle}
                isCollapsed={isCollapsed}
                isNewChatDisabled={isNewChatDisabled}
                onSelectSession={onSelectSession}
                onStartRename={onStartRename}
                onSaveRename={onSaveRename}
                onCancelRename={onCancelRename}
                onEditTitleChange={onEditTitleChange}
                onOpenDelete={onOpenDelete}
                onNewChatInSymbol={onNewChatInSymbol}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
