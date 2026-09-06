# Argus — Your Intelligent Trading Desk Companion

> A grounded, real-time crypto assistant pairing live Binance exchange streams with Exa AI neural search to bring focus and clarity to fast-moving markets.  
> Built for the **Binance Agent OS Mini Hackathon (Track A)**.

---

## The Story Behind Argus

If you've ever traded crypto during high volatility, you know the feeling of "tab overload." 

You have Binance Spot open in one window, Futures funding rates in another, order book depth on a third, and Twitter/Telegram feeds open on your phone trying to figure out why a token just spiked 8% in five minutes. By the time you piece everything together, the move has already played out.

We built **Argus** to solve this. 

Think of Argus as that calm, analytical teammate sitting next to you at the desk. Instead of guessing, giving vague opinions, or summarizing stale numbers, Argus reaches directly into live Binance exchange endpoints and Exa neural search in parallel. It pulls the exact numbers that matter — spread, order book imbalance, funding APR, whale positioning, and breaking news catalysts — and breaks them down in plain, actionable English.

---

## Why Argus Feels Different

### 🎯 Zero Guesswork, 100% Authentic Exchange Data
Argus never estimates prices or invents metrics. When you ask about Bitcoin, Solana, BNB, or any USDT pair, the agent pulls directly from live Binance Spot and Futures public endpoints. If a pair isn't listed or data isn't available, Argus tells you upfront rather than making something up.

### ⚡ Parallel Checks in Seconds
Markets move too quickly for sequential tool calling. When you ask:  
*"Why is SOL rallying, how does the order book look, and what are perpetual funding rates doing?"*  
Argus dispatches requests for price, 24h stats, 20-level order book depth, futures funding, and live crypto journalism simultaneously in a single round-trip.

### 📊 Real-Time Market Telemetry Deck
Beside your conversation sits a live telemetry panel connected directly to Binance WebSockets:
* **Live Ticker:** Sub-second price ticks with direction flash and a smoothed micro-sparkline.
* **Order Book Depth:** 20-level bid/ask visualizer showing real-time wall depth, spread percentage, and buyer vs. seller imbalance.
* **Futures Funding Sentinel:** Live mark price, annualized APR, basis, and an active countdown timer to the next 8-hour settlement.

### 🧠 Market Intelligence Sidecar Agent
Switch the right panel to **Market Intelligence** and watch a background sidecar agent scan 9 exchange feeds in parallel (klines, order book, 5m VWAP, funding, whale vs. retail long/short ratios, and news catalysts). It synthesizes them into **four executive cards**:
1. **CONTROL:** Who owns the current auction (buyers vs. sellers, bid wall support).
2. **KEY LEVELS:** Range lows/highs, VWAP anchor, and immediate liquidity targets.
3. **POSITIONING:** Whale sentiment, retail account skew, and perpetual funding pressure.
4. **TACTICAL PLAYBOOK:** Actionable scenarios with defined invalidation levels.

*Even if LLM rate limits are reached, a deterministic mathematical fallback computes the cards directly from raw exchange math — no broken views, ever.*

### 🌐 Global Macro Deck (`GLOBAL` Workspace)
Need a birds-eye view before diving into a specific coin? Switch to the `GLOBAL` workspace to view:
* **Market Pulse:** Overall market bias across major assets.
* **Top Movers:** Leading gainers and losers across Binance USDT pairs.
* **Funding Heatmap:** Systemic leverage and annualized APR across core perpetual contracts.
* **Macro Positioning:** Whale vs. retail directional bias for BTC and ETH.

### 📈 Interactive Trading Chart Stage
Toggle seamlessly between the conversational agent stage and a full-screen candlestick chart powered by Lightweight Charts, complete with Binance timeframe selection (`15m`, `1h`, `4h`, `1D`, `7D`, `30D`) and live tick updates.

### 🔒 Private by Default & Stored Locally
Your conversations, workspace notes, and session history never leave your machine. Everything is persisted locally in your browser via Dexie IndexedDB. No accounts, no cookies, no tracking.

---

## How It Works in Practice

1. **Pick a Workspace or Search Any Coin:**  
   Hit `Ctrl + K` (or `Cmd + K` on Mac) to search any active Binance USDT pair, or jump straight into `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, or `GLOBAL`.
2. **Ask Natural Questions:**  
   * *"What's the 24h momentum on ETH and are buyers or sellers dominating the order book?"*
   * *"What is the funding rate on BTC perpetuals right now and what does the retail long/short ratio look like?"*
   * *"Why is BNB moving today? Search for any major news or governance announcements."*
   * *"Give me a complete tactical breakdown of SOL with key support and resistance levels."*
3. **Inspect the Process:**  
   Watch the agent's thought process unfold in an interactive, collapsible timeline. See the exact Binance endpoints called, parameters passed, and raw values returned before the agent synthesizes its final take.

---

## Architecture & Engineering Standards

Argus was engineered with strict separation of concerns, high-performance streaming, and robust failover:

* **Bun Runtime (`bun@1.4.0+`):** Built and operated strictly with Bun for blazingly fast installs, tests, and execution.
* **TypeScript 7 Strict & Oxlint:** Zero `any` escapes, fully typed data schemas (Zod v4), and 0 warnings / 0 errors across 170 files.
* **Smooth Word Streaming:** Multi-step SSE streaming via Vercel AI SDK (`ai@7`) with smooth text batching at ~60Hz display refresh to prevent UI stutter and frame drops.
* **Multi-Cluster Failover Pool:** Queries rotate through Binance's global API clusters (`api.binance.com`, `data-api.binance.vision`, `api1/2/3.binance.com`, `api-gcp.binance.com`) with automated retry logic on timeouts or rate limits.
* **Frankfurt Edge Routing (`fra1`):** API routes pin the Frankfurt serverless region to avoid Binance HTTP 451 geo-restrictions on US serverless IP ranges.
* **Zero Hardcoded Themes / Text:** Pure design token system and 100% centralized copy in accordance with our repository guidelines.

For a full module-by-module technical deep dive, explore our documentation:  
👉 **[Read the Technical Project Summary (`docs/PROJECT_SUMMARY.md`)](docs/PROJECT_SUMMARY.md)**

---

## Quickstart for Reviewers

You can have Argus running locally in under two minutes:

### 1. Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* A free API key from [Groq](https://console.groq.com/keys) (primary model: `qwen/qwen3.8-27b`) or [Fireworks AI](https://fireworks.ai/api-keys)
* *(Optional)* An API key from [Exa AI](https://dashboard.exa.ai/api-keys) for live news search

### 2. Install Dependencies
```bash
git clone <repository-url>
cd argus
bun install
```

### 3. Configure Environment
Create a `.env.local` file from the example:
```bash
cp .env.example .env.local
```

Add your keys to `.env.local`:
```env
# Inference Provider ('groq' or 'fireworks')
INFERENCE_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_key_here

# Optional: Exa AI for web & catalyst search
EXA_API_KEY=your_exa_key_here
```

### 4. Launch the Trading Desk
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Validate Code Quality
```bash
# Verify strict TypeScript types (0 errors)
bun x tsc --noEmit

# Verify Oxlint standards (0 warnings, 0 errors)
bun run lint
```

---

## Built for Binance Agent OS

Argus demonstrates what a practical, production-grade autonomous agent on Binance should feel like: grounded in authentic market data, respectful of the user's attention, blazingly fast, and built with modern web engineering rigor.

Thank you to the Binance team and judges for reviewing our project!

---

## License

MIT © Argus Contributors
