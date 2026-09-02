import { generateText, isStepCount } from 'ai';
import { getGroqModel } from './groq-provider';
import { createBinanceTools } from '@/lib/binance-mcp/tools';
import { getBinanceAdapter } from '@/lib/binance-mcp';
import { ANALYST_AGENT_SYSTEM_PROMPT, AGENT_ERROR_MESSAGES } from '@/constants/agent-prompts';
import type { ExecutionMode } from '@/lib/types';

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnalystAgentOptions {
  prompt: string;
  symbol?: string;
  mode?: ExecutionMode;
  modelName?: string;
  apiKey?: string;
  history?: HistoryMessage[];
}

export interface ExecutedToolCall {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface AnalystAgentResult {
  symbol: string;
  analysis: string;
  toolCalls: ExecutedToolCall[];
  stepCount: number;
  executionMode: ExecutionMode;
  timestamp: number;
}

/**
 * Executes the Alpha Analyst agent loop powered by Groq inference with multi-turn memory.
 * 
 * Interacts with Binance Agent OS via MCP tools to query live ticker prices,
 * order book depth, and candlestick trends before returning structured analysis.
 */
export async function runAnalystAgent(options: AnalystAgentOptions): Promise<AnalystAgentResult> {
  const {
    prompt,
    symbol = 'SOLUSDT',
    mode = 'simulation',
    modelName,
    apiKey,
    history = [],
  } = options;

  if (!symbol) {
    throw new Error(AGENT_ERROR_MESSAGES.symbolRequired);
  }

  // 1. Initialize the adapter and bind Binance MCP tools
  const adapter = getBinanceAdapter(mode);
  const tools = createBinanceTools(adapter);

  // 2. Obtain Groq model
  const model = getGroqModel(modelName, apiKey);

  // 3. Construct user prompt ensuring context-awareness
  const currentUserPrompt = `[Active Pair Context: ${symbol.toUpperCase()}]\nUser: ${prompt}`;

  // 4. Run autonomous agent loop with multi-step tool-calling (up to 5 steps)
  const generateParams = history && history.length > 0
    ? {
        model,
        system: ANALYST_AGENT_SYSTEM_PROMPT,
        messages: [
          ...history.slice(-8).map((h) => ({
            role: h.role,
            content: h.content,
          })),
          {
            role: 'user' as const,
            content: currentUserPrompt,
          },
        ],
        tools,
        stopWhen: isStepCount(5),
      }
    : {
        model,
        system: ANALYST_AGENT_SYSTEM_PROMPT,
        prompt: currentUserPrompt,
        tools,
        stopWhen: isStepCount(5),
      };

  const { text, steps } = await generateText(generateParams);

  // 5. Extract executed tool calls from all completed steps
  const executedToolCalls: ExecutedToolCall[] = [];
  for (const step of steps) {
    if (step.toolCalls && step.toolCalls.length > 0) {
      for (const call of step.toolCalls) {
        const resultItem = step.toolResults?.find(
          (r) => r.toolCallId === call.toolCallId
        );
        executedToolCalls.push({
          toolName: call.toolName,
          args: (call.input as Record<string, unknown>) ?? {},
          result: resultItem ? resultItem.output : undefined,
        });
      }
    }
  }

  return {
    symbol: symbol.toUpperCase(),
    analysis: text,
    toolCalls: executedToolCalls,
    stepCount: steps.length,
    executionMode: mode,
    timestamp: Date.now(),
  };
}
