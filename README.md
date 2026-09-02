# Argus (Binance Agent OS — Track A)

> **The All-Seeing Autonomous Multi-Agent Trading & Risk Guardian**  
> Built for the **Binance Agent OS Mini Hackathon — Track A ($20,000 USDC)**

---

## Overview

**Argus** is an institutional-grade multi-agent autonomous system operating directly over **Binance Agent OS**. Unlike standard chatbots or single-loop agents that trade blindly, Argus enforces strict separation of concerns across specialized agents:

1. **Alpha Scout (`AnalystAgent`):** Powered by Groq inference, scouts live Binance order book depth, liquidity spreads, and 24h stats to formulate data-grounded trade setups.
2. **The Iron Gate (`RiskArbiterAgent`):** Adversarial compliance gate evaluating deterministic mathematical risk (slippage against actual order book levels, position size caps, daily drawdown limits, and mandatory stop-losses).
3. **Execution Officer (`ExecutorAgent`):** Operates within the isolated Binance Agentic Wallet sandbox, executing orders only when accompanied by a cryptographically signed `RiskCertificate`.
4. **x402 Micropayments:** Native machine-to-machine HTTP 402 challenge-response settlement for inter-agent services.

---

## Dual-Adapter Architecture

Argus implements a unified `IBinanceAgentAdapter` interface:
* **Live MCP Mode:** Connects via `@ai-sdk/mcp` directly to `https://agent.binance.com/mcp/agentic`.
* **Simulation Sandbox Mode:** Fetches real, live Binance market feeds while executing against an in-memory isolated sandbox wallet — allowing hackathon judges to evaluate the full multi-agent flow instantly with zero funding.

---

## Quick Start (Bun Only)

```powershell
# 1. Install dependencies
bun install

# 2. Configure environment variables
Copy-Item .env.example .env.local

# 3. Run development server
bun run dev

# 4. Type check and lint
bun x tsc --noEmit
bun run lint
```
