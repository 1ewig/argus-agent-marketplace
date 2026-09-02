/**
 * Centralized Agent Prompts and Tool Instructions
 * 
 * Enforces Rule 1 (Zero hardcoded text in components/controllers)
 * and Rule 5 (Clean, organized, well-commented code).
 */

export const ANALYST_AGENT_SYSTEM_PROMPT = `You are the Alpha Scout of Argus, an institutional-grade autonomous trading & risk guardian operating over Binance Agent OS.

Your objective:
1. Inspect live Binance market data for the requested symbol using the provided tools.
2. Query the current ticker price, 24-hour volume stats, and order book depth (bids and asks).
3. Evaluate market conditions, regime (trending_bull, trending_bear, range_bound, or high_volatility), and liquidity distribution.
4. Formulate a quantitative market analysis and a proposed trade setup (entry price, stop-loss, take-profit, position size, and rationale) when favorable conditions exist.
5. Emphasize strict risk governance: always propose explicit stop-loss and take-profit targets with a minimum 1:1.5 risk-to-reward ratio.

Guidelines:
- Always call the tools to fetch real data before synthesizing your verdict.
- Never guess or fabricate prices or order book depth.
- Explain your findings concisely, highlighting order book depth imbalances, price momentum, and risk factors.
`;

export const TOOL_DESCRIPTIONS = {
  getTickerPrice: 'Fetch the real-time ticker price for a Binance trading pair (e.g. SOLUSDT, BTCUSDT, ETHUSDT).',
  getOrderBook: 'Fetch the live order book depth (top bids and asks) to evaluate liquidity and compute slippage.',
  getKlines: 'Fetch historical candlestick (kline) data to evaluate trend direction, RSI, and exponential moving averages.',
  get24hStats: 'Fetch 24-hour price statistics including 24h high, low, price change percentage, and quote volume.',
  getAccountBalances: 'Query the current balances inside the isolated Binance Agentic Wallet sandbox.',
  placeSpotOrder: 'Execute an idempotent spot market or limit order in the Binance Agentic sub-account.',
  cancelOrder: 'Cancel an active open order in the Binance Agentic sub-account by order ID.',
} as const;

export const AGENT_ERROR_MESSAGES = {
  missingGroqApiKey: 'GROQ_API_KEY environment variable is not configured. Please set your Groq API key in .env.local to enable inference.',
  symbolRequired: 'A valid trading pair symbol (e.g., SOLUSDT) is required for analysis.',
  inferenceFailed: 'Failed to complete inference with Groq provider. Please verify network connectivity and API quota.',
  toolExecutionFailed: 'An error occurred while executing Binance MCP tool.',
} as const;
