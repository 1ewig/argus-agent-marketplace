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
    title: 'Agent Intelligence & Trading Desk',
    subtitle: 'Discover ERC-8004 agents, inspect on-chain telemetry, and query live Binance market feeds',
    inputPlaceholder: 'Search 310k+ agents, inspect telemetry, or ask about markets...',
    sendButton: 'Send',
    stopButton: 'Stop generating',
    clearButton: 'Clear',
    emptyCategory: 'Autonomous Agent Marketplace & Trading Desk',
    emptyTitle: 'Discover & Analyze BNB Chain AI Agents',
    emptySubtitle: 'Search 310,000+ ERC-8004 autonomous agents, inspect on-chain telemetry, and query live Binance market feeds in real time.',
    quickActionsTitle: 'Quick Discovery & Diagnostics',
    quickActions: [
      { id: 'yield', label: 'Top Yield Agents', template: 'Find top-ranked Yield & Staking agents on BNB Chain' },
      { id: 'venus', label: 'Venus Sentinels', template: 'Discover Health Factor & Liquidation monitoring agents for Venus Protocol' },
      { id: 'grid', label: 'Grid & LP Bots', template: 'Show top Grid Trading and PancakeSwap LP Rebalancing agents on BNB Chain' },
      { id: 'bnb', label: 'BNB/USDT Depth', template: 'Check BNBUSDT live price, order book depth, and 24h stats on Binance' },
    ] as QuickActionItem[],
    quickPromptsTitle: 'Quick Discovery & Diagnostics',
    quickPrompts: [
      'Find top-ranked Yield & Staking agents on BNB Chain',
      'Discover Health Factor & Liquidation monitoring agents for Venus Protocol',
      'Show top Grid Trading and PancakeSwap LP Rebalancing agents on BNB Chain',
      'Check BNBUSDT live price, order book depth, and 24h stats on Binance',
    ],
    toolCallsLabel: 'Tools used',
    toolCallsCountSuffix: 'tools used',
    viewDetails: 'Show details',
    hideDetails: 'Hide details',
    thinkingText: 'Searching ERC-8004 registry & live Binance market data...',
    userRole: 'You',
    agentRole: 'Argus',
    stepCountLabel: 'steps',
    errorNotice: 'Something went wrong while processing your request. Please check your AI provider configuration and connection.',
    newSessionButton: 'New Chat',
    newSessionDisabled: 'Current chat is already new',
    newChatButton: 'New Chat',
    newChatTooltip: 'Start a new conversation',
    sessionsLabel: 'Chats',
    defaultSessionTitle: 'New Chat',
    defaultSessionTitles: ['Active Session', 'Agent Discovery', 'New Chat', 'Chat', 'Active Chat'] as const,
    errorMessageTitle: 'Error',
    newSessionGreeting: (title: string) =>
      `Started a new chat for **${title}**. How can I help you explore agents or market intelligence today?`,
    followUpsTitle: 'Suggested Follow-ups',
    followUpAriaLabel: (question: string) => `Ask follow-up: ${question}`,
    fallbackFollowUps: [
      'Compare total scores and health factor ratings between top Yield and Grid trading agents',
      'Which ERC-8004 agents on BNB Chain support x402 micropayments and MCP protocols?',
      'Show me the newest registered agents in the Portfolio Rebalancing track',
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
