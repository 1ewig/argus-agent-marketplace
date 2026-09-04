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
    backupModel,
    tools,
    effectiveSystemPrompt,
    currentUserPrompt,
    messages,
    reasoningEffort,
    maxTokens,
  } = prepareAgentInvocation(options);

  const startTime = Date.now();
  let currentStepPreToolText = '';
  const steps: AgentExecutionStep[] = [];
  const executedToolCalls: ExecutedToolCall[] = [];
  let activeThinkingStepId: string | null = null;
  let accumulatedText = '';

  // Stream interceptor to prevent raw <session_title> XML leaking to the client
  const titleFilter = new SessionTitleStreamFilter(
    (title) => onEvent({ type: 'session_title', title }),
    (delta) => onEvent({ type: 'text_delta', delta })
  );

  const buildStreamParams = (activeModel: typeof model) => ({
    model: activeModel,
    system: effectiveSystemPrompt,
    ...(messages ? { messages } : { prompt: currentUserPrompt }),
    tools,
    maxTokens,
    stopWhen: isStepCount(maxSteps),
    experimental_transform: smoothStream({
      delayInMs: 15,
      chunking: 'word',
    }),
    providerOptions: {
      groq: { reasoningEffort: reasoningEffort === 'max' ? 'high' : reasoningEffort },
      fireworks: {
        thinking: { type: 'enabled' },
        ...(reasoningEffort !== 'none' && reasoningEffort !== 'default'
          ? { reasoningEffort }
          : {}),
      },
    },
  });

  const runStreamWithModel = async (activeModel: typeof model) => {
    const streamResult = streamText(buildStreamParams(activeModel));

    for await (const part of streamResult.fullStream) {
      if (part.type === 'error') {
        throw part.error;
      }

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
        // Reset pre-tool text for new step
        currentStepPreToolText = '';

      } else if (part.type === 'tool-call') {
        // If text was generated prior to this tool call, convert it to an intermediate_text step
        const cleanedPreToolText = currentStepPreToolText
          .replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '')
          .replace(/<session_title[\s\S]*$/gi, '')
          .trim();

        if (cleanedPreToolText.length > 0) {
          const intermediateStepId = `step_text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const intermediateStep: AgentExecutionStep = {
            id: intermediateStepId,
            type: 'intermediate_text',
            label: APP_CONTENT.process.intermediateUpdateLabel,
            intermediateText: cleanedPreToolText,
            status: 'completed',
            timestamp: Date.now(),
            durationMs: 1000,
          };
          steps.push(intermediateStep);
          onEvent({ type: 'step_start', step: intermediateStep });
          onEvent({ type: 'clear_text' });
          accumulatedText = '';
          currentStepPreToolText = '';
        }

        // Close active thinking step when tool call initiates
        if (activeThinkingStepId) {
          const activeThinking = steps.find((s) => s.id === activeThinkingStepId);
          if (activeThinking && activeThinking.status === 'active') {
            if (!activeThinking.reasoningText?.trim()) {
              const idx = steps.findIndex((s) => s.id === activeThinkingStepId);
              if (idx !== -1) steps.splice(idx, 1);
            } else {
              activeThinking.status = 'completed';
              activeThinking.durationMs = Math.max(1000, Date.now() - activeThinking.timestamp);
              onEvent({
                type: 'step_update',
                stepId: activeThinking.id,
                status: 'completed',
                durationMs: activeThinking.durationMs,
              });
            }
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
        currentStepPreToolText = '';
        const targetId = `tool_${part.toolCallId}`;
        const matchingToolStep = steps.find((s) => s.id === targetId);

        if (matchingToolStep) {
          matchingToolStep.status = 'completed';
          matchingToolStep.durationMs = Math.max(1000, Date.now() - matchingToolStep.timestamp);
          matchingToolStep.toolResult = part.output;
          if (!matchingToolStep.toolArgs && part.input) {
            matchingToolStep.toolArgs = part.input as Record<string, unknown>;
          }

          onEvent({
            type: 'step_update',
            stepId: matchingToolStep.id,
            status: 'completed',
            durationMs: matchingToolStep.durationMs,
            toolArgs: matchingToolStep.toolArgs,
            toolResult: matchingToolStep.toolResult,
          });
        }

        executedToolCalls.push({
          toolName: part.toolName,
          args: (part.input as Record<string, unknown>) ?? {},
          result: part.output,
        });

      } else if (part.type === 'tool-error' || part.type === 'tool-output-denied') {
        currentStepPreToolText = '';
        const targetId = `tool_${part.toolCallId}`;
        const matchingToolStep = steps.find((s) => s.id === targetId);

        const errorObj = 'error' in part ? part.error : 'Tool execution denied';
        const errorMessage =
          errorObj instanceof Error
            ? errorObj.message
            : typeof errorObj === 'string'
            ? errorObj
            : typeof errorObj === 'object' && errorObj !== null && 'message' in errorObj
            ? String((errorObj as { message: unknown }).message)
            : 'Tool execution failed';

        if (matchingToolStep) {
          matchingToolStep.status = 'error';
          matchingToolStep.durationMs = Math.max(1000, Date.now() - matchingToolStep.timestamp);
          matchingToolStep.toolResult = {
            success: false,
            error: errorMessage,
          };
          if (!matchingToolStep.toolArgs && 'input' in part && part.input) {
            matchingToolStep.toolArgs = part.input as Record<string, unknown>;
          }

          onEvent({
            type: 'step_update',
            stepId: matchingToolStep.id,
            status: 'error',
            durationMs: matchingToolStep.durationMs,
            toolArgs: matchingToolStep.toolArgs,
            toolResult: matchingToolStep.toolResult,
          });
        }

        executedToolCalls.push({
          toolName: part.toolName,
          args: ('input' in part && (part.input as Record<string, unknown>)) || {},
          result: { success: false, error: errorMessage },
        });

      } else if (part.type === 'text-delta') {
        // Output text started; close any remaining active thinking step
        if (activeThinkingStepId) {
          const activeThinking = steps.find((s) => s.id === activeThinkingStepId);
          if (activeThinking && activeThinking.status === 'active') {
            if (!activeThinking.reasoningText?.trim()) {
              const idx = steps.findIndex((s) => s.id === activeThinkingStepId);
              if (idx !== -1) steps.splice(idx, 1);
            } else {
              activeThinking.status = 'completed';
              activeThinking.durationMs = Math.max(1000, Date.now() - activeThinking.timestamp);
              onEvent({
                type: 'step_update',
                stepId: activeThinking.id,
                status: 'completed',
                durationMs: activeThinking.durationMs,
              });
            }
          }
          activeThinkingStepId = null;
        }

        currentStepPreToolText += part.text;
        accumulatedText += part.text;
        titleFilter.processChunk(part.text);
      }
    }
  };

  try {
    try {
      await runStreamWithModel(model);
    } catch (primaryErr) {
      if (accumulatedText.length === 0 && backupModel) {
        console.warn('Primary model error, failing over to backup model:', primaryErr);
        // Cleanly mark any dangling active steps from the failed primary attempt
        steps
          .filter((s) => s.status === 'active')
          .forEach((step) => {
            step.status = 'error';
            if (!step.toolResult && step.type === 'tool') {
              step.toolResult = { success: false, error: 'Switched to backup model' };
            }
            onEvent({
              type: 'step_update',
              stepId: step.id,
              status: 'error',
              toolResult: step.toolResult,
            });
          });
        activeThinkingStepId = null;
        await runStreamWithModel(backupModel);
      } else {
        throw primaryErr;
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

  // Ensure any dangling active steps (thinking or tool calls) are cleanly finalized
  for (const step of steps) {
    if (step.status === 'active') {
      if (step.type === 'thinking') {
        step.status = 'completed';
        step.durationMs = Math.max(1000, Date.now() - step.timestamp);
        onEvent({
          type: 'step_update',
          stepId: step.id,
          status: 'completed',
          durationMs: step.durationMs,
        });
      } else if (step.type === 'tool') {
        step.status = step.toolResult ? 'completed' : 'error';
        step.durationMs = Math.max(1000, Date.now() - step.timestamp);
        if (!step.toolResult) {
          step.toolResult = {
            success: false,
            error: 'Tool execution was interrupted or timed out',
          };
        }
        onEvent({
          type: 'step_update',
          stepId: step.id,
          status: step.status,
          durationMs: step.durationMs,
          toolArgs: step.toolArgs,
          toolResult: step.toolResult,
        });
      }
    }
  }

  // Flush any remaining buffer in the title filter
  titleFilter.flush();

  const { sessionTitle, cleanedText } = extractSessionTitle(
    accumulatedText,
    titleFilter.getEmittedTitle()
  );

  const workedDurationMs = Math.max(1000, Date.now() - startTime);

  const prunedSteps = steps.filter(
    (s) => s.type !== 'thinking' || Boolean(s.reasoningText?.trim())
  );

  const finalResult: AgentResult = {
    symbol: symbol?.toUpperCase(),
    sessionTitle,
    analysis: cleanedText,
    toolCalls: executedToolCalls,
    steps: prunedSteps,
    stepCount: prunedSteps.length,
    executionMode: mode,
    workedDurationMs,
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
    backupModel,
    tools,
    effectiveSystemPrompt,
    currentUserPrompt,
    messages,
    reasoningEffort,
    maxTokens,
  } = prepareAgentInvocation(options);

  const buildGenerateParams = (activeModel: typeof model) => ({
    model: activeModel,
    system: effectiveSystemPrompt,
    ...(messages ? { messages } : { prompt: currentUserPrompt }),
    tools,
    maxTokens,
    stopWhen: isStepCount(maxSteps),
    providerOptions: {
      groq: { reasoningEffort: reasoningEffort === 'max' ? 'high' : reasoningEffort },
      fireworks: {
        thinking: { type: 'enabled' },
        ...(reasoningEffort !== 'none' && reasoningEffort !== 'default'
          ? { reasoningEffort }
          : {}),
      },
    },
  });

  let generateResult;
  try {
    generateResult = await generateText(buildGenerateParams(model));
  } catch (primaryErr) {
    if (backupModel) {
      console.warn('Primary model error, failing over to backup model:', primaryErr);
      generateResult = await generateText(buildGenerateParams(backupModel));
    } else {
      throw primaryErr;
    }
  }
  const { text, steps } = generateResult;

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