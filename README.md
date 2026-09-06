# Argus — Your Intelligent Trading Desk Companion

> A fast, grounded crypto assistant that pairs live Binance market streams with Exa AI neural search to bring clarity to fast-moving markets.  
> Built for the **Binance Agent OS Mini Hackathon (Track A)**.

---

## What is Argus?

Think of **Argus** as that sharp, analytical teammate sitting next to you at the trading desk. 

When crypto markets move fast, you usually find yourself juggling multiple tabs: checking live prices on Binance, opening order books to spot bid walls, scrolling Twitter for breaking news, and calculating funding rates on perpetuals. 

Argus brings all of that into one unified conversation. Instead of guessing or summarizing stale data, Argus reaches directly into Binance public feeds and Exa AI search in parallel, extracts the exact metrics that matter, and breaks them down for you in plain, conversational English.

---

## Why Traders Enjoy Using Argus

### 🔍 Grounded in Live Exchange Data
No estimated prices. No hallucinated stats. When you ask about Bitcoin, Solana, or any USDT pair, Argus pulls directly from live Binance Spot and Futures endpoints. If something isn't available or a symbol isn't listed, it simply tells you upfront.

### ⚡ Parallel Answers in Seconds
Instead of running one check at a time, Argus queries multiple data sources at once. A question like *"Why is SOL moving and how does the order book look?"* triggers price checks, 24h volume stats, 20-level order book depth, and live news articles simultaneously.

### 📰 Real Catalysts & Breaking News
When a token rallies or sells off, price alone doesn't tell the whole story. Argus uses **Exa AI** to search recent crypto journalism, research papers, and governance forums, surfacing the actual catalyst behind the move with direct links.

### 📊 Real-Time Market Deck
Next to your chat sits a live telemetry deck. It connects directly to Binance WebSockets to give you continuous price ticks, a smoothed micro-sparkline, 20-level order book imbalance gauges, and futures funding rate countdowns for whichever coin you are discussing.

### 🔒 Private & Stored Locally
Your conversations, session history, and workspace notes stay in your browser via Dexie IndexedDB. No external database accounts or tracking scripts required.

---

## How It Works in Practice

1. **Pick a Coin or Explore Globally:** Use the workspace selector or press `Ctrl + K` to jump between coins like `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, or general market queries.
2. **Ask Natural Questions:** Try asking:
   * *"What's the 24h momentum on ETH and are buyers in control of the order book?"*
   * *"What are the current funding rates on BTC perpetuals and when is the next settlement?"*
   * *"Why is BNB up today? Search for any major news or announcements."*
3. **Inspect the Process:** Watch the agent's thought process unfold in a clean, collapsible timeline. You'll see which tools were called, the data returned, and a synthesized final take without messy JSON dumps.

---

## Technical Architecture & In-Depth Docs

For engineers and hackathon judges looking for complete technical breakdowns, please see our dedicated documentation:

👉 **[Read the Full Technical Project Summary (`docs/PROJECT_SUMMARY.md`)](docs/PROJECT_SUMMARY.md)**

* **AI Reasoning Layer:** Autonomous multi-step streaming via Vercel AI SDK (`ai@7`) with smooth word-by-word streaming, thinking capture, and automatic multi-provider failover (Groq & Fireworks AI).
* **Live Exchange Feeds:** 10 registered agent tools covering Binance Spot REST, Futures REST, Exa Neural Search, and high-frequency WebSocket partial depth streams (`100ms`).
* **Persistence & Architecture:** Client-side Dexie IndexedDB with versioned migrations, 0ms session prewarming, and modular presentation separation.

---

## Developer Quick Start

### Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* An API key from [Groq](https://console.groq.com/keys) or [Fireworks AI](https://fireworks.ai/api-keys)
* *(Optional)* An API key from [Exa AI](https://dashboard.exa.ai/api-keys) for web news search

### 1. Installation
```bash
git clone <repository-url>
cd argus
bun install
```

### 2. Environment Setup
Create a `.env.local` file based on `.env.example`:
```env
# Primary inference provider ('groq' | 'fireworks')
INFERENCE_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_key_here

# Optional: Exa AI for web search & crypto news
EXA_API_KEY=your_exa_key_here
```

### 3. Run Development Server
```bash
bun run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Code Quality & Linting
```bash
# TypeScript strict check
bun x tsc --noEmit

# Oxlint linter (0 errors, 0 warnings)
bun run lint
```

---

## License

MIT
