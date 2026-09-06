import { sidebarContent } from './sidebar.content';
import { chatContent } from './chat.content';
import { processContent } from './process.content';
import { marketContent } from './market.content';
import { subAgentsContent } from './sub-agents.content';

export * from './sidebar.content';
export * from './chat.content';
export * from './process.content';
export * from './market.content';
export * from './sub-agents.content';

/**
 * Centralized Application UI Copy and Labels
 *
 * Assembled from modular domain files to enforce Rule 1 (Zero hardcoded text in JSX/controllers)
 * with clean modular separation of concerns.
 */
export const APP_CONTENT = {
  ...sidebarContent,
  ...chatContent,
  ...processContent,
  ...marketContent,
  ...subAgentsContent,
} as const;

export type AppContent = typeof APP_CONTENT;
