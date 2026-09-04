/**
 * Sanitizes and validates a Binance trading symbol:
 * - Strips outer quotes ("BTCUSDT" -> BTCUSDT, 'BTCUSDT' -> BTCUSDT)
 * - Strips internal separators (BTC/USDT -> BTCUSDT, BTC-USDT -> BTCUSDT)
 * - Converts to uppercase (btcusdt -> BTCUSDT)
 * - Enforces length and alphanumeric character format
 * - Verifies standard quote currency suffix
 */
export function normalizeSymbol(rawSymbol: string): string {
  if (!rawSymbol || typeof rawSymbol !== 'string') {
    throw new Error('Trading symbol cannot be empty');
  }

  // Strip outer quotes and spaces
  let clean = rawSymbol.trim().replace(/^["']+|["']+$/g, '').trim().toUpperCase();

  // Strip common pairing separators: / \ - _
  clean = clean.replace(/[/\\_-]/g, '');

  if (!clean || clean.length < 2 || clean.length > 20) {
    throw new Error('Trading symbol must be between 2 and 20 alphanumeric characters');
  }

  if (!/^[A-Z0-9]+$/.test(clean)) {
    throw new Error(`Invalid trading symbol format: "${rawSymbol}". Must be alphanumeric.`);
  }

  // Must end with a valid quote currency
  const validQuotes = ['USDT', 'USDC', 'FDUSD', 'EUR', 'TRY', 'BTC', 'ETH', 'BNB'];
  const hasValidQuote = validQuotes.some((q) => clean.endsWith(q) && clean.length > q.length);
  if (!hasValidQuote) {
    throw new Error(
      `Unrecognized trading pair format for "${rawSymbol}". Must end in a valid quote asset (e.g. USDT, USDC, BTC).`
    );
  }

  return clean;
}

export function formatAndValidateSymbol(rawSymbol: string): string {
  return normalizeSymbol(rawSymbol);
}

export interface FetchBinanceOptions {
  revalidateSeconds?: number;
  isFutures?: boolean;
}

/**
 * Executes a Binance public REST request with unified error extraction.
 * Communicates directly with Binance production endpoints (api.binance.com and fapi.binance.com).
 */
export async function fetchBinancePublic<T, R>(
  path: string,
  symbol: string,
  transform: (data: T) => R,
  options: FetchBinanceOptions = {}
): Promise<R> {
  const formatted = normalizeSymbol(symbol);
  const baseUrl = options.isFutures ? 'https://fapi.binance.com' : 'https://api.binance.com';
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    next: { revalidate: options.revalidateSeconds ?? 2 },
  });

  if (!res.ok) {
    if (res.status === 400) {
      const errData = (await res.json().catch(() => null)) as { msg?: string; code?: number } | null;
      throw new Error(
        errData?.msg ? `Binance API error: ${errData.msg} (${formatted})` : `Invalid symbol: ${formatted}`
      );
    }
    throw new Error(`Binance API error: ${res.status}`);
  }

  const data = (await res.json()) as T;
  return transform(data);
}
