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
 * Step type for the real-time reasoning and tool execution process
 */
export type AgentStepType = 'thinking' | 'tool';

/**
 * An individual lifecycle step in the agent's real-time reasoning timeline
 */
export interface AgentExecutionStep {
  id: string;
  type: AgentStepType;
  label: string;
  toolName?: string;
  reasoningText?: string;
  status: 'active' | 'completed' | 'error';
  timestamp: number;
}

/**
 * Real-time SSE streaming events emitted during agent execution
 */
export type AgentStreamEvent =
  | { type: 'step_start'; step: AgentExecutionStep }
  | {
      type: 'step_update';
      stepId: string;
      status?: 'completed' | 'error';
      label?: string;
      reasoningText?: string;
    }
  | { type: 'reasoning_delta'; stepId: string; delta: string }
  | { type: 'text_delta'; delta: string }
  | { type: 'session_title'; title: string }
  | { type: 'done'; result: AgentResult }
  | { type: 'error'; message: string };

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
  steps: AgentExecutionStep[];
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
