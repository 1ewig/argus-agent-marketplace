import {
  normalizeSymbol,
  getTickerPrice,
  getOrderBook,
  getKlines,
  getAveragePrice,
  getFundingRate,
  getGlobalLongShortAccountRatio,
  getTopLongShortPositionRatio,
} from '@/lib/binance-mcp';
import { searchExa } from '@/lib/exa';
import { deriveQuantitativeAnchors } from '@/agent/intelligence/synthesizer';
import { MarketIntelligencePayloadSchema } from '@/agent/intelligence/schemas';
import { generateObject } from 'ai';

async function timeFn<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ name: string; durationMs: number; success: boolean; error?: string; result?: T }> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = Math.round(performance.now() - start);
    return { name, durationMs, success: true, result };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - start);
    return { name, durationMs, success: false, error: err?.message || String(err) };
  }
}

async function runBenchmark(symbol: string = 'BTCUSDT') {
  console.log(`\n================================================================`);
  console.log(`  ⏱️  BENCHMARKING MARKET INTELLIGENCE: ${symbol}`);
  console.log(`================================================================\n`);

  const cleanSymbol = normalizeSymbol(symbol);
  const baseAsset = cleanSymbol.replace(/(USDT|USDC|FDUSD|BTC|ETH|BNB|EUR|TRY)$/, '') || cleanSymbol;

  // -------------------------------------------------------------
  // PHASE 1: Parallel Data Fetching
  // -------------------------------------------------------------
  console.log(`📡 [PHASE 1] Parallel Data Ingestion (9 endpoints)...`);

  const p1Start = performance.now();

  const [
    tickerRes,
    orderBookRes,
    klines15mRes,
    klines1hRes,
    avgPriceRes,
    fundingRes,
    globalLsRes,
    topLsRes,
    newsRes,
  ] = await Promise.all([
    timeFn('1. Binance Spot Ticker', () => getTickerPrice(cleanSymbol)),
    timeFn('2. Binance Order Book (20-depth)', () => getOrderBook(cleanSymbol, 20)),
    timeFn('3. Binance Klines 15m (30 periods)', () => getKlines(cleanSymbol, '15m', 30)),
    timeFn('4. Binance Klines 1h (24 periods)', () => getKlines(cleanSymbol, '1h', 24)),
    timeFn('5. Binance 5m VWAP (avgPrice)', () => getAveragePrice(cleanSymbol)),
    timeFn('6. Binance Futures Funding Rate', () => getFundingRate(cleanSymbol)),
    timeFn('7. Binance Global Long/Short Ratio', () => getGlobalLongShortAccountRatio(cleanSymbol, '5m', 5)),
    timeFn('8. Binance Top Whale Long/Short Ratio', () => getTopLongShortPositionRatio(cleanSymbol, '5m', 5)),
    timeFn('9. Exa AI Neural News Search', () =>
      searchExa({
        query: `${baseAsset} crypto token catalyst news`,
        category: 'news',
        numResults: 3,
        includeText: true,
        maxTextCharacters: 400,
      })
    ),
  ]);

  const p1Total = Math.round(performance.now() - p1Start);

  const phase1Table = [
    tickerRes,
    orderBookRes,
    klines15mRes,
    klines1hRes,
    avgPriceRes,
    fundingRes,
    globalLsRes,
    topLsRes,
    newsRes,
  ].map((r) => ({
    Source: r.name,
    'Latency (ms)': `${r.durationMs} ms`,
    Status: r.success ? '✅ OK' : `❌ Failed (${r.error?.slice(0, 35)}...)`,
  }));

  console.table(phase1Table);
  console.log(`➡️  Phase 1 Total Wall-Clock Latency: ${p1Total} ms (Parallel max)\n`);

  // -------------------------------------------------------------
  // PHASE 2: Quantitative Mathematical Anchors
  // -------------------------------------------------------------
  console.log(`📐 [PHASE 2] Quantitative Mathematical Anchoring...`);
  const p2Start = performance.now();
  const ticker = tickerRes.result?.price ?? 0;
  const anchors = deriveQuantitativeAnchors(
    ticker,
    orderBookRes.result ?? null,
    klines15mRes.result ?? [],
    klines1hRes.result ?? []
  );
  const p2Total = (performance.now() - p2Start).toFixed(3);
  console.log(`✅ Phase 2 (deriveQuantitativeAnchors) execution time: ${p2Total} ms`);
  console.log(`   Derived: Imbalance=${anchors.rawImbalance}x, Bid=$${anchors.bestBid}, Ask=$${anchors.bestAsk}, 15m Range=[$${anchors.min15mLow} - $${anchors.max15mHigh}]\n`);

  // -------------------------------------------------------------
  // PHASE 3A: Fireworks Default Model (glm-5p3-flash)
  // -------------------------------------------------------------
  console.log(`🤖 [PHASE 3A] Structured LLM Synthesis (Fireworks Default: glm-5p3-flash)...`);
  const { createFireworks } = await import('@ai-sdk/fireworks');
  const fireworksApiKey = process.env.FIREWORKS_API_KEY;

  if (!fireworksApiKey) {
    console.log(`❌ FIREWORKS_API_KEY is missing from environment.`);
  } else {
    const fireworks = createFireworks({ apiKey: fireworksApiKey });
    const systemPrompt = `You are the Argus Market Intelligence Engine. Analyze real-time live Binance exchange metrics for #${cleanSymbol} and synthesize a 4-card payload. Never hallucinate prices. Keep summaries punchy (1 sentence each).`;
    const userPrompt = `Telemetry for #${cleanSymbol}: Price $${ticker}, Best Bid $${anchors.bestBid}, Best Ask $${anchors.bestAsk}, Imbalance: ${anchors.rawImbalance}x. Synthesize 4-card payload now.`;

    // 1. Test Fireworks Default (glm-5p3-flash)
    const p3aStart = performance.now();
    try {
      const modelDefault = fireworks('accounts/fireworks/models/glm-5p3-flash');
      const resultDefault = await generateObject({
        model: modelDefault,
        schema: MarketIntelligencePayloadSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      const p3aTotal = Math.round(performance.now() - p3aStart);
      console.log(`✅ Phase 3A (Fireworks: glm-5p3-flash) execution time: ${p3aTotal} ms`);
      console.log(`   Result summary: Bias=${resultDefault.object.levels.bias}, Strategy=${resultDefault.object.playbook.bias}, Target=$${resultDefault.object.playbook.target}\n`);
    } catch (err: any) {
      const p3aTotal = Math.round(performance.now() - p3aStart);
      console.log(`⚠️ Phase 3A Failed in ${p3aTotal} ms: ${err?.message || err}\n`);
    }

    // 2. Test Fireworks Backup (deepseek-v4-flash-0731)
    console.log(`🤖 [PHASE 3B] Structured LLM Synthesis (Fireworks Backup: deepseek-v4-flash-0731)...`);
    const p3bStart = performance.now();
    try {
      const modelBackup = fireworks('accounts/fireworks/models/deepseek-v4-flash-0731');
      const resultBackup = await generateObject({
        model: modelBackup,
        schema: MarketIntelligencePayloadSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      const p3bTotal = Math.round(performance.now() - p3bStart);
      console.log(`✅ Phase 3B (Fireworks: deepseek-v4-flash-0731) execution time: ${p3bTotal} ms`);
      console.log(`   Result summary: Bias=${resultBackup.object.levels.bias}, Strategy=${resultBackup.object.playbook.bias}, Target=$${resultBackup.object.playbook.target}\n`);
    } catch (err: any) {
      const p3bTotal = Math.round(performance.now() - p3bStart);
      console.log(`⚠️ Phase 3B Failed in ${p3bTotal} ms: ${err?.message || err}\n`);
    }
  }

  const grandTotal = Math.round(performance.now() - p1Start);
  console.log(`\n================================================================`);
  console.log(`  🏁 TOTAL END-TO-END SCAN TIME: ${grandTotal} ms`);
  console.log(`================================================================\n`);
}

const targetSymbol = process.argv[2] || 'BTCUSDT';
runBenchmark(targetSymbol).catch(console.error);
