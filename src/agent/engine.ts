import { generateText, streamText, isStepCount, smoothStream } from 'ai';
import { prepareAgentInvocation } from './prepare-invocation';
import { SessionTitleStreamFilter, extractSessionTitle } from './title-stream-filter';
import { APP_CONTENT } from '@/constants/content';
import type {
  AgentOptions,
  AgentResult,
  AgentStreamEvent,
  AgentExecutionStep,
  ExecutedToolCall,
} from './types';

/**
 * Executes an autonomous multi-step agent reasoning stream using Vercel AI SDK.
 * Emits real-time SSE events for thinking deltas, tool executions, and stream output.
 */
export async function executeAgentStream(
  options: AgentOptions,
  onEvent: (event: AgentStreamEvent) => void
): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol } = options;
  const {
    model,
    tools,
    effectiveSystemPrompt,
    currentUserPrompt,
    messages,
    reasoningEffort,
  } = prepareAgentInvocation(options);

  const steps: AgentExecutionStep[] = [];
  const executedToolCalls: ExecutedToolCall[] = [];
  let activeThinkingStepId: string | null = null;
  let accumulatedText = '';

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

  // 2. Stream interceptor to prevent raw <session_title> XML leaking to the client
  const titleFilter = new SessionTitleStreamFilter(
    (title) => onEvent({ type: 'session_title', title }),
    (delta) => onEvent({ type: 'text_delta', delta })
  );

  const streamParams = {
    model,
    system: effectiveSystemPrompt,
    ...(messages ? { messages } : { prompt: currentUserPrompt }),
    tools,
    stopWhen: isStepCount(maxSteps),
    experimental_transform: smoothStream({
      delayInMs: 15,
      chunking: 'word',
    }),
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
        // Spawn a thinking step only if no other step is currently active
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
        // Close active thinking step when tool call initiates
        if (activeThinkingStepId) {
          const activeThinking = steps.find((s) => s.id === activeThinkingStepId);
          if (activeThinking && activeThinking.status === 'active') {
            activeThinking.status = 'completed';
            onEvent({ type: 'step_update', stepId: activeThinking.id, status: 'completed' });
          }
          activeThinkingStepId = null;
        }

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
        titleFilter.processChunk(part.text);
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

  // Flush any remaining buffer in the title filter
  titleFilter.flush();

  const { sessionTitle, cleanedText } = extractSessionTitle(
    accumulatedText,
    titleFilter.getEmittedTitle()
  );

  const finalResult: AgentResult = {
    symbol: symbol?.toUpperCase(),
    sessionTitle,
    analysis: cleanedText,
    toolCalls: executedToolCalls,
    steps,
    stepCount: steps.length,
    executionMode: mode,
    timestamp: Date.now(),
  };

  onEvent({ type: 'done', result: finalResult });
  return finalResult;
}

/**
 * Executes a one-shot batch agent inference without SSE streaming.
 */
export async function executeAgent(options: AgentOptions): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol } = options;
  const {
    model,
    tools,
    effectiveSystemPrompt,
    currentUserPrompt,
    messages,
    reasoningEffort,
  } = prepareAgentInvocation(options);

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

  const { sessionTitle, cleanedText } = extractSessionTitle(candidateText);

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
    analysis: cleanedText,
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