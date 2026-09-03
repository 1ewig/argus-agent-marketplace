/**
 * Centralized Application UI Copy and Labels
 * 
 * Enforces Rule 1 (Zero hardcoded text in components/controllers)
 * and Rule 5 (Clean, organized, well-commented code).
 */

export const APP_CONTENT = {
  header: {
    brand: 'ARGUS // BINANCE AGENT OS',
    title: 'Argus Agent',
    subtitle: 'Autonomous Binance Agent OS Trading Agent',
    badge: 'Binance Agent OS',
    hackathonTrack: 'Track A',
    mcpActive: 'MCP SERVER: ACTIVE',
    inferenceActive: 'GROQ INFERENCE: ONLINE',
  },
  modes: {
    simulation: {
      label: 'Sandbox Simulation',
      description: 'Live Binance order book data with isolated simulated balance execution.',
    },
    liveMcp: {
      label: 'Live Binance MCP',
      description: 'Direct connection to agent.binance.com/mcp/agentic via MCP protocol.',
    },
  },
  chat: {
    title: 'Agent Intelligence Stream',
    subtitle: 'Autonomous reasoning, MCP tool dispatch & response telemetry',
    inputPlaceholder: 'Ask Argus about live market data, order book depth, or trend setups...',
    sendButton: 'Send',
    clearButton: 'Clear',
    emptyTitle: 'Argus Standby',
    emptySubtitle: 'Send a prompt or select a quick mission below to activate the agent via Binance MCP.',
    quickPromptsTitle: 'Quick Missions:',
    quickPrompts: [
      'Check SOLUSDT live price, spread, and order book depth',
      'Scan 24h market statistics and volume for BTCUSDT',
      'Inspect Agentic Wallet sandbox balances',
      'Analyze 15m candlestick momentum and trend for ETHUSDT',
    ],
    toolCallsLabel: 'Binance Agent OS MCP Calls',
    toolCallsCountSuffix: 'tools executed',
    viewDetails: 'Expand Payload',
    hideDetails: 'Collapse',
    thinkingText: 'Argus is reasoning and querying Binance Agent OS...',
    userRole: 'TRADER',
    agentRole: 'ARGUS AGENT',
    stepCountLabel: 'Steps',
    errorNotice: 'Agent encountered an error. Please check your Groq API key and network connectivity.',
    newSessionButton: 'New Session',
    sessionsLabel: 'Sessions',
    defaultSessionTitle: 'Intelligence Session',
    errorMessageTitle: 'Execution Error',
  },
} as const;
