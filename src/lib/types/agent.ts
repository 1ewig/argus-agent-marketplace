import type { ExecutionReceipt } from './execution';

/**
 * Autonomous Argus Agent Roles
 */
export type AgentRole = 'orchestrator' | 'analyst' | 'risk_arbiter' | 'executor';

/**
 * Execution Mode for Binance operations
 */
export type ExecutionMode = 'simulation';

/**
 * Stage View Mode for dashboard (Agent chat vs Trading chart)
 */
export type StageViewMode = 'agent' | 'chart';

/**
 * Argus Operation Mode: Copilot (human approves) vs Autonomous (pure M2M loop)
 */
export type GuardianMode = 'copilot' | 'autonomous';
export type SyndicateMode = GuardianMode; // Backwards-compatible alias

/**
 * Right Market Panel Active Tab Identifier
 */
export type RightPanelTab =
  | 'overview'
  | 'intelligence'
  | 'market-data'
  | 'technical-analysis'
  | 'risk-volatility'
  | 'sentiment-context'
  | 'decision';

/**
 * Visual Multi-Agent Communication Stream Message
 */
export interface AgentMessage {
  id: string;
  role: AgentRole;
  title: string;
  content: string;
  timestamp: number;
  status: 'idle' | 'working' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
  executionReceipt?: ExecutionReceipt;
}
