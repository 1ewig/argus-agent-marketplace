import { APP_CONTENT } from '@/constants/content';
import { extractBaseAsset } from '@/lib/symbols';
import { isGlobalSymbol } from '@/lib/utils';
import {
  SESSION_TITLE_TAG_REGEX,
  INCOMPLETE_SESSION_TITLE_TAG_REGEX,
  sanitizeAgentText,
} from './sanitizer';

export { SESSION_TITLE_TAG_REGEX, INCOMPLETE_SESSION_TITLE_TAG_REGEX, sanitizeAgentText };

/**
 * Checks if a session title matches a placeholder / default name.
 */
export function isDefaultSessionTitle(title?: string | null): boolean {
  if (!title) return true;
  return (APP_CONTENT.chat.defaultSessionTitles as readonly string[]).includes(title);
}

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
    (symbol && !isGlobalSymbol(symbol) ? extractBaseAsset(symbol) : undefined);

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


