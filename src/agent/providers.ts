import { createGroq } from '@ai-sdk/groq';
import { createFireworks } from '@ai-sdk/fireworks';
import { AGENT_ERROR_MESSAGES } from './prompts';

export type InferenceProviderType = 'groq' | 'fireworks';

/**
 * Default model identifiers for supported inference providers
 */
export const DEFAULT_GROQ_MODEL = 'qwen/qwen3.8-27b';
export const DEFAULT_GROQ_BACKUP_MODEL = 'openai/gpt-oss-120b';

export const DEFAULT_FIREWORKS_MODEL = 'accounts/fireworks/models/qwen2p5-72b-instruct';
export const DEFAULT_FIREWORKS_BACKUP_MODEL = 'accounts/fireworks/models/llama-v3p3-70b-instruct';

// Backwards-compatible aliases
export const DEFAULT_AGENT_MODEL = DEFAULT_GROQ_MODEL;
export const DEFAULT_BACKUP_MODEL = DEFAULT_GROQ_BACKUP_MODEL;

/**
 * Resolves the active inference provider from options or environment variables
 */
export function getActiveInferenceProvider(override?: InferenceProviderType): InferenceProviderType {
  if (override) return override;
  const envProvider = process.env.INFERENCE_PROVIDER?.toLowerCase();
  if (envProvider === 'fireworks') return 'fireworks';
  return 'groq';
}

/**
 * Returns a configured model instance (Groq or Fireworks) for agent reasoning and tool dispatch
 * 
 * @param modelName - Optional model identifier override
 * @param apiKey - Optional runtime API key override
 * @param providerOverride - Optional provider selection override
 */
export function getAgentModel(
  modelName?: string,
  apiKey?: string,
  providerOverride?: InferenceProviderType
) {
  const provider = getActiveInferenceProvider(providerOverride);

  if (provider === 'fireworks') {
    const resolvedApiKey = apiKey ?? process.env.FIREWORKS_API_KEY;
    if (!resolvedApiKey) {
      throw new Error(AGENT_ERROR_MESSAGES.missingFireworksApiKey);
    }
    const fireworks = createFireworks({ apiKey: resolvedApiKey });
    const selectedModel = modelName ?? process.env.FIREWORKS_MODEL ?? DEFAULT_FIREWORKS_MODEL;
    return fireworks(selectedModel);
  }

  // Default to Groq
  const resolvedApiKey = apiKey ?? process.env.GROQ_API_KEY;
  if (!resolvedApiKey) {
    throw new Error(AGENT_ERROR_MESSAGES.missingGroqApiKey);
  }
  const groq = createGroq({ apiKey: resolvedApiKey });
  const selectedModel = modelName ?? process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  return groq(selectedModel);
}

/**
 * Returns the configured backup model instance for automatic failover across models or providers
 * 
 * @param backupModelName - Optional backup model identifier override
 * @param apiKey - Optional runtime API key override
 * @param backupProviderOverride - Optional backup provider selection override
 */
export function getBackupAgentModel(
  backupModelName?: string,
  apiKey?: string,
  backupProviderOverride?: InferenceProviderType
) {
  const primaryProvider = getActiveInferenceProvider();
  const configuredBackupProvider = process.env.BACKUP_INFERENCE_PROVIDER?.toLowerCase() as InferenceProviderType | undefined;

  let backupProvider: InferenceProviderType = backupProviderOverride ?? configuredBackupProvider ?? primaryProvider;

  // If no explicit backup provider is set, but primary is groq and a fireworks key is present, enable cross-provider failover
  if (!configuredBackupProvider && primaryProvider === 'groq' && process.env.FIREWORKS_API_KEY) {
    backupProvider = 'fireworks';
  }

  if (backupProvider === 'fireworks') {
    const resolvedApiKey = apiKey ?? process.env.FIREWORKS_API_KEY;
    if (!resolvedApiKey) {
      throw new Error(AGENT_ERROR_MESSAGES.missingFireworksApiKey);
    }
    const fireworks = createFireworks({ apiKey: resolvedApiKey });
    const selectedModel = backupModelName ?? process.env.FIREWORKS_BACKUP_MODEL ?? DEFAULT_FIREWORKS_MODEL;
    return fireworks(selectedModel);
  }

  // Groq backup
  const resolvedApiKey = apiKey ?? process.env.GROQ_API_KEY;
  if (!resolvedApiKey) {
    throw new Error(AGENT_ERROR_MESSAGES.missingGroqApiKey);
  }
  const groq = createGroq({ apiKey: resolvedApiKey });
  const selectedModel = backupModelName ?? process.env.GROQ_BACKUP_MODEL ?? DEFAULT_GROQ_BACKUP_MODEL;
  return groq(selectedModel);
}
