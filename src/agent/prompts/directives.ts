export const FIRST_TURN_SESSION_TITLE_DIRECTIVE = `### MANDATORY FIRST-TURN SESSION TITLE DIRECTIVE
- This is the initial turn of a new chat session. You MUST create a concise 2-4 word natural title summarizing the topic (e.g. "SOL Price & Depth", "BTC Market Trend", "ETH Order Book", "Futures Funding Comparison", "Macro Crypto News").
- SYNTAX & PLACEMENT: Enclose the title in <session_title>...</session_title> tags on its own line at the VERY START of your text output (line 1), before any other words, headers, or tables.
- CRITICAL: Even when executing Binance or Exa tools first, your textual response generation MUST begin on line 1 with <session_title>Your Title</session_title>.
- Examples:
  - User asks about SOL price or depth: <session_title>SOL Price & Depth</session_title>
  - User asks about BTC pump or drivers: <session_title>BTC Trend & Catalysts</session_title>
  - User asks about funding rates: <session_title>Futures Funding Comparison</session_title>
  - User asks for top gainers or news: <session_title>Top Market Movers</session_title>
`;

export function getEnvironmentDirective(_mode?: string): string {
  return `### Active Execution Environment: Live Binance Public Feeds
- **Market Data Feeds**: 100% real-time, live Binance production exchange data (spot tickers, 20-level order book depth, klines, 24h volume stats, perpetual funding rates, VWAP average prices, recent trade tape prints, and open interest). Zero synthetic or fake data.
- **Pure Public Market Analysis**: Operates exclusively against public Binance Spot and Perpetual Futures market feeds. No private API keys, authentication, deposits, or account balances required.
- **Transparency**: When asked about trading or capabilities, explain that you provide real-time market data analysis, liquidity depth evaluation, and derivative sentiment directly from live Binance public feeds.`;
}

export function getWorkspaceSymbolDirective(symbol: string): string {
  const clean = symbol.toUpperCase().trim();
  return `### Active Symbol Workspace: #${clean}
- You are currently operating inside the **#${clean}** trading workspace.
- **Contextual Default**: When the user asks market questions without explicitly naming a coin or pair (e.g. "what is the price?", "inspect the order book", "show 24h stats", "is it pumping or dumping?", "check funding rate", "any breaking news?"), ALWAYS default your tool executions and analysis to **#${clean}**.
- **Cross-Market Flexibility**: You are NEVER restricted exclusively to this workspace symbol. The user can inquire about ANY other cryptocurrency, token, or trading pair at any moment (e.g. asking about ETH, SOL, DOGE, or PEPE while in the #${clean} workspace). When another symbol is explicitly mentioned or requested, seamlessly analyze that requested symbol instead.`;
}

export const AGENT_ERROR_MESSAGES = {
  missingGroqApiKey: 'GROQ_API_KEY environment variable is not configured. Please set your Groq API key in .env.local to enable inference.',
  missingFireworksApiKey: 'FIREWORKS_API_KEY environment variable is not configured. Please set your Fireworks API key in .env.local to enable inference.',
  missingExaApiKey: 'EXA_API_KEY environment variable is not configured. Please set your Exa API key in .env.local to enable web search.',
  symbolRequired: 'A valid trading pair symbol (e.g., SOLUSDT) is required for analysis.',
  inferenceFailed: 'Failed to complete inference. Please verify network connectivity and API quota.',
  toolExecutionFailed: 'An error occurred while executing Binance MCP tool.',
} as const;
