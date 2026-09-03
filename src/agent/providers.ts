import { createGroq } from '@ai-sdk/groq';
import { AGENT_ERROR_MESSAGES } from './prompts';

/**
 * Primary high-speed Groq model with 128k context and robust tool-calling support
 */
export const DEFAULT_AGENT_MODEL = 'qwen/qwen3.8-27b';

/**
 * Backup Groq model for seamless rate-limit and capacity failover
 */
export const DEFAULT_BACKUP_MODEL = 'openai/gpt-oss-120b';

/**
 * Returns a configured Groq model instance for agent reasoning and tool dispatch
 * 
 * @param modelName - Optional Groq model identifier override
 * @param apiKey - Optional runtime API key override
 */
export function getAgentModel(modelName?: string, apiKey?: string) {
  const resolvedApiKey = apiKey ?? process.env.GROQ_API_KEY;

  if (!resolvedApiKey) {
    throw new Error(AGENT_ERROR_MESSAGES.missingGroqApiKey);
  }

  const groq = createGroq({
    apiKey: resolvedApiKey,
  });

  const selectedModel = modelName ?? process.env.GROQ_MODEL ?? DEFAULT_AGENT_MODEL;
  return groq(selectedModel);
}

/**
 * Returns the configured backup Groq model instance for automatic failover
 * 
 * @param backupModelName - Optional Groq backup model identifier override
 * @param apiKey - Optional runtime API key override
 */
export function getBackupAgentModel(backupModelName?: string, apiKey?: string) {
  const resolvedApiKey = apiKey ?? process.env.GROQ_API_KEY;

  if (!resolvedApiKey) {
    throw new Error(AGENT_ERROR_MESSAGES.missingGroqApiKey);
  }

  const groq = createGroq({
    apiKey: resolvedApiKey,
  });

  const selectedModel = backupModelName ?? process.env.GROQ_BACKUP_MODEL ?? DEFAULT_BACKUP_MODEL;
  return groq(selectedModel);
}
