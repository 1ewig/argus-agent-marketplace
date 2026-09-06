import { streamText, isStepCount, smoothStream } from 'ai';
import { prepareAgentInvocation } from './prepare-invocation';
import { AgentStreamStateMachine } from './stream-state-machine';
import { extractSessionTitle } from '../transforms/title-stream-filter';
import { extractFollowUpQuestions } from '../transforms/follow-up-extractor';
import type { AgentOptions, AgentResult, AgentStreamEvent } from '../types';

export const streamArgusAgent = executeAgentStream;

/**
 * Executes an autonomous multi-step agent reasoning stream using Vercel AI SDK.
 * Emits real-time SSE events for thinking deltas, tool executions, and stream output.
 */
export async function executeAgentStream(
  options: AgentOptions,
  onEvent: (event: AgentStreamEvent) => void
): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol, abortSignal } = options;
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
  let accumulatedText = '';
  let emittedTitle: string | undefined;
  const stateMachine = new AgentStreamStateMachine(onEvent);

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `\n🤖 [Argus:ChatAgent] Started | Symbol: ${symbol ?? 'GLOBAL'} | Mode: ${mode} | MaxSteps: ${maxSteps}`
    );
    console.log(
      `   Prompt: "${options.prompt.slice(0, 100)}${options.prompt.length > 100 ? '...' : ''}"`
    );
  }

  const buildStreamParams = (activeModel: typeof model) => ({
    model: activeModel,
    system: effectiveSystemPrompt,
    ...(messages ? { messages } : { prompt: currentUserPrompt }),
    tools,
    maxTokens,
    abortSignal,
    stopWhen: isStepCount(maxSteps),
    experimental_transform: smoothStream({
      delayInMs: 15,
      chunking: 'word',
    }),
    providerOptions: {
      groq: { reasoningEffort: reasoningEffort === 'max' ? 'high' : reasoningEffort },
      fireworks: {
        thinking: { type: 'enabled' as const },
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
        stateMachine.onReasoningDelta(part.text);
      } else if (part.type === 'start-step') {
        stateMachine.onStartStep();
      } else if (part.type === 'tool-call') {
        stateMachine.onToolCall(part);
      } else if (part.type === 'tool-result') {
        stateMachine.onToolResult(part);
      } else if (part.type === 'tool-error' || part.type === 'tool-output-denied') {
        stateMachine.onToolError(part);
      } else if (part.type === 'text-delta') {
        stateMachine.onTextDelta(part.text);
        accumulatedText += part.text;
        onEvent({ type: 'text_delta', delta: part.text });

        if (!emittedTitle) {
          const match = accumulatedText.match(/<session_title>([\s\S]*?)<\/session_title>/i);
          if (match && match[1]) {
            emittedTitle = match[1].replace(/^["'`]+|["'`]+$/g, '').trim();
            if (emittedTitle) {
              onEvent({ type: 'session_title', title: emittedTitle });
            }
          }
        }
      }
    }
  };

  try {
    try {
      await runStreamWithModel(model);
    } catch (primaryErr) {
      if (abortSignal?.aborted) {
        throw primaryErr;
      }
      if (accumulatedText.length === 0 && backupModel) {
        console.warn('Primary model error, failing over to backup model:', primaryErr);
        stateMachine.markActiveStepsFailed('Switched to backup model');
        await runStreamWithModel(backupModel);
      } else {
        throw primaryErr;
      }
    }
  } catch (err) {
    stateMachine.markActiveStepsFailed();
    throw err;
  }

  // Ensure any dangling active steps are cleanly finalized
  const steps = stateMachine.finalizeSteps();
  const executedToolCalls = stateMachine.getExecutedToolCalls();

  const effectiveIsFirstTurn =
    options.isFirstTurn ?? (!options.history || options.history.length === 0);

  const { sessionTitle, cleanedText: textWithoutTitle } = extractSessionTitle(
    accumulatedText,
    emittedTitle,
    options.prompt,
    symbol,
    effectiveIsFirstTurn
  );

  const { followUpQuestions, cleanedText } = extractFollowUpQuestions(
    textWithoutTitle,
    symbol
  );

  const workedDurationMs = Math.max(1000, Date.now() - startTime);

  const finalResult: AgentResult = {
    symbol: symbol?.toUpperCase(),
    sessionTitle,
    analysis: cleanedText,
    followUpQuestions,
    toolCalls: executedToolCalls,
    steps,
    stepCount: steps.length,
    executionMode: mode,
    workedDurationMs,
    timestamp: Date.now(),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `🏁 [Argus:ChatAgent] Finished in ${workedDurationMs}ms (${steps.length} steps, ${executedToolCalls.length} tools)`
    );
    if (sessionTitle) {
      console.log(`   🏷️ [Session Title]: "${sessionTitle}"`);
    }
  }

  onEvent({ type: 'done', result: finalResult });
  return finalResult;
}

