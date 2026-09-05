'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import {
  sidebarHorizontalCollapseVariants,
  sidebarSpringTransition,
  tapScalePill,
} from '@/constants/animation';
import type { SymbolWorkspaceGroup } from '@/hooks/use-chat-sessions';
import { SidebarSessionItem } from './sidebar-session-item';

interface SidebarWorkspaceGroupProps {
  group: SymbolWorkspaceGroup;
  activeConversationId: string;
  activeSymbol: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
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

export function SidebarWorkspaceGroup({
  group,
  activeConversationId,
  activeSymbol,
  isExpanded,
  onToggleExpand,
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
}: SidebarWorkspaceGroupProps) {
  const isCurrentActiveGroup =
    group.symbol.toUpperCase() === (activeSymbol || 'BTCUSDT').toUpperCase();
  const pairLabel = group.quoteAsset
    ? `${group.baseAsset} / ${group.quoteAsset}`
    : group.baseAsset;

  return (
    <div className="flex flex-col w-full shrink-0">
      {/* Group Header */}
      <motion.div
        whileTap={tapScalePill}
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        title={`${pairLabel} (${group.conversations.length})`}
        className={`group relative h-8 flex items-center rounded-lg text-xs font-semibold cursor-pointer transition-colors select-none overflow-hidden ${
          isCollapsed ? 'w-10 justify-center mx-auto' : 'w-full px-1.5'
        } ${
          isCurrentActiveGroup
            ? 'text-theme-text-primary hover:bg-theme-bg-elevated/60'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
        }`}
      >
        {/* Anchored Left Slot: Monogram or Chevron in expanded */}
        <div className="size-6 flex items-center justify-center shrink-0">
          {isCollapsed ? (
            <span
              className={`text-2xs font-extrabold px-1 py-0.5 rounded ${
                isCurrentActiveGroup
                  ? 'bg-theme-brand-binance/20 text-theme-brand-binance'
                  : 'bg-theme-bg-elevated text-theme-text-muted'
              }`}
            >
              {group.baseAsset.slice(0, 3)}
            </span>
          ) : (
            <ChevronRight
              className={`size-3.5 text-theme-text-muted transition-transform duration-150 ${
                isExpanded ? 'rotate-90 text-theme-text-primary' : 'rotate-0'
              }`}
            />
          )}
        </div>

        {/* Expanded Workspace Label & Quick Actions */}
        <motion.div
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className={`flex-1 flex items-center justify-between min-w-0 overflow-hidden ${
            isCollapsed ? 'w-0 opacity-0 p-0 pointer-events-none' : 'ml-1 pr-1'
          }`}
        >
          {/* Pair Label & Active Dot */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className={`text-2xs font-bold uppercase tracking-wide truncate ${
                isCurrentActiveGroup
                  ? 'text-theme-brand-binance font-extrabold'
                  : 'text-theme-text-secondary group-hover:text-theme-text-primary'
              }`}
            >
              {pairLabel}
            </span>
            {isCurrentActiveGroup && (
              <span className="size-1.5 rounded-full bg-theme-brand-binance shrink-0" />
            )}
          </div>

          {/* Right Section: Quick '+' trigger and Count Badge */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Add Chat in this symbol */}
            <motion.button
              type="button"
              whileTap={isCurrentActiveGroup && isNewChatDisabled ? undefined : tapScalePill}
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrentActiveGroup && isNewChatDisabled) return;
                onNewChatInSymbol(group.symbol, e);
              }}
              disabled={isCurrentActiveGroup && isNewChatDisabled}
              title={
                isCurrentActiveGroup && isNewChatDisabled
                  ? APP_CONTENT.sidebar.newChatDisabled
                  : APP_CONTENT.sidebar.newChatInSymbolTooltip(group.symbol)
              }
              className={`size-5 rounded flex items-center justify-center transition-all select-none ${
                isCurrentActiveGroup && isNewChatDisabled
                  ? 'opacity-30 cursor-not-allowed text-theme-text-muted'
                  : 'text-theme-text-muted hover:text-theme-brand-binance hover:bg-theme-bg-elevated opacity-0 group-hover:opacity-100 cursor-pointer'
              }`}
            >
              <Plus className="size-3 stroke-[2.5]" />
            </motion.button>

            {/* Conversation Count Badge */}
            <span className="text-3xs font-bold px-1.5 py-0.5 rounded-full bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle shrink-0">
              {group.conversations.length}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Group Conversations List (Accordion Body) */}
      <AnimatePresence initial={false}>
        {(!isCollapsed ? isExpanded : true) && (
          <motion.div
            key={`workspace-body-${group.symbol}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={sidebarSpringTransition}
            className={`flex flex-col gap-0.5 overflow-hidden ${
              isCollapsed ? 'items-center pt-1' : 'pl-3.5 pr-0.5 pt-0.5 pb-1'
            }`}
          >
            {group.conversations.map((conv) => (
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
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
