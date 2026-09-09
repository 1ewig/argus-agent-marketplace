/**
 * Navigation, sidebar, session modals, and branding copy.
 */

export const sidebarContent = {
  sidebar: {
    brand: 'Argus',
    subtitle: 'BNB Chain',
    badge: 'Build the Era',
    newChat: 'New Chat',
    newChatDisabled: 'Current chat is already new',
    viewsTitle: 'Workspace Views',
    agentView: 'Agent Chat',
    marketplaceView: 'Agent Marketplace',
    historyTitle: 'Conversations',
    emptyHistory: 'No conversations yet',
    chatsCount: (count: number) => `${count} ${count === 1 ? 'chat' : 'chats'}`,
    statusOnline: 'Live Binance Feeds',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeLightBadge: 'LIGHT',
    themeDarkBadge: 'DARK',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    openMobileSidebar: 'Open navigation sidebar',
    closeMobileSidebar: 'Close navigation sidebar',
    deleteChat: 'Delete Chat',
    renameChat: 'Rename Chat',
    deleteDialogTitle: 'Delete Conversation',
    deleteDialogDescription: (title?: string) =>
      title
        ? `Are you sure you want to delete "${title}"? All messages and market research from this chat will be permanently removed.`
        : 'Are you sure you want to delete this conversation? All messages and market research will be permanently removed.',
    deleteDialogConfirm: 'Delete Chat',
    deleteDialogCancel: 'Cancel',
  },
  header: {
    brand: 'ARGUS // BNB CHAIN',
    title: 'Argus',
    subtitle: 'Autonomous AI Agent Marketplace & Trading Desk for BNB Chain',
    badge: 'Build the Era',
    hackathonTrack: 'Build the Era',
    publicFeedsActive: 'Live Binance Feeds',
    inferenceActive: 'AI Online',
  },
  nav: {
    brandMonogram: 'A.',
    brandTooltip: 'Argus Trading Assistant',
    searchPlaceholder: 'Search markets, pairs, or agent tools...',
    searchTooltip: 'Search markets',
    notificationsTitle: 'Market Alerts',
    notificationsCount: '3',
    statusOnline: 'Live Feeds Active',
    themeToggleDark: 'Switch to light theme',
    themeToggleLight: 'Switch to dark theme',
    items: {
      dashboard: 'Dashboard',
      wallet: 'Wallet',
      alerts: 'Signals',
      reports: 'Analysis',
      analytics: 'Analytics',
    },
  },
  stage: {
    category: 'Market Overview',
    defaultSymbol: 'BTC / USDT',
    defaultSubtitle: 'Binance Spot • Real-time Feeds & Agent Reasoner',
  },
  cards: {
    account: {
      title: 'Account & Portfolio',
      badge: 'Coming Soon',
      emptyTitle: 'Wallet & Balances',
      emptySubtitle: 'Live Binance wallet balances and paper trading asset metrics will be displayed here.',
    },
    activeTrades: {
      title: 'Active Trades',
      badge: 'Coming Soon',
      emptyTitle: 'Order Book & Executions',
      emptySubtitle: 'Live order book depth, taker flow, and active position metrics will be displayed here.',
    },
    marketAnalysis: {
      title: 'Daily Market Analysis',
      badge: 'Coming Soon',
      emptyTitle: 'Market Sentiment & Analysis',
      emptySubtitle: 'Daily market overview, sentiment metrics, and Exa web search synthesis will be displayed here.',
    },
  },
  modes: {
    simulation: {
      label: 'Live Public Feeds',
      description: 'Stream and analyze real-time Binance spot and derivative market data with zero API keys.',
    },
  },
} as const;
