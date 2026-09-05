import { APP_CONTENT } from '@/constants/content';

/**
 * Result of extracting a session title from raw agent output
 */
export interface ExtractedTitleResult {
  sessionTitle?: string;
  cleanedText: string;
}

/**
 * Generates an intelligent, natural 2-4 word session title from the user prompt and symbol.
 */
export function generateFallbackSessionTitle(prompt: string, symbol?: string): string {
  const cleanPrompt = (prompt || '').trim();
  const upperPrompt = cleanPrompt.toUpperCase();

  // Detect coin / symbol in prompt or use provided workspace symbol
  const matchedCoin =
    upperPrompt.match(/\b(BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX|LINK|SUI|PEPE|SHIB|NEAR|APT|RENDER|TAO|FET|ARB|OP|DOT)\b/)?.[1] ||
    (symbol && symbol.toUpperCase() !== 'GLOBAL'
      ? symbol.toUpperCase().replace(/USDT$|BUSD$|USD$/, '')
      : undefined);

  const coinPrefix = matchedCoin ? `${matchedCoin} ` : '';

  if (/\b(PRICE|HOW MUCH|WORTH|VALUE|COST)\b/i.test(cleanPrompt)) {
    return coinPrefix ? `${coinPrefix}Price Check` : 'Market Price Check';
  }
  if (/\b(DEPTH|ORDER BOOK|BIDS?|ASKS?|WALLS?|SPREAD|SLIPPAGE)\b/i.test(cleanPrompt)) {
    return coinPrefix ? `${coinPrefix}Order Book Depth` : 'Order Book Liquidity';
  }
  if (/\b(FUNDING|RATES?|OI|OPEN INTEREST|LONG|SHORT|RATIO)\b/i.test(cleanPrompt)) {
    return coinPrefix ? `${coinPrefix}Funding & Sentiment` : 'Futures Sentiment';
  }
  if (/\b(NEWS|CATALYST|EVENT|WHY|PUMP|DUMP|UPDATE)\b/i.test(cleanPrompt)) {
    return coinPrefix ? `${coinPrefix}News & Drivers` : 'Market News & Catalysts';
  }
  if (/\b(STATS|24H|VOLUME|HIGH|LOW|CHANGE|PERFORMANCE)\b/i.test(cleanPrompt)) {
    return coinPrefix ? `${coinPrefix}24h Market Stats` : '24h Market Stats';
  }
  if (/\b(KLINES?|CANDLES?|CHART|TREND|EMA|RSI|TECHNICAL)\b/i.test(cleanPrompt)) {
    return coinPrefix ? `${coinPrefix}Technical Trend` : 'Technical Trend Analysis';
  }
  if (/\b(MOVER|GAINER|LOSER|TOP|COMPARE)\b/i.test(cleanPrompt)) {
    return 'Top Market Movers';
  }

  // If the prompt is already a short 2-4 word inquiry, clean and title-case it
  const words = cleanPrompt.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 4 && cleanPrompt.length <= 30) {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return matchedCoin ? `${matchedCoin} Market Analysis` : 'Market Analysis';
}

/**
 * Extracts and removes <session_title> tags from accumulated agent text.
 * Uses flexible regex patterns and falls back to autonomous title generation on turn 1.
 */
export function extractSessionTitle(
  rawText: string,
  fallbackTitle?: string,
  prompt?: string,
  symbol?: string,
  isFirstTurn?: boolean
): ExtractedTitleResult {
  // Match standard <session_title> tags or fallback variations
  const titleMatch =
    rawText.match(/<session_title>([\s\S]*?)<\/session_title>/i) ||
    rawText.match(/<title>([\s\S]*?)<\/title>/i) ||
    rawText.match(/\[session_title:\s*([^\]]+)\]/i) ||
    rawText.match(/<session_title>([^\n<]+)/i);

  const rawTitle = titleMatch ? titleMatch[1].trim() : undefined;
  let sessionTitle =
    fallbackTitle ?? (rawTitle ? rawTitle.replace(/^["'`]+|["'`]+$/g, '').trim() : undefined);

  // If on first turn and still no title found, generate intelligent fallback
  if (!sessionTitle && isFirstTurn && prompt) {
    sessionTitle = generateFallbackSessionTitle(prompt, symbol);
  }

  let cleanedText = rawText
    .replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/\[session_title:\s*[^\]]+\]\s*/gi, '')
    .replace(/<session_title>[^\n<]*\n?/gi, '')
    .trim();

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
  private buffer = '';
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

    this.buffer += chunk;

    // Check if the complete tag is present in the buffer
    const match = this.buffer.match(/<session_title>([\s\S]*?)<\/session_title>/i);
    if (match && match.index !== undefined) {
      this.emittedTitle = match[1].replace(/^["'`]+|["'`]+$/g, '').trim();
      if (this.emittedTitle) {
        this.onTitle(this.emittedTitle);
      }
      this.titleResolved = true;

      // Emit anything before the tag
      const beforeTag = this.buffer.slice(0, match.index);
      if (beforeTag) {
        this.onTextDelta(beforeTag);
      }
      // Emit anything after the tag
      const afterTag = this.buffer.slice(match.index + match[0].length);
      if (afterTag) {
        this.onTextDelta(afterTag.trimStart());
      }
      this.buffer = '';
      return;
    }

    // If an opening tag has started, keep buffering until closing tag arrives
    if (this.buffer.includes('<session_title')) {
      // If tag is excessively long (>250 chars), abandon buffering and flush
      if (this.buffer.length > 250) {
        this.titleResolved = true;
        this.onTextDelta(this.buffer);
        this.buffer = '';
      }
      return;
    }

    // If no '<session_title' found and buffer is getting long (>150 chars),
    // emit text to keep client stream fluid, but keep last 30 chars in case tag spans chunk boundary
    if (this.buffer.length > 150) {
      const flushLength = this.buffer.length - 30;
      const toEmit = this.buffer.slice(0, flushLength);
      this.buffer = this.buffer.slice(flushLength);
      this.onTextDelta(toEmit);
    }
  }

  /**
   * Flushes any residual text in the buffer if stream ended before resolution
   */
  flush(): void {
    if (!this.titleResolved && this.buffer.length > 0) {
      const match = this.buffer.match(/<session_title>([\s\S]*?)<\/session_title>/i);
      if (match) {
        this.emittedTitle = match[1].replace(/^["'`]+|["'`]+$/g, '').trim();
        if (this.emittedTitle) {
          this.onTitle(this.emittedTitle);
        }
        const cleaned = this.buffer.replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '');
        if (cleaned) {
          this.onTextDelta(cleaned);
        }
      } else {
        this.onTextDelta(this.buffer);
      }
      this.titleResolved = true;
      this.buffer = '';
    }
  }

  getEmittedTitle(): string | undefined {
    return this.emittedTitle;
  }
}
