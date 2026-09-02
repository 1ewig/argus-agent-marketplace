/**
 * Centralized Application UI Copy and Labels
 * 
 * Enforces Rule 1 (Zero hardcoded text in components/controllers)
 * and Rule 5 (Clean, organized, well-commented code).
 */

export const APP_CONTENT = {
  header: {
    title: 'ARGUS',
    subtitle: 'Autonomous Multi-Agent Trading & Risk Guardian',
    badge: 'Binance Agent OS',
    hackathonTrack: 'Track A: Developer Mini Hackathon',
  },
  agents: {
    orchestrator: {
      name: 'Argus Orchestrator',
      role: 'Master Loop & Coordination',
      badge: 'COORDINATOR',
    },
    analyst: {
      name: 'Alpha Scout',
      role: 'Dual-Vector Market Intelligence',
      badge: 'SCOUT',
    },
    riskArbiter: {
      name: 'Risk Arbiter',
      role: 'The Iron Gate & Pre-Flight Math',
      badge: 'GATEKEEPER',
    },
    executor: {
      name: 'Binance Executor',
      role: 'Idempotent Execution Officer',
      badge: 'EXECUTOR',
    },
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
    copilot: {
      label: 'Copilot Mode',
      description: 'Human-in-the-loop review and approval required before order placement.',
    },
    autonomous: {
      label: 'Autonomous Guardian Mode',
      description: 'Continuous agent-to-agent negotiation, x402 settlement, and execution.',
    },
  },
  buttons: {
    scanAlpha: 'Scan Alpha & Depth',
    riskAudit: 'Run Pre-Flight Risk Audit',
    executeSetup: 'Execute Approved Trade',
    emergencyStop: 'Emergency Kill-Switch',
    sendPrompt: 'Dispatch Mission',
  },
  status: {
    working: 'Analyzing...',
    approved: 'Risk Approved',
    rejected: 'Policy Rejected',
    executed: 'Order Filled',
    idle: 'Standby',
  },
  chat: {
    title: 'Agent Intelligence Stream',
    subtitle: 'Autonomous reasoning, MCP tool dispatch & response telemetry',
    inputPlaceholder: 'Type a message or trading mission for Argus (e.g. "What is SOL depth?")...',
    sendButton: 'Send',
    clearButton: 'Clear',
    emptyTitle: 'Argus Stream Standby',
    emptySubtitle: 'Send a message or select a quick mission below to activate the agent.',
    quickPromptsTitle: 'Quick Missions:',
    quickPrompts: [
      'Check SOLUSDT live depth and bid/ask spread',
      'Scan 24h market stats for BTCUSDT',
      'Inspect Agentic Wallet sandbox balances',
      'Evaluate SOLUSDT recent 15m trend momentum',
    ],
    toolCallsLabel: 'Binance Agent OS MCP Calls',
    toolCallsCountSuffix: 'tools executed',
    viewDetails: 'Expand Payload',
    hideDetails: 'Collapse',
    thinkingText: 'Argus is reasoning and querying Binance Agent OS...',
    userRole: 'TRADER',
    agentRole: 'ARGUS SCOUT',
    stepCountLabel: 'Steps',
    errorNotice: 'Agent encountered an error. Please check your Groq API key and network.',
  },
  cockpit: {
    title: 'Mission Cockpit',
    subtitle: 'Real-time pair telemetry & pre-flight risk governance',
    activePairLabel: 'TARGET ASSET',
    statusLabel: 'SYSTEM STATUS',
    systemOnline: 'ALL SYSTEMS OPERATIONAL',
    mcpConnected: 'BINANCE MCP: READY',
    groqInference: 'GROQ INFERENCE: ONLINE',
    symbols: ['SOLUSDT', 'BTCUSDT', 'ETHUSDT'],
    stats: {
      latency: 'LATENCY',
      latencyValue: '< 350ms',
      settlement: 'x402 SETTLEMENT',
      settlementValue: '0.02 USDC',
      governance: 'RISK GATE',
      governanceValue: 'DETERMINISTIC',
    },
    overviewTitle: 'Multi-Agent Operational Matrix',
    overviewDescription:
      'Argus coordinates autonomous agents to eliminate reckless execution. The Alpha Scout analyzes market structure, the Risk Arbiter enforces mathematical slippage bounds, and the Executor operates within the sandboxed Agentic Wallet.',
  },
} as const;
