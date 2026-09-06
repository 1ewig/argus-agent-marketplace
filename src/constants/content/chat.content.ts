/**
 * Chat conversation, hero input, prompt templates, and session copy.
 */

export interface QuickActionItem {
  id: string;
  label: string;
  template: string;
}

export const chatContent = {
  chat: {
    title: 'Chat',
    subtitle: 'Ask questions, check prices, and inspect order books in real time',
    inputPlaceholder: 'Ask Argus...',
    sendButton: 'Send',
    stopButton: 'Stop generating',
    clearButton: 'Clear',
    emptyCategory: 'Binance Market Assistant',
    emptyTitle: 'How can I help you today?',
    emptySubtitle: 'Analyze live order books, check funding rates, and inspect 24h market stats with real-time Binance feeds.',
    quickActionsTitle: 'Quick Actions',
    quickActions: [
      { id: 'depth', label: 'BTC/USDT Depth', template: 'Check BTCUSDT live price, spread, and order book depth' },
      { id: 'stats', label: 'BTC 24h Stats', template: 'Show 24h market stats and volume for BTCUSDT' },
      { id: 'oi', label: 'BTC Funding & OI', template: 'Check BTCUSDT live open interest and funding rate' },
      { id: 'news', label: 'BTC News & Catalysts', template: 'Search latest crypto news, catalysts, and sentiment for BTC' },
    ] as QuickActionItem[],
    globalQuickActions: [
      { id: 'movers', label: 'Top Market Movers', template: 'What are the biggest crypto gainers, losers, and top volume movers today across Binance?' },
      { id: 'news', label: 'Breaking Crypto News', template: 'Surface the most important breaking crypto headlines, regulatory updates, and catalysts right now.' },
      { id: 'risk', label: 'Liquidation & Risk Watch', template: 'Check for unusual open interest spikes, crowded positioning, or funding rate extremes across major perpetuals.' },
      { id: 'pulse', label: 'Market Pulse', template: 'Give me a fast market pulse across BTC, ETH, SOL, and BNB with 24h price change, volume, and funding rates.' },
    ] as QuickActionItem[],
    getSymbolQuickActions: (symbol: string, baseAsset: string, _quoteAsset?: string): QuickActionItem[] => [
      {
        id: 'news',
        label: `${baseAsset} News & Catalysts`,
        template: `Search latest relevant crypto news, protocol upgrades, and catalysts for ${baseAsset}`,
      },
      {
        id: 'timeframe',
        label: `${baseAsset} Multi-Timeframe Bias`,
        template: `Analyze ${symbol} market structure and trend bias across 15m, 1h, and 4h intervals`,
      },
      {
        id: 'momentum',
        label: `${baseAsset} 24h Momentum`,
        template: `Show ${symbol} full 24h picture: high/low range, volume, 24h change %, and VWAP benchmark`,
      },
    ],
    quickPromptsTitle: 'Quick Actions',
    quickPrompts: [
      'Check BTCUSDT live price, spread, and order book depth',
      'Show 24h market stats and volume for BTCUSDT',
      'Check BTCUSDT live open interest and funding rate',
      'Search latest crypto news, catalysts, and sentiment for BTC',
    ],
    toolCallsLabel: 'Tools used',
    toolCallsCountSuffix: 'tools used',
    viewDetails: 'Show details',
    hideDetails: 'Hide details',
    thinkingText: 'Checking live Binance market data...',
    userRole: 'You',
    agentRole: 'Argus',
    stepCountLabel: 'steps',
    errorNotice: 'Something went wrong while processing your request. Please check your Groq API key and connection.',
    newSessionButton: 'New Chat',
    newSessionDisabled: 'Current chat is already new',
    newChatButton: 'New Chat',
    newChatTooltip: 'Start a new conversation in this workspace',
    sessionsLabel: 'Chats',
    defaultSessionTitle: 'New Chat',
    defaultSessionTitles: ['Active Session', 'Market Research', 'New Chat', 'Chat', 'Active Chat'] as const,
    errorMessageTitle: 'Error',
    newSessionGreeting: (title: string) =>
      `Started a new chat for **${title}**. How can I help you today?`,
    workspaceBadge: 'WORKSPACE',
    globalWorkspaceTitle: 'Global Market',
    globalWorkspaceBadge: 'GLOBAL',
    globalWorkspaceSubtitle: 'Macro market research, cross-token analysis, and news uncoupled from any single symbol.',
    switchSymbolTooltip: 'Click to switch market workspace (⌘K)',
    followUpsTitle: 'Suggested Follow-ups',
    followUpAriaLabel: (question: string) => `Ask follow-up: ${question}`,
    fallbackFollowUps: (symbol: string) => [
      `Check ${symbol} order book depth and bid/ask liquidity walls`,
      `Inspect ${symbol} perpetual funding rate and long/short ratio`,
      `Search latest crypto news and catalysts affecting ${symbol}`,
    ],
    globalFallbackFollowUps: [
      'What are the top crypto gainers and biggest volume movers today across Binance?',
      'Compare perpetual futures funding rates across BTC, ETH, and SOL',
      'Search latest crypto regulatory news and macroeconomic market sentiment',
    ],
  },
  sessions: {
    menuTitle: 'Conversations',
    renameLabel: 'Rename',
    deleteLabel: 'Delete',
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    renamePlaceholder: 'Chat title...',
    emptyState: 'No conversations yet',
    activeBadge: 'ACTIVE',
    openMenuAria: 'Manage conversations',
    deleteDialogTitle: 'Delete Conversation',
    deleteDialogDescription: (title?: string) =>
      title
        ? `Are you sure you want to delete "${title}"? All messages and market research from this chat will be permanently removed.`
        : 'Are you sure you want to delete this conversation? All messages and market research will be permanently removed.',
    deleteDialogConfirm: 'Delete Chat',
    deleteDialogCancel: 'Cancel',
  },
  dialog: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    closeAria: 'Close dialog',
  },
} as const;
