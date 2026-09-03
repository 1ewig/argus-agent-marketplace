import { z } from 'zod';
import type { ExecutionMode } from '@/lib/types';

/**
 * Execution mode for the agent (simulation sandbox vs live MCP)
 */
export type AgentExecutionMode = ExecutionMode;

/**
 * Chat history message for multi-turn conversational context
 */
export const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;

/**
 * Telemetry record for an executed tool call within the agent reasoning loop
 */
export interface ExecutedToolCall {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}

/**
 * Invocation options for the agent execution engine
 */
export interface AgentOptions {
  prompt: string;
  symbol?: string;
  mode?: AgentExecutionMode;
  modelName?: string;
  apiKey?: string;
  history?: HistoryMessage[];
  maxSteps?: number;
  isFirstTurn?: boolean;
  systemDirective?: string;
}

/**
 * Structured result returned by the agent execution engine
 */
export interface AgentResult {
  symbol?: string;
  sessionTitle?: string;
  analysis: string;
  toolCalls: ExecutedToolCall[];
  stepCount: number;
  executionMode: AgentExecutionMode;
  timestamp: number;
}

/**
 * Zod schema for runtime validation of incoming HTTP chat requests to the agent
 */
export const AgentChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  symbol: z.string().optional(),
  mode: z.enum(['simulation', 'live_mcp']).default('simulation'),
  apiKey: z.string().optional(),
  history: z.array(HistoryMessageSchema).optional(),
  isFirstTurn: z.boolean().optional(),
});

export type AgentChatRequest = z.infer<typeof AgentChatRequestSchema>;
