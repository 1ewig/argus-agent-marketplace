/**
 * Centralized Framer Motion Animation Variants & Spring Profiles
 * 
 * Enforces smooth, soft, and subtle animations across:
 * - Work process timeline accordion (AgentProcessTimeline)
 * - Thought reasoning accordion (AgentThoughtAccordion)
 * - Tool invocation detail drawers (ToolResultCard drawer)
 * - Session dropdown popover menu (ChatSessionsMenu)
 * - Empty chat state staggered cascade (ChatWindow)
 */

import type { Variants } from 'framer-motion';

/**
 * Architectural deceleration cubic bezier curve.
 * Starts smoothly and settles gently into place without bounce or jitter.
 */
export const EASING_ARCHITECTURAL = [0.16, 1, 0.3, 1] as const;

/**
 * Smooth, jitter-free height and opacity collapse/expand variants for:
 * 1. Overarching work process timeline group
 * 2. Dedicated agent thought accordion
 * 3. Nested tool execution detail drawers
 */
export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.22, ease: EASING_ARCHITECTURAL },
      opacity: { duration: 0.16, ease: 'easeOut' },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.26, ease: EASING_ARCHITECTURAL },
      opacity: { duration: 0.2, delay: 0.02, ease: 'easeIn' },
    },
  },
};

/**
 * Soft, subtle entrance and exit animation for popover dropdown menus (e.g. ChatSessionsMenu)
 * Uses a gentle scale (0.98 -> 1) and 6px vertical translation anchored to transform-origin top-right.
 */
export const dropdownMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: -6,
    transition: {
      duration: 0.16,
      ease: 'easeOut',
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: EASING_ARCHITECTURAL,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: {
      duration: 0.14,
      ease: 'easeIn',
    },
  },
};

/**
 * Subtle staggered container for the empty chat suggestions interface.
 */
export const emptyStateContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.16,
      ease: 'easeOut',
    },
  },
};

/**
 * Gentle vertical entry for individual empty-state suggestion items.
 */
export const emptyStateItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASING_ARCHITECTURAL,
    },
  },
};
