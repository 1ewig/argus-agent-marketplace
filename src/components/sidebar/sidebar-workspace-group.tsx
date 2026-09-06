'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { ChevronRight, Globe } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import {
  sidebarHorizontalCollapseVariants,
  tapScalePill,
} from '@/constants/animation';
import { isGlobalSymbol } from '@/lib/utils';
import type { SymbolWorkspaceGroup } from '@/hooks';
import { SidebarSessionItem } from './sidebar-session-item';

export interface SidebarWorkspaceGroupProps {
  group: SymbolWorkspaceGroup;
  activeConversationId: string;
  activeSymbol: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
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

// Tuned deceleration curve for fluid layout expansion
const accordionTransition: Transition = {
  height: {
    duration: 0.24,
    ease: [0.16, 1, 0.3, 1],
  },
  opacity: {
    duration: 0.18,
    ease: 'easeInOut',
  },
};

/**
 * Pure presentation accordion container for an individual symbol workspace.
 * Renders the symbol header row and the collapsible list of conversation threads.
 */
export const SidebarWorkspaceGroup = memo(function SidebarWorkspaceGroup({
  group,
  activeConversationId,
  activeSymbol,
  isExpanded,
  onToggleExpand,
  editingId,
  editTitle,
  isCollapsed,
  onSelectSession,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditTitleChange,
  onOpenDelete,
}: SidebarWorkspaceGroupProps) {
  const isGlobal = isGlobalSymbol(group.symbol);
  const isCurrentActiveGroup =
    group.symbol.toUpperCase() === (activeSymbol || 'BTCUSDT').toUpperCase();
  const pairLabel = isGlobal
    ? APP_CONTENT.sidebar.globalWorkspaceGroup
    : group.quoteAsset
      ? `${group.baseAsset} / ${group.quoteAsset}`
      : group.baseAsset;

  const handleGroupHeaderClick = () => {
    if (isCollapsed) {
      const activeInGroup = group.conversations.find((c) => c.id === activeConversationId);
      const targetId = activeInGroup?.id || group.conversations[0]?.id;
      if (targetId) {
        onSelectSession(targetId);
      }
    } else {
      if (!isCurrentActiveGroup) {
        const activeInGroup = group.conversations.find((c) => c.id === activeConversationId);
        const targetId = activeInGroup?.id || group.conversations[0]?.id;
        if (targetId) {
          onSelectSession(targetId);
        }
        if (!isExpanded) {
          onToggleExpand();
        }
      } else {
        onToggleExpand();
      }
    }
  };

  return (
    <div className="flex flex-col w-full shrink-0">
      {/* Group Header */}
      <motion.div
        whileTap={tapScalePill}
        role="button"
        tabIndex={0}
        onClick={handleGroupHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleGroupHeaderClick();
          }
        }}
        title={`${pairLabel} (${group.conversations.length})`}
        className={`group relative h-10 w-full flex items-center rounded-xl cursor-pointer transition-colors select-none overflow-hidden shrink-0 ${
          isCurrentActiveGroup
            ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-transparent'
        }`}
      >
        {/* Anchored Left Slot: Centered size-10 matching all other sidebar buttons */}
        <div className="size-10 flex items-center justify-center shrink-0">
          {isGlobal ? (
            <Globe
              className={`size-4 transition-colors ${
                isCurrentActiveGroup
                  ? 'text-theme-brand-binance'
                  : 'text-theme-text-muted group-hover:text-theme-text-primary'
              }`}
            />
          ) : (
            <span
              className={`font-mono text-[10px] font-bold tracking-tight uppercase transition-colors ${
                isCurrentActiveGroup
                  ? 'text-theme-brand-binance'
                  : 'text-theme-text-muted group-hover:text-theme-text-primary'
              }`}
            >
              {group.baseAsset.slice(0, 3)}
            </span>
          )}
        </div>

        {/* Expanded Workspace Label, Count Badge & Chevron */}
        <motion.div
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className="flex-1 flex items-center justify-between min-w-0 overflow-hidden pr-2"
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

          {/* Right Section: Session Count & Chevron */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-2xs font-mono font-medium text-theme-text-muted tabular-nums">
              {group.conversations.length}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <ChevronRight
                className={`size-3.5 transition-colors duration-150 ${
                  isExpanded ? 'text-theme-text-primary' : 'text-theme-text-muted'
                }`}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Group Conversations List (Accordion Body) */}
      <AnimatePresence initial={false}>
        {!isCollapsed && isExpanded && (
          <motion.div
            key={`workspace-body-${group.symbol}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={accordionTransition}
            className="overflow-hidden"
          >
            {/* Inner container isolates padding so height collapses smoothly to 0 */}
            <div className="flex flex-col gap-0.5 pl-3.5 pr-0.5 pt-0.5 pb-1">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});