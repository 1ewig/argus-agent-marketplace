import { generateText, streamText, isStepCount } from 'ai';
import { getAgentModel } from './providers';
import { buildAgentTools } from './tools';
import { getBinanceAdapter } from '@/lib/binance-mcp';
import { ARGUS_SYSTEM_PROMPT, FIRST_TURN_SESSION_TITLE_DIRECTIVE } from './prompts';
import { APP_CONTENT } from '@/constants/content';
import type {
  AgentOptions,
  AgentResult,
  AgentStreamEvent,
  AgentExecutionStep,
  ExecutedToolCall,
} from './types';

function prepareAgentInvocation(options: AgentOptions) {
  const {
    prompt,
    symbol,
    mode = 'simulation',
    modelName,
    apiKey,
    history = [],
    isFirstTurn,
    systemDirective,
  } = options;

  const adapter = getBinanceAdapter(mode);
  const tools = buildAgentTools(adapter);
  const model = getAgentModel(modelName, apiKey);

  const currentUserPrompt = symbol
    ? `[Pair Context: ${symbol.toUpperCase()}]\nUser: ${prompt}`
    : prompt;

  const effectiveIsFirstTurn = isFirstTurn ?? (!history || history.length === 0);
  const directives: string[] = [];
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

  return {
    model,
    tools,
    effectiveSystemPrompt,
    currentUserPrompt,
    messages,
  };
}

export async function executeAgentStream(
  options: AgentOptions,
  onEvent: (event: AgentStreamEvent) => void
): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol } = options;
  const { model, tools, effectiveSystemPrompt, currentUserPrompt, messages } =
    prepareAgentInvocation(options);

  const steps: AgentExecutionStep[] = [];
  const executedToolCalls: ExecutedToolCall[] = [];
  let activeThinkingStepId: string | null = null;
  let accumulatedText = '';
  let emittedTitle: string | undefined;

  // Buffer <session_title> so raw XML is never streamed to UI
  let titleBuffer = '';
  let isBufferingTitle = false;
  let titleTagClosed = false;

  // 1. Initial Thinking step
  const initialThinkingId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const initialThinkingStep: AgentExecutionStep = {
    id: initialThinkingId,
    type: 'thinking',
    label: APP_CONTENT.process.thinking,
    status: 'active',
    timestamp: Date.now(),
  };
  steps.push(initialThinkingStep);
  activeThinkingStepId = initialThinkingId;
  onEvent({ type: 'step_start', step: initialThinkingStep });

  const reasoningEffort =
    (process.env.GROQ_REASONING_EFFORT as 'high' | 'medium' | 'low' | 'default' | 'none') || 'high';

  const streamParams = {
    model,
    system: effectiveSystemPrompt,
    ...(messages ? { messages } : { prompt: currentUserPrompt }),
    tools,
    stopWhen: isStepCount(maxSteps),
    providerOptions: {
      groq: { reasoningEffort },
    },
  };

  try {
    const streamResult = streamText(streamParams);

    for await (const part of streamResult.fullStream) {
      if (part.type === 'reasoning-delta') {
        let activeThinking = activeThinkingStepId
          ? steps.find((s) => s.id === activeThinkingStepId && s.type === 'thinking')
          : null;

        if (!activeThinking || activeThinking.status !== 'active') {
          const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          activeThinking = {
            id: stepId,
            type: 'thinking',
            label: APP_CONTENT.process.thinking,
            reasoningText: '',
            status: 'active',
            timestamp: Date.now(),
          };
          steps.push(activeThinking);
          activeThinkingStepId = stepId;
          onEvent({ type: 'step_start', step: activeThinking });
        }

        activeThinking.reasoningText = (activeThinking.reasoningText ?? '') + part.text;
        onEvent({ type: 'reasoning_delta', stepId: activeThinking.id, delta: part.text });

      } else if (part.type === 'start-step') {
        // Only spawn thinking step if no other step (tool or thinking) is active
        const hasActive = steps.some((s) => s.status === 'active');
        if (!hasActive) {
          const nextId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const nextStep: AgentExecutionStep = {
            id: nextId,
            type: 'thinking',
            label: APP_CONTENT.process.thinking,
            reasoningText: '',
            status: 'active',
            timestamp: Date.now(),
          };
          steps.push(nextStep);
          activeThinkingStepId = nextId;
          onEvent({ type: 'step_start', step: nextStep });
        }

      } else if (part.type === 'tool-call') {
        // Close ONLY thinking steps when tools start.
        // DO NOT close concurrent tool steps!
        if (activeThinkingStepId) {
          const activeThinking = steps.find((s) => s.id === activeThinkingStepId);
          if (activeThinking && activeThinking.status === 'active') {
            activeThinking.status = 'completed';
            onEvent({ type: 'step_update', stepId: activeThinking.id, status: 'completed' });
          }
          activeThinkingStepId = null;
        }

        // Key directly to AI SDK's unique toolCallId
        const toolStepId = `tool_${part.toolCallId}`;
        const toolStep: AgentExecutionStep = {
          id: toolStepId,
          type: 'tool',
          toolName: part.toolName,
          label: part.toolName,
          status: 'active',
          timestamp: Date.now(),
          toolArgs: (part.input as Record<string, unknown>) ?? undefined,
        };
        steps.push(toolStep);
        onEvent({ type: 'step_start', step: toolStep });

      } else if (part.type === 'tool-result') {
        // Direct 1:1 match by unique toolCallId
        const targetId = `tool_${part.toolCallId}`;
        const matchingToolStep = steps.find((s) => s.id === targetId);

        if (matchingToolStep) {
          matchingToolStep.status = 'completed';
          matchingToolStep.toolResult = part.output;
          if (!matchingToolStep.toolArgs && part.input) {
            matchingToolStep.toolArgs = part.input as Record<string, unknown>;
          }

          onEvent({
            type: 'step_update',
            stepId: matchingToolStep.id,
            status: 'completed',
            toolArgs: matchingToolStep.toolArgs,
            toolResult: matchingToolStep.toolResult,
          });
        }

        executedToolCalls.push({
          toolName: part.toolName,
          args: (part.input as Record<string, unknown>) ?? {},
          result: part.output,
        });

      } else if (part.type === 'text-delta') {
        // Output text started; close any remaining active thinking step
        if (activeThinkingStepId) {
          const activeThinking = steps.find((s) => s.id === activeThinkingStepId);
          if (activeThinking && activeThinking.status === 'active') {
            activeThinking.status = 'completed';
            onEvent({ type: 'step_update', stepId: activeThinking.id, status: 'completed' });
          }
          activeThinkingStepId = null;
        }

        accumulatedText += part.text;

        // Buffer <session_title>...</session_title> without emitting to UI
        if (!titleTagClosed) {
          titleBuffer += part.text;
          if (!isBufferingTitle && titleBuffer.includes('<session_title>')) {
            isBufferingTitle = true;
          }

          if (isBufferingTitle) {
            const endIdx = titleBuffer.indexOf('</session_title>');
            if (endIdx !== -1) {
              const fullTag = titleBuffer.slice(0, endIdx + 16);
              const remainder = titleBuffer.slice(endIdx + 16);
              titleTagClosed = true;
              isBufferingTitle = false;

              const titleMatch = fullTag.match(/<session_title>([\s\S]*?)<\/session_title>/i);
              if (titleMatch) {
                emittedTitle = titleMatch[1].replace(/^["'`]+|["'`]+$/g, '').trim();
                if (emittedTitle) {
                  onEvent({ type: 'session_title', title: emittedTitle });
                }
              }

              if (remainder) {
                onEvent({ type: 'text_delta', delta: remainder.trimStart() });
              }
            }
            continue;
          }
        }

        onEvent({ type: 'text_delta', delta: part.text });
      }
    }
  } catch (err) {
    // Fail any unresolved active steps on stream error
    steps
      .filter((s) => s.status === 'active')
      .forEach((step) => {
        step.status = 'error';
        onEvent({ type: 'step_update', stepId: step.id, status: 'error' });
      });
    throw err;
  }

  // Ensure any dangling active thinking step is closed
  if (activeThinkingStepId) {
    const activeThinking = steps.find((s) => s.id === activeThinkingStepId);
    if (activeThinking && activeThinking.status === 'active') {
      activeThinking.status = 'completed';
      onEvent({ type: 'step_update', stepId: activeThinking.id, status: 'completed' });
    }
  }

  const titleMatch = accumulatedText.match(/<session_title>([\s\S]*?)<\/session_title>/i);
  const rawTitle = titleMatch ? titleMatch[1].trim() : undefined;
  const sessionTitle = emittedTitle ?? (rawTitle ? rawTitle.replace(/^["'`]+|["'`]+$/g, '').trim() : undefined);

  let cleanedAnalysis = accumulatedText.replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '').trim();
  if (!cleanedAnalysis && sessionTitle) {
    cleanedAnalysis = `Started a new chat for **${sessionTitle}**. How can I help you today?`;
  }

  const finalResult: AgentResult = {
    symbol: symbol?.toUpperCase(),
    sessionTitle,
    analysis: cleanedAnalysis,
    toolCalls: executedToolCalls,
    steps,
    stepCount: steps.length,
    executionMode: mode,
    timestamp: Date.now(),
  };

  onEvent({ type: 'done', result: finalResult });
  return finalResult;
}

export async function executeAgent(options: AgentOptions): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol } = options;
  const { model, tools, effectiveSystemPrompt, currentUserPrompt, messages } =
    prepareAgentInvocation(options);

  const reasoningEffort =
    (process.env.GROQ_REASONING_EFFORT as 'high' | 'medium' | 'low' | 'default' | 'none') || 'high';

  const generateParams = {
    model,
    system: effectiveSystemPrompt,
    ...(messages ? { messages } : { prompt: currentUserPrompt }),
    tools,
    stopWhen: isStepCount(maxSteps),
    providerOptions: {
      groq: { reasoningEffort },
    },
  };

  const { text, steps } = await generateText(generateParams);

  const stepTexts = steps
    .map((s) => s.text)
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .join('\n');
  const candidateText = `${stepTexts}\n${text}`;
  const titleMatch = candidateText.match(/<session_title>([\s\S]*?)<\/session_title>/i);

  const rawTitle = titleMatch ? titleMatch[1].trim() : undefined;
  const sessionTitle = rawTitle
    ? rawTitle.replace(/^["'`]+|["'`]+$/g, '').trim()
    : undefined;

  let cleanedAnalysis = text.replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '').trim();
  if (!cleanedAnalysis && sessionTitle) {
    cleanedAnalysis = `Started a new chat for **${sessionTitle}**. How can I help you today?`;
  }

  const executedToolCalls: ExecutedToolCall[] = [];
  const executionSteps: AgentExecutionStep[] = [];

  let stepSeq = 1;
  for (const step of steps) {
    executionSteps.push({
      id: `step_${stepSeq++}`,
      type: 'thinking',
      label: APP_CONTENT.process.thinking,
      status: 'completed',
      timestamp: Date.now(),
    });

    if (step.toolCalls && step.toolCalls.length > 0) {
      for (const call of step.toolCalls) {
        const resultItem = step.toolResults?.find(
          (r) => r.toolCallId === call.toolCallId
        );

        const args = (call.input as Record<string, unknown>) ?? {};
        const result = resultItem ? resultItem.output : undefined;

        executedToolCalls.push({
          toolName: call.toolName,
          args,
          result,
        });

        // toolArgs and toolResult are now populated for every tool
        executionSteps.push({
          id: `tool_${call.toolCallId ?? stepSeq++}`,
          type: 'tool',
          toolName: call.toolName,
          label: call.toolName,
          status: 'completed',
          toolArgs: args,
          toolResult: result,
          timestamp: Date.now(),
        });
      }
    }
  }

  return {
    symbol: symbol?.toUpperCase(),
    sessionTitle,
    analysis: cleanedAnalysis,
    toolCalls: executedToolCalls,
    steps: executionSteps,
    stepCount: executionSteps.length,
    executionMode: mode,
    timestamp: Date.now(),
  };
}

export const runAgent = executeAgent;
export const runArgusAgent = executeAgent;
export const streamArgusAgent = executeAgentStream;