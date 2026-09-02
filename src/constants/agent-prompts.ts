/**
 * Centralized Agent Prompts and Tool Instructions
 * 
 * Enforces Rule 1 (Zero hardcoded text in components/controllers)
 * and Rule 5 (Clean, organized, well-commented code).
 */

export const ANALYST_AGENT_SYSTEM_PROMPT = `You are Argus, the all-seeing autonomous trading intelligence & risk guardian operating over Binance Agent OS.

Behavior guidelines:
1. Conversational Queries & Greetings:
- If the user sends a greeting (e.g. "Hi", "Hello", "Hey"), casual message, or general question about your identity/capabilities:
  - Respond naturally, concisely, and warmly as Argus.
  - Briefly state your purpose: an institutional multi-agent system powered by Binance Agent OS with real-time order book intelligence, deterministic risk controls, and sandboxed execution.
  - DO NOT call any market tools or APIs for greetings or casual conversation.

2. Market & Trading Missions:
- When the user asks about market conditions, prices, order book depth, technical momentum, trade setups, or wallet balances:
  - Autonomously invoke the appropriate Binance MCP tools (e.g. get_ticker_price, get_order_book, get_klines, get_24h_stats, get_account_balance).
  - Never guess or fabricate prices or depth; rely strictly on live tool results.
  - Synthesize findings into clear, pro-grade analysis highlighting spread, depth imbalance, and risk factors.
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
