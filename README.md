# Argus — Intelligent Trading Assistant for Binance Agent OS

> A fast, approachable crypto trading assistant that pairs real-time Binance exchange feeds with Exa AI web search for grounded market analysis.  
> Built for the **Binance Agent OS Mini Hackathon (Track A)**.

---

## Welcome to Argus

**Argus** is designed to feel like a sharp, insightful colleague who sits at the trading desk next to you. Instead of guessing prices or generating synthetic data, Argus pulls directly from live Binance public market feeds and Exa AI neural web search to give you clear, grounded perspectives on what the market is doing right now.

Whether you need a quick 24-hour snapshot of Bitcoin, a look at deep order book liquidity for Solana, or an explanation of why a coin is moving based on breaking news, Argus gathers the data in parallel and gives you a clean, easy-to-read summary.

---

## What Makes Argus Different

### 1. Real Market Data Only
Argus never hallucinates, estimates, or makes up prices. Every number, spread percentage, and candlestick metric comes directly from live public Binance Spot and Futures feeds (`api.binance.com` and `fapi.binance.com`). If an invalid pair is entered, Argus tells you upfront rather than guessing.

### 2. Live Crypto News & Catalyst Search (Exa AI)
When you ask why a token is pumping, dumping, or what upgrades are coming up, Argus uses **Exa AI** to search live crypto news, governance forums, and research papers. It automatically isolates recent articles, pulls key highlights, and presents them in clean, clickable news cards.

### 3. Multi-Provider Inference with Auto-Failover
* **Selectable Providers:** Easily switch between **Groq** (Qwen 3.8 27B) and **Fireworks AI** (GLM-5p3 Flash).
* **Automatic Failover:** If your primary model hits a rate limit or capacity spike, Argus seamlessly fails over to the backup model (e.g. GPT-OSS 120B / DeepSeek v4 Flash) so your chat is never interrupted.
* **Fluid Word-by-Word Streaming:** Powered by Vercel AI SDK's `smoothStream` for a natural reading experience.

### 4. Parallel Tool Execution
Argus dispatches multiple tools simultaneously in a single turn. Asking *"How is SOL looking and why is it moving?"* concurrently triggers price checks, 24h stats, order book depth, and live news search in parallel—cutting wait times by up to 70%.

### 5. Inspectable Process Timeline (Zero Raw JSON Dumps)
* **Single Collapsible Group:** All agent thoughts, tool invocations, and live data are organized into an overarching *"Worked for X seconds"* timeline that neatly collapses once your answer arrives.
* **Custom Financial Cards:** Visual cards for order book depth, recent trade tape flow, funding rates, open interest, VWAP average prices, and news articles with direct links.

### 6. Local-First & Private
* **Dexie IndexedDB:** Your chat history, session titles, and telemetry are stored entirely on your local device.
* **Zero Telemetry Tracking:** No third-party data tracking or external databases required.

---

## Available Agent Tools

| Tool | Source | What it Does |
| :--- | :--- | :--- |
| **`get_ticker_price`** | Binance Spot | Real-time spot price tick for any trading pair. |
| **`get_order_book`** | Binance Spot | Live 20-level bid/ask depth, spread %, and depth imbalance ratio. |
| **`get_klines`** | Binance Spot | Historical candlestick trends across 1m, 5m, 15m, 1h, 4h, and 1d intervals. |
| **`get_24h_stats`** | Binance Spot | Rolling 24-hour high, low, price change %, and trading volume. |
| **`get_funding_rate`** | Binance Futures | Perpetual futures funding rate, mark price, APR, and settlement countdown. |
| **`get_average_price`** | Binance Spot | 5-minute rolling Volume Weighted Average Price (VWAP) benchmark. |
| **`get_recent_trades`** | Binance Spot | Live trade tape prints with taker buy vs. sell volume ratios. |
| **`get_open_interest`** | Binance Futures | Real-time perpetual open interest contracts and market positioning. |
| **`search_crypto_news`** | Exa AI | Live cryptocurrency news, regulatory catalysts, and protocol roadmap updates with date filtering and highlights. |

---

## Tech Stack

* **Framework:** Next.js 16 (Turbopack, App Router, React 19)
* **Runtime & Package Manager:** Bun (`bun@1.4.0+`) exclusively
* **Language & Tooling:** TypeScript 7 (strict type-checking), Oxlint (`oxlint@1.81.0+`)
* **AI & Agent Layer:** Vercel AI SDK (`ai@7`, `@ai-sdk/groq`, `@ai-sdk/fireworks`)
* **Search Engine:** Exa AI REST API (`https://api.exa.ai`)
* **Local Database:** Dexie IndexedDB (`dexie`, `dexie-react-hooks`)
* **State Management:** Zustand v5 with local storage persistence
* **Styling & Motion:** Tailwind CSS v4 with custom design tokens and Framer Motion

---

## Quick Start

### Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* An API key from [Groq](https://console.groq.com/keys) or [Fireworks AI](https://fireworks.ai/api-keys)
* *(Optional)* An API key from [Exa AI](https://dashboard.exa.ai/api-keys) for web news search

### 1. Clone & Install
```bash
git clone <repository-url>
cd argus
bun install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your keys in `.env.local`:
```env
# Inference Provider ('groq' | 'fireworks')
INFERENCE_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: Exa AI for web search & crypto news
EXA_API_KEY=your_exa_api_key_here
```

### 3. Run Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Code Quality Checks
```bash
# TypeScript strict check
bun x tsc --noEmit

# Oxlint linter (0 errors, 0 warnings)
bun run lint
```

---

## License

MIT
