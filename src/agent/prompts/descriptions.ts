export const AGENT_TOOL_DESCRIPTIONS = {
  getTickerPrice: 'Fetch the real-time ticker price for a Binance trading pair (e.g. SOLUSDT, BTCUSDT, ETHUSDT). MUST be called before stating or reporting the price of any symbol.',
  getOrderBook: 'Fetch the live order book depth (top bids and asks) to evaluate liquidity and compute slippage. MUST be called before reporting order book state or depth.',
  getKlines: 'Fetch historical candlestick (kline) data to evaluate trend direction, RSI, and exponential moving averages. MUST be called before reporting technical trend data.',
  get24hStats: 'Fetch 24-hour price statistics including 24h high, low, price change percentage, and quote volume. MUST be called before reporting 24h performance or metrics.',
  getFundingRate: 'Fetch the real-time perpetual futures funding rate, mark price, and next settlement time for a trading pair. Essential for derivative sentiment, funding cost, and long/short positioning.',
  getAveragePrice: 'Fetch the 5-minute rolling average price (VWAP) for a trading pair to evaluate execution price quality and fair market value.',
  getRecentTrades: 'Fetch recent market trade executions (trade tape) to assess real-time buying vs selling pressure and trade momentum.',
  getOpenInterest: 'Fetch real-time perpetual futures open interest to evaluate market positioning, leverage buildup, and liquidation risk.',
  getGlobalLongShortRatio: 'Fetch global long vs. short account ratio for a Binance Futures pair. Evaluates broad retail crowd sentiment and net account distribution.',
  getTopLongShortRatio: 'Fetch top 20% whale trader long vs. short position ratio for a Binance Futures pair. Essential for smart money tracking and whale vs retail divergence.',
  searchCryptoNews: 'Search live cryptocurrency news, catalysts, regulatory events, narrative shifts, and market sentiment via Exa AI. Supports optional category focus ("news", "company", "financial report", "research paper"), ISO 8601 date range filters (startPublishedDate/endPublishedDate), and domain restrictions. Call whenever the user asks for news, catalysts, reasons for price movements, or protocol roadmaps.',
} as const;
