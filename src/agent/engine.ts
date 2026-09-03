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

/**
 * Builds the shared prompt, system directives, tools, and message history
 * for agent execution.
 */
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

  // 1. Initialize the adapter and bind Binance MCP tools
  const adapter = getBinanceAdapter(mode);
  const tools = buildAgentTools(adapter);

  // 2. Obtain Groq model instance
  const model = getAgentModel(modelName, apiKey);

  // 3. Construct user prompt with optional pair context
  const currentUserPrompt = symbol
    ? `[Pair Context: ${symbol.toUpperCase()}]\nUser: ${prompt}`
    : prompt;

  // 4. Assemble system prompt with autonomous session titling directive on first turn
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

/**
 * Executes the core Argus Agent reasoning and tool-calling loop in streaming mode.
 * Emits real-time SSE lifecycle events: Thinking -> Tool -> Thinking -> Response deltas -> Done.
 * 
 * @param options - Prompt, context, history, execution mode, and optional API overrides
 * @param onEvent - Event listener callback for real-time streaming updates
 * @returns Structured AgentResult with text analysis, tool telemetry, and step history
 */
export async function executeAgentStream(
  options: AgentOptions,
  onEvent: (event: AgentStreamEvent) => void
): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol } = options;
  const { model, tools, effectiveSystemPrompt, currentUserPrompt, messages } =
    prepareAgentInvocation(options);

  const steps: AgentExecutionStep[] = [];
  const executedToolCalls: ExecutedToolCall[] = [];
  let activeStepId: string | null = null;
  let accumulatedText = '';
  let emittedTitle: string | undefined;

  // 1. Emit initial Thinking step
  const initialThinkingId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const initialThinkingStep: AgentExecutionStep = {
    id: initialThinkingId,
    type: 'thinking',
    label: APP_CONTENT.process.thinking,
    status: 'active',
    timestamp: Date.now(),
  };
  steps.push(initialThinkingStep);
  activeStepId = initialThinkingId;
  onEvent({ type: 'step_start', step: initialThinkingStep });

  // 2. Invoke multi-step streamText with configured reasoning effort
  const reasoningEffort =
    (process.env.GROQ_REASONING_EFFORT as 'high' | 'medium' | 'low' | 'default' | 'none') || 'high';

  const providerOptions = {
    groq: {
      reasoningEffort,
    },
  };

  const streamParams = messages
    ? {
        model,
        system: effectiveSystemPrompt,
        messages,
        tools,
        stopWhen: isStepCount(maxSteps),
        providerOptions,
      }
    : {
        model,
        system: effectiveSystemPrompt,
        prompt: currentUserPrompt,
        tools,
        stopWhen: isStepCount(maxSteps),
        providerOptions,
      };

  const streamResult = streamText(streamParams);

  // 3. Process the full stream parts
  for await (const part of streamResult.fullStream) {
    if (part.type === 'tool-call') {
      // Complete previous thinking step
      if (activeStepId) {
        const prevStep = steps.find((s) => s.id === activeStepId);
        if (prevStep && prevStep.status === 'active') {
          prevStep.status = 'completed';
          onEvent({ type: 'step_update', stepId: prevStep.id, status: 'completed' });
        }
      }

      // Start tool step
      const toolStepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const toolStep: AgentExecutionStep = {
        id: toolStepId,
        type: 'tool',
        toolName: part.toolName,
        label: part.toolName,
        status: 'active',
        timestamp: Date.now(),
      };
      steps.push(toolStep);
      activeStepId = toolStepId;
      onEvent({ type: 'step_start', step: toolStep });
    } else if (part.type === 'tool-result') {
      // Complete active tool step
      if (activeStepId) {
        const toolStep = steps.find((s) => s.id === activeStepId);
        if (toolStep && toolStep.type === 'tool') {
          toolStep.status = 'completed';
          onEvent({ type: 'step_update', stepId: toolStep.id, status: 'completed' });
        }
      }

      // Record tool telemetry
      executedToolCalls.push({
        toolName: part.toolName,
        args: (part.input as Record<string, unknown>) ?? {},
        result: part.output,
      });

      // Begin next thinking step after receiving tool data
      const nextThinkingId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const nextThinkingStep: AgentExecutionStep = {
        id: nextThinkingId,
        type: 'thinking',
        label: APP_CONTENT.process.analyzing,
        status: 'active',
        timestamp: Date.now(),
      };
      steps.push(nextThinkingStep);
      activeStepId = nextThinkingId;
      onEvent({ type: 'step_start', step: nextThinkingStep });
    } else if (part.type === 'text-delta') {
      // Model is outputting response tokens; complete previous thinking step
      if (activeStepId) {
        const activeStep = steps.find((s) => s.id === activeStepId);
        if (activeStep && activeStep.status === 'active') {
          activeStep.status = 'completed';
          onEvent({ type: 'step_update', stepId: activeStep.id, status: 'completed' });
          activeStepId = null;
        }
      }

      accumulatedText += part.text;

      // Check if session title was just completed in first turn
      if (!emittedTitle) {
        const titleMatch = accumulatedText.match(/<session_title>([\s\S]*?)<\/session_title>/i);
        if (titleMatch) {
          const rawTitle = titleMatch[1].trim();
          emittedTitle = rawTitle.replace(/^["'`]+|["'`]+$/g, '').trim();
          if (emittedTitle) {
            onEvent({ type: 'session_title', title: emittedTitle });
          }
        }
      }

      // Stream text delta to client
      onEvent({ type: 'text_delta', delta: part.text });
    }
  }

  // 4. Ensure any remaining active step is closed
  if (activeStepId) {
    const activeStep = steps.find((s) => s.id === activeStepId);
    if (activeStep && activeStep.status === 'active') {
      activeStep.status = 'completed';
      onEvent({ type: 'step_update', stepId: activeStep.id, status: 'completed' });
      activeStepId = null;
    }
  }

  // 5. Clean analysis text & session title
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

/**
 * Executes the core Argus Agent reasoning and tool-calling loop (non-streaming fallback)
 * 
 * @param options - Prompt, context, history, execution mode, and optional API overrides
 * @returns Structured AgentResult with text analysis and tool telemetry
 */
export async function executeAgent(options: AgentOptions): Promise<AgentResult> {
  const { maxSteps = 5, mode = 'simulation', symbol } = options;
  const { model, tools, effectiveSystemPrompt, currentUserPrompt, messages } =
    prepareAgentInvocation(options);

  const reasoningEffort =
    (process.env.GROQ_REASONING_EFFORT as 'high' | 'medium' | 'low' | 'default' | 'none') || 'high';

  const providerOptions = {
    groq: {
      reasoningEffort,
    },
  };

  const generateParams = messages
    ? {
        model,
        system: effectiveSystemPrompt,
        messages,
        tools,
        stopWhen: isStepCount(maxSteps),
        providerOptions,
      }
    : {
        model,
        system: effectiveSystemPrompt,
        prompt: currentUserPrompt,
        tools,
        stopWhen: isStepCount(maxSteps),
        providerOptions,
      };

  const { text, steps } = await generateText(generateParams);

  // Extract session title if generated by the agent on first turn
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

  // Extract executed tool calls and telemetry from all completed steps
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
        executedToolCalls.push({
          toolName: call.toolName,
          args: (call.input as Record<string, unknown>) ?? {},
          result: resultItem ? resultItem.output : undefined,
        });

        executionSteps.push({
          id: `step_${stepSeq++}`,
          type: 'tool',
          toolName: call.toolName,
          label: call.toolName,
          status: 'completed',
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

// Convenient aliases
export const runAgent = executeAgent;
export const runArgusAgent = executeAgent;
export const streamArgusAgent = executeAgentStream;
