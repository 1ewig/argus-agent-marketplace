import { GLOBAL_WORKSPACE_SYMBOL } from './utils';

/**
 * Standard crypto quote currencies recognized across Binance markets
 */
export const KNOWN_QUOTE_ASSETS = [
  'USDT',
  'USDC',
  'FDUSD',
  'BUSD',
  'EUR',
  'TRY',
  'BTC',
  'ETH',
  'BNB',
] as const;

export type KnownQuoteAsset = (typeof KNOWN_QUOTE_ASSETS)[number];

/**
 * Normalizes any raw trading symbol input for display and query formatting:
 * - Trims whitespace
 * - Converts to uppercase
 * - Strips common pairing separators: / \ - _
 */
export function normalizeSymbolForDisplay(rawSymbol?: string | null): string {
  if (!rawSymbol) return '';
  return rawSymbol.trim().toUpperCase().replace(/[/\\_-]/g, '');
}

/**
 * Splits a Binance trading symbol (e.g. BTCUSDT, SOLUSDC) into base and quote assets,
 * or identifies special workspace symbols like 'GLOBAL'.
 */
export function parseSymbolAssets(rawSymbol?: string | null): {
  baseAsset: string;
  quoteAsset: string;
} {
  const clean = normalizeSymbolForDisplay(rawSymbol) || 'BTCUSDT';
  if (clean === GLOBAL_WORKSPACE_SYMBOL) {
    return { baseAsset: GLOBAL_WORKSPACE_SYMBOL, quoteAsset: '' };
  }

  for (const quote of KNOWN_QUOTE_ASSETS) {
    if (clean.endsWith(quote) && clean.length > quote.length) {
      return {
        baseAsset: clean.slice(0, -quote.length),
        quoteAsset: quote,
      };
    }
  }

  return {
    baseAsset: clean,
    quoteAsset: '',
  };
}

/**
 * Extracts the base coin asset from a trading pair (e.g. "BTCUSDT" -> "BTC").
 */
export function extractBaseAsset(rawSymbol?: string | null): string {
  return parseSymbolAssets(rawSymbol).baseAsset;
}
