# Argus — Your Intelligent Trading Desk Companion

<p align="left">
  <a href="https://argus-ai-agent-hackathon.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/⚡%20Live%20Demo-Launch%20Terminal-F0B90B?style=for-the-badge&logo=vercel&logoColor=000000" alt="Live Demo" />
  </a>
  <a href="https://argus-ai-agent-hackathon.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Binance%20Agent%20OS-Track%20A%20Submission-181A20?style=for-the-badge&logo=binance&logoColor=F0B90B" alt="Binance Hackathon" />
  </a>
  <img src="https://img.shields.io/badge/Runtime-Bun%201.4%2B-FBF0DF?style=for-the-badge&logo=bun&logoColor=000000" alt="Bun" />
  <img src="https://img.shields.io/badge/TypeScript-Strict%207-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-16.3%20App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
</p>

> **Built for the Binance Agent OS Mini Hackathon (Track A)**  
> An autonomous, grounded crypto intelligence terminal pairing live Binance Spot & Futures feeds with Exa AI neural search.
>
> 🌐 **Live Web Terminal:** [https://argus-ai-agent-hackathon.vercel.app](https://argus-ai-agent-hackathon.vercel.app)

<video src="public/videos/Argus-Binance-Agent-Os.mp4" poster="public/images/argus-welcome-stage.webp" controls width="100%" playsinline>
  Your browser does not support the video tag.
</video>

---

## The Problem: Trading in the Noise

If you've ever traded crypto during high volatility, you already know the pain of **tab overload**:

* Binance Spot open in one window tracking rapid price ticks.
* Futures funding rates and mark prices open in another to see who's paying who.
* Order book depth open on a third screen trying to spot spoofed walls.
* Twitter, Telegram, and Discord open on your phone trying to uncover *why* an asset just broke out 12% in three minutes.

By the time you piece all the clues together, the move is over. Most AI chatbots don't help either — they hallucinate prices, summarize stale training data, or offer generic platitudes that get traders liquidated.

**We built Argus to be the partner you actually want sitting beside you on the desk.**

Argus doesn't guess, extrapolate, or recite textbook definitions. When you ask a question, it queries live Binance exchange endpoints and Exa neural search in parallel. It calculates the spread, weighs the order book imbalance, measures funding pressure, checks whale long/short ratios, and pulls the breaking catalyst — giving you an unvarnished, executive breakdown in seconds.

---

## Visual Tour of the Workstation

### 1. The Welcome Stage — Clean, Instant, Focused

When you boot Argus, you're greeted with a focused workspace designed to reduce cognitive friction:

![Argus Welcome Stage](public/images/argus-welcome-stage.webp)

* **Zero-Friction Prompt Starters:** One-click launchpads to dissect 24h momentum, audit perpetual funding rates, or inspect order book depth.
* **Workspace Context:** Automatically adapts to whichever coin you're analyzing (`BTCUSDT`, `ETHUSDT`, `SOLUSDT`, etc.) or switches into macro mode for the entire market.
* **Instant Command Palette (`Ctrl + K` / `Cmd + K`):** Jump between any active USDT trading pair on Binance in milliseconds.

---

### 2. Multi-Turn Conversational Reasoning with Inspectable Proof

Ask open-ended, complex market questions and watch Argus orchestrate live tools in parallel:

![Argus Multi-Turn Agent Conversation](public/images/argus-agent-conversation.webp)

* **Autonomous Tool Orchestration:** Asking *"What are the biggest crypto gainers, losers, and top volume movers today?"* triggers parallel 24h ticker scans, volume analysis, and Exa catalyst searches in a single round trip.
* **Inspectable Reasoning Timeline:** Click into the collapsible **Worked for X seconds** timeline to see every tool call, raw payload, parameter, and intermediate reasoning step. Total transparency — zero black box.
* **Narrative Catalysts:** Argus connects price action with real-world news (such as identifying that Arbitrum's +29.2% surge was fueled by the Robinhood Chain L2 revenue catalyst).

---

### 3. Real-Time Telemetry Deck (`Spot + Futures WebSocket`)

Sitting directly beside your chat is a dedicated telemetry panel streaming live data straight from Binance WebSockets:

![Argus Live Telemetry Deck](public/images/argus-live-telemetry.webp)

* **Live Spot Ticker:** Sub-second price ticks with directional green/red flashes, 24h high/low progress bar, and a smoothed 30-minute micro-sparkline.
* **Perpetual Futures Sentinel:** Tracks mark price, index price, spot-futures basis spread, annualized funding APR, and an active countdown timer ticking down to the next settlement.
* **20-Level Depth Imbalance:** Visualizes live buyer vs. seller bid/ask distribution, spread percentage, and liquidity defense walls so you know who controls the order book right now.
* **Smart Sleep Mode:** Streams automatically hibernate when the browser tab loses focus to conserve CPU and network resources, waking up instantly with exponential backoff reconnects.

---

### 4. Global Macro Deck (`GLOBAL` Workspace)

Need a high-altitude view of the entire crypto landscape before drilling into specific pairs? Switch to the **GLOBAL** workspace:

![Argus Global Market Macro Deck](public/images/argus-global-macro-deck.webp)

* **Market Pulse:** Overall directional market bias and average 24h performance across major benchmark assets (BTC, ETH, SOL, BNB).
* **Top Movers:** Instant ranking of the top gainers and losers across the active Binance USDT universe.
* **Funding Heatmap:** Systemic leverage and annualized APR across perpetual contracts to pinpoint crowded trades before liquidations hit.
* **Macro Positioning:** Compares retail sentiment against whale positioning for BTC and ETH.
* **Fast Cache Refresh:** Dedicated cache-busting button to pull fresh snapshots on demand with minimal latency.

---

### 5. Interactive Candlestick Trading Stage

Tired of toggling to external charting sites? Switch the center stage from **Agent** to **Chart** with one click:

![Argus Candlestick Trading Chart](public/images/argus-candlestick-chart.webp)

* **Lightweight Charts Canvas:** High-performance, GPU-accelerated candlestick rendering that keeps your telemetry deck visible on the right.
* **Direct Binance Feeds:** Historical klines paired with live WebSocket candle updates for seamless price action tracking.
* **Multi-Timeframe Controls:** Toggle between `15m`, `1h`, `4h`, `1D`, `7D`, and `30D`.
* **Dynamic Crosshair & Legend:** Real-time Open, High, Low, Close, and Volume readouts on hover, with one-click recent zoom and fullscreen mode.

---

### 6. Multi-Symbol Workspaces & Local-First Privacy

Organize your trading sessions cleanly by asset without mixing up thoughts or indicators:

![Argus Sidebar Workspaces](public/images/argus-sidebar-workspaces.webp)

* **Automatic Symbol Grouping:** Conversations are automatically organized by asset (`BTC`, `ETH`, `SOL`, `BNB`, `DOGE`, `AVAX`, `SUI`, or `GLOBAL`).
* **Zero-Flash Switching:** In-memory prewarmed message caching allows you to switch between symbol workspaces with 0ms delay.
* **100% Local-First Privacy:** All conversation histories, session metadata, and intelligence snapshots are stored directly in your browser using Dexie IndexedDB. No external user database, no telemetry tracking, no data leakage.

---

## Under the Hood: Production-Grade Engineering

Argus was built from day one to adhere to strict engineering principles:

* **Bun Runtime (`bun@1.4.0+`):** Built and tested strictly with Bun for maximum package installation and runtime velocity.
* **TypeScript 7 Strict & Oxlint:** Zero untyped `any` escapes and 0 warnings / 0 errors across 170+ files.
* **Multi-Cluster Failover Pool:** Binance REST calls cycle through a multi-cluster pool (`api.binance.com`, `data-api.binance.vision`, `api1/2/3.binance.com`, `api-gcp.binance.com`) with automated fallback on network hiccups or rate limits.
* **Frankfurt (`fra1`) Edge Routing:** Serverless API endpoints pin the Frankfurt region (`fra1`) to prevent Binance's HTTP 451 geo-restrictions on US serverless IP ranges.
* **Zero Hardcoded Design Tokens / Copy:** Every color, spacing value, and border token is defined semantically in `src/app/globals.css`, and 100% of user-facing UI copy lives in `src/constants/content/`.

> 💡 **For a comprehensive architectural breakdown, check out the [Technical Project Summary (`docs/PROJECT_SUMMARY.md`)](docs/PROJECT_SUMMARY.md).**

---

## Quickstart for Judges & Reviewers

Get Argus running on your local machine in under two minutes:

### 1. Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* A free API key from [Groq](https://console.groq.com/keys) (primary model: `qwen/qwen3.8-27b`) or [Fireworks AI](https://fireworks.ai/api-keys)
* *(Optional)* An API key from [Exa AI](https://dashboard.exa.ai/api-keys) for live news search

### 2. Clone & Install
```bash
git clone <repository-url>
cd argus
bun install
```

### 3. Set Up Environment Keys
Create your `.env.local` file:
```bash
cp .env.example .env.local
```

Populate your keys:
```env
# Primary inference provider ('groq' or 'fireworks')
INFERENCE_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_key_here

# Optional: Exa AI for real-time web & catalyst search
EXA_API_KEY=your_exa_key_here
```

### 4. Start the Application
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Verify Code Quality Gates
```bash
# Verify strict TypeScript types (0 errors)
bun x tsc --noEmit

# Verify Oxlint compliance (0 warnings, 0 errors)
bun run lint
```

---

## Why Argus Wins Track A

Argus is not a wrapper around an LLM chat prompt. It is a **production-minded trading workstation** built specifically for the Binance ecosystem:

1. **Grounded in Truth:** It never hallucinates market data. Every single price, imbalance ratio, and funding metric is verified against live Binance endpoints.
2. **Built for Real Traders:** It replaces the chaotic 10-tab workflow with an intelligent companion and a live telemetry deck.
3. **Resilient by Design:** Multi-cluster API failover, WebSocket auto-sleep/reconnect, and mathematical deterministic fallbacks keep the workstation operational even when external providers stumble.

Thank you to the Binance team and hackathon judges for reviewing Argus!

---

## License

MIT © Argus Contributors
