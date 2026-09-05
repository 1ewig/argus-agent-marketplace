'use client';

import React from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import {
  sidebarHorizontalCollapseVariants,
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

export function SidebarWorkspaceGroup({
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
        className={`group relative h-8 flex items-center rounded-lg text-xs font-semibold cursor-pointer transition-colors select-none overflow-hidden ${isCollapsed ? 'w-10 justify-center mx-auto' : 'w-full px-1.5'
          } ${isCurrentActiveGroup
            ? 'text-theme-text-primary hover:bg-theme-bg-elevated/60'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40'
          }`}
      >
        {/* Anchored Left Slot: Monogram or Chevron in expanded */}
        <div className="size-6 flex items-center justify-center shrink-0">
          {isCollapsed ? (
            <span
              className={`text-2xs font-extrabold px-1 py-0.5 rounded ${isCurrentActiveGroup
                  ? 'bg-theme-brand-binance/20 text-theme-brand-binance'
                  : 'bg-theme-bg-elevated text-theme-text-muted'
                }`}
            >
              {group.baseAsset.slice(0, 3)}
            </span>
          ) : (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <ChevronRight
                className={`size-3.5 transition-colors duration-150 ${isExpanded ? 'text-theme-text-primary' : 'text-theme-text-muted'
                  }`}
              />
            </motion.div>
          )}
        </div>

        {/* Expanded Workspace Label & Count Badge */}
        <motion.div
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className={`flex-1 flex items-center justify-between min-w-0 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 p-0 pointer-events-none' : 'ml-1 pr-1'
            }`}
        >
          {/* Pair Label & Active Dot */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className={`text-2xs font-bold uppercase tracking-wide truncate ${isCurrentActiveGroup
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

          {/* Right Section: Count Badge */}
          <div className="flex items-center gap-1 shrink-0">
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
            transition={accordionTransition}
            className="overflow-hidden"
          >
            {/* Inner container isolates padding so height collapses to clean 0px */}
            <div
              className={`flex flex-col gap-0.5 ${isCollapsed ? 'items-center pt-1' : 'pl-3.5 pr-0.5 pt-0.5 pb-1'
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}