import { createGroq } from '@ai-sdk/groq';
import { AGENT_ERROR_MESSAGES } from '@/constants/agent-prompts';

/**
 * Initializes and returns the Groq AI provider configured with the project's API key.
 */
export function getGroqProvider(apiKey?: string) {
  const key = apiKey ?? process.env.GROQ_API_KEY;

  if (!key) {
    throw new Error(AGENT_ERROR_MESSAGES.missingGroqApiKey);
  }

  return createGroq({
    apiKey: key,
  });
}

/**
 * Returns the target language model instance for Groq inference.
 * Defaults to 'llama-3.3-70b-versatile' with fallback to environment configuration.
 */
export function getGroqModel(modelName?: string, apiKey?: string) {
  const groq = getGroqProvider(apiKey);
  const targetModel = modelName ?? process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
  return groq(targetModel);
}
