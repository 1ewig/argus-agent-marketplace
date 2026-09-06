import { getAgentModel, getBackupAgentModel } from '../providers/models';
import { buildAgentTools } from '../tools/registry';
import { ARGUS_SYSTEM_PROMPT } from '../prompts/system';
import {
  FIRST_TURN_SESSION_TITLE_DIRECTIVE,
  getEnvironmentDirective,
  getWorkspaceSymbolDirective,
} from '../prompts/directives';
import type { AgentOptions } from '../types';

export interface PreparedAgentInvocation {
  model: ReturnType<typeof getAgentModel>;
  backupModel: ReturnType<typeof getBackupAgentModel>;
  tools: ReturnType<typeof buildAgentTools>;
  effectiveSystemPrompt: string;
  currentUserPrompt: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  reasoningEffort: 'high' | 'medium' | 'low' | 'max' | 'default' | 'none';
  maxTokens: number;
}

/**
 * Prepares the model, tools, prompt context, and directives for agent execution.
 * Decouples prompt formatting and adapter assembly from the execution loop.
 */
export function prepareAgentInvocation(options: AgentOptions): PreparedAgentInvocation {
  const {
    prompt,
    symbol,
    mode = 'simulation',
    provider,
    modelName,
    backupModelName,
    apiKey,
    history = [],
    isFirstTurn,
    systemDirective,
  } = options;

  const tools = buildAgentTools();
  const model = getAgentModel(modelName, apiKey, provider);
  const backupModel = getBackupAgentModel(backupModelName, apiKey);

  const currentUserPrompt = symbol
    ? `[Active Workspace: #${symbol.toUpperCase()}]\nUser: ${prompt}`
    : prompt;

  const effectiveIsFirstTurn = isFirstTurn ?? (!history || history.length === 0);
  const directives: string[] = [getEnvironmentDirective(mode)];
  if (symbol) {
    directives.push(getWorkspaceSymbolDirective(symbol));
  }
  if (effectiveIsFirstTurn) {
    directives.push(FIRST_TURN_SESSION_TITLE_DIRECTIVE);
  }
  if (systemDirective) {
    directives.push(systemDirective);
  }

  const effectiveSystemPrompt = directives.length > 0
    ? `${ARGUS_SYSTEM_PROMPT}\n\n${directives.join('\n\n')}`
    : ARGUS_SYSTEM_PROMPT;

  const messages = history && history.length > 0
    ? [
        ...history.slice(-10).map((h) => ({
          role: h.role,
          content: h.content,
        })),
        {
          role: 'user' as const,
          content: currentUserPrompt,
        },
      ]
    : undefined;

  const reasoningEffort =
    (process.env.FIREWORKS_REASONING_EFFORT as 'high' | 'medium' | 'low' | 'max' | 'default' | 'none') ||
    (process.env.GROQ_REASONING_EFFORT as 'high' | 'medium' | 'low' | 'default' | 'none') ||
    'low';

  const envMaxTokens = Number(process.env.GROQ_MAX_TOKENS);
  const maxTokens =
    options.maxTokens ??
    (Number.isFinite(envMaxTokens) && envMaxTokens > 0 ? envMaxTokens : 6000);

  return {
    model,
    backupModel,
    tools,
    effectiveSystemPrompt,
    currentUserPrompt,
    messages,
    reasoningEffort,
    maxTokens,
  };
}
