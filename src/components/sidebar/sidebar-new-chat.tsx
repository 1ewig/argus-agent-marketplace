'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition, tapScaleButton } from '@/constants/animation';

interface SidebarNewChatProps {
  isCollapsed: boolean;
  onNewChat: () => void;
}

export function SidebarNewChat({ isCollapsed, onNewChat }: SidebarNewChatProps) {
  return (
    <div className="py-spacing-sm px-3.5 border-b border-theme-border-subtle shrink-0 flex items-center justify-center">
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={tapScaleButton}
        onClick={onNewChat}
        title={APP_CONTENT.sidebar.newChat}
        aria-label={APP_CONTENT.sidebar.newChat}
        className={`h-10 rounded-xl bg-theme-brand-binance text-theme-bg-overlay font-bold text-xs cursor-pointer shadow-2xs hover:brightness-105 transition-all flex items-center overflow-hidden ${
          isCollapsed ? 'w-10 justify-center' : 'w-full'
        }`}
      >
        {/* Anchored Icon Slot: exactly 40px wide to guarantee mathematical center */}
        <div className="size-10 flex items-center justify-center shrink-0">
          <Plus className="size-4 stroke-[2.75]" />
        </div>

        {/* Sliding text label */}
        <motion.span
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : 'auto',
          }}
          transition={sidebarSpringTransition}
          className={`whitespace-nowrap overflow-hidden text-left select-none ${
            isCollapsed ? 'w-0 opacity-0 p-0 pointer-events-none' : 'pr-3'
          }`}
        >
          {APP_CONTENT.sidebar.newChat}
        </motion.span>
      </motion.button>
    </div>
  );
}
