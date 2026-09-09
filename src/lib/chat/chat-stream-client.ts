import type { AgentStreamEvent, AgentResult } from '@/agent/types';
import type { ExecutionMode } from '@/lib/types';
import type { ChatHistoryMessage } from './chat-history';
import { APP_CONTENT } from '@/constants/content';

export interface StreamAgentChatParams {
  message: string;
  mode: ExecutionMode;
  history: ChatHistoryMessage[];
  isFirstTurn: boolean;
  symbol?: string;
  signal?: AbortSignal;
  onEvent: (event: AgentStreamEvent) => void | Promise<void>;
}

/**
 * Client transport service that streams real-time SSE events from /api/agent/chat.
 * Decouples raw HTTP body reading, byte decoding, and newline buffering from UI state.
 */
export async function streamAgentChat({
  message,
  mode,
  history,
  isFirstTurn,
  symbol,
  signal,
  onEvent,
}: StreamAgentChatParams): Promise<AgentResult | null> {
  const response = await fetch('/api/agent/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      mode,
      history,
      isFirstTurn,
      symbol,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(APP_CONTENT.chat.errorNotice);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult: AgentResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr) continue;

      let event: AgentStreamEvent;
      try {
        event = JSON.parse(jsonStr) as AgentStreamEvent;
      } catch {
        // Ignore transient non-JSON keepalive or partial lines
        continue;
      }

      if (event.type === 'done') {
        finalResult = event.result;
      }
      await onEvent(event);
    }
  }

  return finalResult;
}
