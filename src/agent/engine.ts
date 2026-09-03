import { generateText, isStepCount } from 'ai';
import { getAgentModel } from './providers';
import { buildAgentTools } from './tools';
import { getBinanceAdapter } from '@/lib/binance-mcp';
import { ARGUS_SYSTEM_PROMPT } from './prompts';
import type { AgentOptions, AgentResult, ExecutedToolCall } from './types';

/**
 * Executes the core Argus Agent reasoning and tool-calling loop
 * 
 * @param options - Prompt, context, history, execution mode, and optional API overrides
 * @returns Structured AgentResult with text analysis and tool telemetry
 */
export async function executeAgent(options: AgentOptions): Promise<AgentResult> {
  const {
    prompt,
    symbol,
    mode = 'simulation',
    modelName,
    apiKey,
    history = [],
    maxSteps = 5,
  } = options;

  // 1. Initialize the adapter and bind Binance MCP tools
  const adapter = getBinanceAdapter(mode);
  const tools = buildAgentTools(adapter);

  // 2. Obtain Groq model instance
  const model = getAgentModel(modelName, apiKey);

  // 3. Construct user prompt with optional pair context
  const currentUserPrompt = symbol
    ? `[Pair Context: ${symbol.toUpperCase()}]\nUser: ${prompt}`
    : prompt;

  // 4. Run autonomous agent loop with multi-step tool-calling
  const generateParams = history && history.length > 0
    ? {
        model,
        system: ARGUS_SYSTEM_PROMPT,
        messages: [
          ...history.slice(-10).map((h) => ({
            role: h.role,
            content: h.content,
          })),
          {
            role: 'user' as const,
            content: currentUserPrompt,
          },
        ],
        tools,
        stopWhen: isStepCount(maxSteps),
      }
    : {
        model,
        system: ARGUS_SYSTEM_PROMPT,
        prompt: currentUserPrompt,
        tools,
        stopWhen: isStepCount(maxSteps),
      };

  const { text, steps } = await generateText(generateParams);

  // 5. Extract executed tool calls and telemetry from all completed steps
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
    symbol: symbol?.toUpperCase(),
    analysis: text,
    toolCalls: executedToolCalls,
    stepCount: steps.length,
    executionMode: mode,
    timestamp: Date.now(),
  };
}

// Convenient alias
export const runAgent = executeAgent;
export const runArgusAgent = executeAgent;
