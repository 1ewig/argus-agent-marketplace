/**
 * Validates and sanitizes a raw Binance trading symbol.
 */
export function formatAndValidateSymbol(rawSymbol: string): string {
  const trimmed = rawSymbol?.trim().toUpperCase();
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Trading symbol cannot be empty');
  }
  return trimmed;
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
  const formatted = formatAndValidateSymbol(symbol);
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
