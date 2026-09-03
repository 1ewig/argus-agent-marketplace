import { createGroq } from '@ai-sdk/groq';
import { AGENT_ERROR_MESSAGES } from './prompts';

/**
 * Default high-speed Groq model with 128k context and robust tool-calling support
 */
export const DEFAULT_AGENT_MODEL = 'llama-3.3-70b-versatile';

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
