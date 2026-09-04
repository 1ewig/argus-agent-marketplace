'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { ArgusIcon } from '@/components/common';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition, tapScaleIcon } from '@/constants/animation';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle }: SidebarHeaderProps) {
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  return (
    <div className="h-14 px-3.5 flex items-center border-b border-theme-border-subtle shrink-0 overflow-hidden">
      <div className="flex items-center w-full min-w-0">
        {/* Logo / Collapsed Expand Trigger */}
        <motion.button
          type="button"
          whileTap={tapScaleIcon}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          onClick={() => {
            if (isCollapsed) onToggle();
          }}
          className={`size-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
            isCollapsed
              ? 'hover:bg-theme-bg-elevated text-theme-brand-binance'
              : 'hover:bg-theme-bg-elevated/60 text-theme-brand-binance'
          }`}
          title={isCollapsed ? APP_CONTENT.sidebar.expandSidebar : APP_CONTENT.sidebar.brand}
          aria-label={isCollapsed ? APP_CONTENT.sidebar.expandSidebar : APP_CONTENT.sidebar.brand}
        >
          {isCollapsed && isLogoHovered ? (
            <PanelLeftOpen className="size-5 text-theme-brand-binance animate-in fade-in duration-150" />
          ) : (
            <ArgusIcon className="size-6 text-theme-brand-binance transition-transform" />
          )}
        </motion.button>

        {/* Brand Title (Collapses horizontally with zero layout jump) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : 'auto',
            marginLeft: isCollapsed ? 0 : 8,
          }}
          transition={sidebarSpringTransition}
          className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap flex-1"
        >
          <span className="text-sm font-extrabold tracking-tight text-theme-text-primary leading-none">
            {APP_CONTENT.sidebar.brand}
          </span>
          <span className="text-2xs font-semibold text-theme-text-muted leading-tight mt-0.5">
            {APP_CONTENT.sidebar.subtitle}
          </span>
        </motion.div>

        {/* Collapse Toggle Button (Fades out when collapsed to prevent squeezing) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : 'auto',
            scale: isCollapsed ? 0.8 : 1,
          }}
          transition={sidebarSpringTransition}
          className="overflow-hidden shrink-0 flex items-center"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={tapScaleIcon}
            onClick={onToggle}
            className="size-8 rounded-lg flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated cursor-pointer transition-colors"
            title={APP_CONTENT.sidebar.collapseSidebar}
            aria-label={APP_CONTENT.sidebar.collapseSidebar}
            tabIndex={isCollapsed ? -1 : 0}
          >
            <PanelLeftClose className="size-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
