# Argus — Autonomous AI Agent Marketplace & Trading Desk for BNB Chain

<p align="left">
  <a href="https://argus-ai-agent-hackathon.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/⚡%20Live%20Terminal-Launch%20Argus-F0B90B?style=for-the-badge&logo=vercel&logoColor=000000" alt="Live Demo" />
  </a>
  <a href="https://github.com/1ewig/argus-agent-marketplace" target="_blank">
    <img src="https://img.shields.io/badge/BNB%20Chain-Build%20the%20Era%20Hackathon-181A20?style=for-the-badge&logo=binance&logoColor=F0B90B" alt="BNB Hackathon" />
  </a>
  <img src="https://img.shields.io/badge/Standard-ERC--8004%20Registry-F3BA2F?style=for-the-badge&logo=ethereum&logoColor=000000" alt="ERC-8004" />
  <img src="https://img.shields.io/badge/Runtime-Bun%201.4%2B-FBF0DF?style=for-the-badge&logo=bun&logoColor=000000" alt="Bun" />
  <img src="https://img.shields.io/badge/TypeScript-Strict%207-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-16.3%20App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
</p>

> **Built for the BNB Chain "Build the Era" Hackathon**  
> The definitive on-chain marketplace and intelligent trading companion for discovering, inspecting, benchmarking, and interacting with **310,000+ autonomous AI agents** registered under the **ERC-8004 specification** on BNB Smart Chain (BSC - Chain ID 56).
>
> 🌐 **Live Web Terminal & Marketplace:** [https://argus-ai-agent-hackathon.vercel.app](https://argus-ai-agent-hackathon.vercel.app)  
> 📦 **GitHub Repository:** [https://github.com/1ewig/argus-agent-marketplace](https://github.com/1ewig/argus-agent-marketplace)

---

## The Problem: The On-Chain Agent Discoverability Gap

Over **310,000 autonomous AI agents** are registered on BNB Smart Chain under the ERC-8004 standard. However, the ecosystem faces a critical discoverability gap:

* **No Legible Agent Telemetry:** Existing raw block explorers only display contract addresses and bytecodes, leaving traders blind to an agent's actual capabilities, health score, total score, and user reputation.
* **Fragmented Capability Standards:** Agents supporting cutting-edge rails like **x402 pay-per-request micropayments**, **Model Context Protocol (MCP)**, and **Agent-to-Agent (A2A)** collaboration are buried in raw bytecode without structured discovery.
* **Disjointed Execution Workflows:** Traders are forced to jump between discovery explorers, charting websites, Telegram bots, and exchange interfaces to evaluate and utilize agent intelligence.

### The Solution: Argus

**Argus bridges this gap by unifying discovery, on-chain diagnostics, live market feeds, and conversational AI into a singular, high-performance terminal.**

Traders can explore the entire ERC-8004 registry by core reference pillars (Yield & Staking, Grid Trading, Health Factor Monitoring, Portfolio Rebalancing, Trading & Execution, Risk & Safety), sort composably across leaderboard rank or newest on-chain cohorts, inspect on-chain telemetry, and hand off any agent directly into the Argus Trading Desk with one click.

---

## Key Platform Surfaces

### 1. ERC-8004 Agent Marketplace (`/marketplace` & `/agents`)

The primary discovery engine built specifically for BNB Chain's autonomous agent ecosystem:

![Argus Agent Marketplace](public/images/argus-agent-marketplace.webp)

* **4 Mandatory Hackathon Pillars:** Top-level core pillars surfaced with primary distinction:
  * 🌾 **Yield & Staking:** Multi-protocol APR routing, liquid staking (slisBNB), and yield aggregators.
  * 📊 **Grid Trading:** Automated order book bands, market making, and volatility harvesters.
  * 🛡️ **Health Factor Monitoring:** Lending position surveillance & Venus liquidation sentinels.
  * ⚖️ **Portfolio Rebalancing:** Concentrated liquidity auto-resetting and automated LP range managers.
* **Specialized Sub-Domain Explorer:** Granular categorization into Liquid Staking (Lista DAO), Portfolio Rebalancers, DePIN / Greenfield storage, DAO Governance, Four.meme fair-launch bots, and Cross-Chain bridges.
* **Composable Sorting System:** Independent sort selection that composes cleanly across categories:
  * 🏆 **Leaderboard:** Highest total score and proven reputation.
  * 🔥 **Trending:** Active community feedback and engagement.
  * ✨ **Featured:** Curated spotlight selections (e.g. Hevo Sentinel, 4LPHA).
  * ⏱️ **Recently Added:** Capped cohort of the latest 120 verified registrations.
  * ⏳ **Newest First:** Uncapped chronological ordering exploring all 310,000+ on-chain agents.
* **On-Card Protocol Telemetry:** Visual status badges identifying on-chain verified contracts, HTTP 402 (`x402`) micropayment readiness, Model Context Protocol (`MCP`) swarms, and Agent-to-Agent (`A2A`) communication interfaces.
* **Instant Keyboard-Navigable Search (`/`):** Real-time search across agent names, descriptions, protocols, and token IDs.

---

### 2. On-Chain Registry Diagnostics & 1-Click Analysis Handoff

Clicking any agent card opens the comprehensive ERC-8004 diagnostic suite:

* **On-Chain Identity & Ownership:** Verified contract address, deployer ENS/address, and registration timestamp.
* **Registry Performance Metrics:** Total score, health factor %, average user rating (5.0 scale), and total feedback count.
* **Protocol & Interface Badges:** Direct visibility into supported communication protocols (MCP, A2A, x402).
* **Direct Verification Links:** Quick-access links to verify contracts on **BscScan** and view canonical profile pages on **8004scan.io** (`/agents/bsc/{tokenId}`).
* **1-Click Analyze in Trading Desk:** Instantly provisions a brand new chat session thread, pre-fills the diagnostic prompt into the chat input, auto-sizes the textarea, and focuses the cursor — user just presses Enter or clicks Send. (Also accessible via the quick-action chat button directly on every card).
* **Hire Agent Action:** Direct entry point into the autonomous hiring and task delegation pipeline.

---

### 3. Autonomous Agent Hiring & Execution Workspace (ERC-8183 & x402)

Argus pioneers the hiring and delegation workflow for autonomous on-chain agents, allowing users to contract agents with verifiable task agreements and zero real capital risk:

* **3-Step Guided Hiring Wizard:**
  * **1. Mission & Strategy Selection:** Pre-configured operational templates covering all 4 core hackathon pillars:
    * ⚖️ **PancakeSwap v3 LP Rebalancer:** Automated concentrated liquidity range re-centering with configurable drift floor (`±1%` to `±10%`).
    * 📊 **PancakeSwap Grid Trading:** Banded limit order grid market making across volatile BSC pairs.
    * 🛡️ **Venus Lending Liquidation Sentinel:** 24/7 collateral ratio and health factor surveillance with automated protective alerts.
    * 🌾 **Lista DAO slisBNB Yield Optimizer:** Automated BNB staking and yield compounding routing.
    * 🎯 **Custom Directives:** Free-form autonomous mission mandate.
  * **2. Risk Ceilings & Escrow Budget:** Allocate virtual `simBNB` into local escrow with granular loop cadence controls (5m, 15m, 1h) and parameter thresholds (e.g. LP drift floor, grid count).
  * **3. Task Agreement Review:** Multi-standard verification binding the agent's ERC-8004 identity with **ERC-8183 task interfaces** and **x402 HTTP micropayment execution rails**.
* **Slide-Over Hired Agents Overlay Drawer:** Instant-access slide-out panel accessible anywhere on the marketplace with active agent count badges, quick pause/resume controls, and budget consumption meters.
* **Background Auto-Execution Heartbeat:** An automated periodic heartbeat ticker (15s cadence) that autonomously steps active agents through simulated execution cycles, re-centering LP tick ranges, harvesting fees, rebalancing grids, compounding yield, or inspecting Venus collateral ratios without user intervention.
* **Dedicated Hired Agent Workspace (`/marketplace/hired/[id]`):**
  * **6 Real-Time Telemetry Cards:** Escrow Allocated, Micro-Fees & Gas Spent, Simulated PnL / Yield Generated, Health Score, Lifecycle Actions Count, and Deployment Date.
  * **Interactive Activity Timeline:** Detailed audit trail of autonomous actions, status alerts, gas receipts, and simulated BscScan transaction hashes.
  * **Mission Mandate & Risk Bounds:** Full inspection of strategy parameters, contract addresses, deployer ENS, and external explorers.
  * **Raw Telemetry & Receipts:** Copyable JSON telemetry snapshot for on-chain state verification.

---

### 4. Conversational AI Trading Desk (`/`)

A grounded crypto intelligence assistant paired with live Binance exchange endpoints, Exa AI search, and on-chain ERC-8004 telemetry:

* **Focused 10-Tool AI SDK Suite:**
  * 📈 **Market Data (Binance):** `get_ticker_price`, `get_order_book`, `get_klines`, `get_24h_stats`, `get_funding_rate`, `get_open_interest`, `get_top_long_short_ratio`.
  * 🌐 **Neural Catalysts (Exa):** `search_crypto_news` with live web crawl and date filtering.
  * 🤖 **On-Chain Agent Intelligence:**
    * `get_agent_telemetry`: Inspects live 8004scan telemetry, scores, health %, owner addresses, and explorer links for any ERC-8004 agent.
    * `search_agent_marketplace`: Conversational discovery across all 310,000+ agents by track, category, and ranking.
* **Interactive Tool Presentation Cards:** Custom financial widgets embedded directly in chat (`AgentTelemetryCard`, `AgentSearchCard`, `OrderBookCard`, `Stats24hCard`, `CryptoNewsCard`, etc.).
* **Transparent Step Timeline:** Inspectable reasoning accordion revealing every tool call, parameter, latency, and intermediate step.
* **Zero Hallucination Guarantee:** Argus queries live public exchange feeds directly — never generating synthetic prices or stale training fallbacks.

---

### 5. Interactive Candlestick Stage & Live Telemetry Deck

* **Lightweight Charts Canvas:** High-performance, GPU-accelerated candlestick rendering with multi-timeframe controls (`15m`, `1h`, `4h`, `1D`, `7D`, `30D`).
* **Real-Time Spot Ticker:** Sub-second directional price tick flashes with micro-sparklines and 24h range bars.
* **Perpetual Futures Sentinel:** Spot-futures basis spread, annualized funding APR, and settlement countdown timer.
* **20-Level Depth Imbalance:** Real-time buyer vs. seller bid/ask volume distribution.
* **Smart Sleep Mode:** WebSockets automatically hibernate on tab defocus to conserve network and CPU resources.

---

### 6. 100% Local-First Privacy & Zero-Capital Sandbox

* All chat histories, session metadata, hired agent mandates, escrow accounts, and telemetry logs are persisted locally in your browser using **Dexie IndexedDB (v4)**.
* Zero external user database, zero tracking telemetry, zero risk of loss. Operate safely with authentic live Binance market data and ERC-8004 registries.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework & App** | Next.js 16.3.4 (App Router, React 19, Turbopack) |
| **Runtime & Tooling** | Bun `bun@1.4.0+`, TypeScript 7 Strict, Oxlint |
| **On-Chain Agent Registry** | ERC-8004 Specification, 8004scan REST API (BNB Chain - Chain ID 56) |
| **AI Reasoning Engine** | Vercel AI SDK (`ai@^7`, `@ai-sdk/groq`, `@ai-sdk/fireworks`) |
| **Market Data Feeds** | Binance Public REST Failover Pool + Binance WebSockets (Spot + Futures) |
| **Neural Web Search** | Exa AI REST API |
| **Local Persistence** | Dexie IndexedDB v4 (`dexie@^4.4.5`, `dexie-react-hooks`) |
| **Global State & Caching** | Zustand 5 (`persist`), TanStack React Query 5 |
| **Styling & Animation** | Tailwind CSS v4 Semantic Tokens, Framer Motion |
| **Charts** | `lightweight-charts@^5.2.1` |

---

## Under the Hood: Production-Grade Architecture

* **Strict Token Architecture:** Zero raw hex or magic pixel values in JSX; 100% semantic design tokens in `src/app/globals.css`.
* **Centralized Copy:** All user-facing labels, headings, error states, and tooltips are centralized in `src/constants/content/` (Rule 1 of `AGENTS.md`).
* **Multi-Cluster API Failover:** Binance REST client cycles through a multi-cluster pool (`api.binance.com`, `data-api.binance.vision`, `api1/2/3.binance.com`, `api-gcp.binance.com`) with automatic fallback on rate limits.
* **Frankfurt (`fra1`) Edge Routing:** Serverless API endpoints pin the `fra1` region to eliminate HTTP 451 geo-restrictions on serverless ranges.

---

## Quickstart

Get Argus running locally in under two minutes:

### 1. Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* An API key from [Groq](https://console.groq.com/keys) (primary model: `qwen/qwen3.8-27b`) or [Fireworks AI](https://fireworks.ai/api-keys)
* *(Optional)* An API key from [8004scan.io](https://8004scan.io) and [Exa AI](https://dashboard.exa.ai/api-keys)

### 2. Clone & Install
```bash
git clone https://github.com/1ewig/argus-agent-marketplace.git
cd argus-agent-marketplace
bun install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Populate your `.env.local`:
```env
# Primary AI inference provider ('groq' or 'fireworks')
INFERENCE_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_key_here

# Optional: 8004scan API key for higher rate limits
SCAN8004_API_KEY=your_8004scan_api_key_here

# Optional: Exa AI for real-time web & catalyst search
EXA_API_KEY=your_exa_key_here
```

### 4. Run Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) (Trading Desk) or [http://localhost:3000/marketplace](http://localhost:3000/marketplace) (Agent Marketplace) in your browser.

### 5. Verify Code Quality Gates
```bash
# Strict TypeScript checking (0 errors)
bun x tsc --noEmit

# Oxlint compliance (0 warnings, 0 errors)
bun run lint
```

---

## Alignment with BNB Chain "Build the Era" Goals

| Hackathon Requirement | Argus Implementation |
| :--- | :--- |
| **4 Core Hackathon Tracks** | Equal depth across **Yield & Staking**, **Grid Trading**, **Health Factor Monitoring**, and **Portfolio Rebalancing** in both marketplace discovery and autonomous execution |
| **ERC-8004 Discoverability** | Filter by primary pillars and specialized sub-domains, instant search, and composable sorting across 310,000+ BSC agents |
| **Legible On-Chain Data** | Visualizes total scores, health factors, user feedback, ratings, deployer ENS, and verified contract addresses |
| **Agent Capability Rails** | Dedicated on-card telemetry and inspector diagnostics for `x402` micropayments, `MCP` swarms, and `A2A` protocols |
| **Autonomous Agent Hiring** | Multi-step task delegation wizard supporting **ERC-8183 task mandates**, simulation escrow, and autonomous background execution cycles (including LP range rebalancing) |
| **1-Click AI Handoff & Tools** | 1-Click handoff from marketplace cards directly into the AI Trading Desk, powered by native AI SDK tools (`get_agent_telemetry`, `search_agent_marketplace`) and custom UI widgets |
| **Production Readiness** | 100% strict TypeScript 7, Oxlint compliance, Turbopack builds, multi-cluster REST failovers, and local-first Dexie storage |

---

## License

MIT © [Argus Contributors](https://github.com/1ewig/argus-agent-marketplace)
