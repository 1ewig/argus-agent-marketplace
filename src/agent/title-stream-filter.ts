import { APP_CONTENT } from '@/constants/content';

/**
 * Result of extracting a session title from raw agent output
 */
export interface ExtractedTitleResult {
  sessionTitle?: string;
  cleanedText: string;
}

/**
 * Extracts and removes <session_title> tags from accumulated agent text.
 * Provides fallback conversational text if the agent only produced a title tag.
 */
export function extractSessionTitle(rawText: string, fallbackTitle?: string): ExtractedTitleResult {
  const titleMatch = rawText.match(/<session_title>([\s\S]*?)<\/session_title>/i);
  const rawTitle = titleMatch ? titleMatch[1].trim() : undefined;
  const sessionTitle =
    fallbackTitle ?? (rawTitle ? rawTitle.replace(/^["'`]+|["'`]+$/g, '').trim() : undefined);

  let cleanedText = rawText.replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '').trim();

  if (!cleanedText && sessionTitle) {
    cleanedText = APP_CONTENT.chat.newSessionGreeting(sessionTitle);
  }

  return { sessionTitle, cleanedText };
}

/**
 * Stateful stream interceptor that buffers in-flight <session_title>...</session_title>
 * markup so raw XML tags are never leaked to the client stream.
 */
export class SessionTitleStreamFilter {
  private titleBuffer = '';
  private titleResolved = false;
  private emittedTitle?: string;

  constructor(
    private readonly onTitle: (title: string) => void,
    private readonly onTextDelta: (delta: string) => void
  ) {}

  /**
   * Ingests a text chunk from the stream and filters out <session_title> tags
   */
  processChunk(chunk: string): void {
    if (this.titleResolved) {
      this.onTextDelta(chunk);
      return;
    }

    this.titleBuffer += chunk;
    const match = this.titleBuffer.match(/<session_title>([\s\S]*?)<\/session_title>/i);

    if (match) {
      this.emittedTitle = match[1].replace(/^["'`]+|["'`]+$/g, '').trim();
      if (this.emittedTitle) {
        this.onTitle(this.emittedTitle);
      }
      this.titleResolved = true;

      const afterTag = this.titleBuffer.slice((match.index ?? 0) + match[0].length);
      if (afterTag) {
        this.onTextDelta(afterTag.trimStart());
      }
      return;
    }

    // If buffer clearly doesn't begin with '<' or exceeds 150 chars, flush and stop buffering
    if (!this.titleBuffer.trimStart().startsWith('<') || this.titleBuffer.length > 150) {
      this.titleResolved = true;
      this.onTextDelta(this.titleBuffer);
      this.titleBuffer = '';
    }
  }

  /**
   * Flushes any residual text in the buffer if stream ended before resolution
   */
  flush(): void {
    if (!this.titleResolved && this.titleBuffer.length > 0) {
      this.titleResolved = true;
      this.onTextDelta(this.titleBuffer);
      this.titleBuffer = '';
    }
  }

  getEmittedTitle(): string | undefined {
    return this.emittedTitle;
  }
}
