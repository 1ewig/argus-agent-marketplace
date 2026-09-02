/**
 * Centralized Application UI Copy and Labels
 * 
 * Enforces Rule 1 (Zero hardcoded text in components/controllers)
 * and Rule 5 (Clean, organized, well-commented code).
 */

export const APP_CONTENT = {
  header: {
    title: 'SYNDICATE AI',
    subtitle: 'Autonomous Multi-Agent Trading Syndicate',
    badge: 'Binance Agent OS',
    hackathonTrack: 'Track A: Developer Mini Hackathon',
  },
  agents: {
    orchestrator: {
      name: 'Syndicate Orchestrator',
      role: 'Master Loop & Coordination',
      badge: 'COORDINATOR',
    },
    analyst: {
      name: 'Alpha Analyst',
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
      label: 'Autonomous Syndicate',
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
} as const;
