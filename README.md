# Argus — Trading Assistant for Binance Agent OS

> **Intelligent, Data-Grounded Trading Assistant & Risk Guardian**  
> Built for the **Binance Agent OS Mini Hackathon — Track A ($20,000 USDC)**

---

## Overview

**Argus** is an approachable, high-performance trading assistant powered by **Binance Agent OS**. Unlike generic chatbots that hallucinate market prices or execute trades blindly, Argus operates directly against real-time Binance spot and perpetual market feeds, live order books, and trade tapes with built-in mathematical risk checks, server-side idempotency, and automatic model failover.

Argus pairs ultra-fast inference with a clean, local-first interactive interface—giving traders clear, actionable insights without unnecessary complexity or robotic theatrics.

---

## Key Capabilities & Architecture

### 1. Multi-Provider Inference with Automatic Failover
* **Selectable Providers (`groq` | `fireworks`):** Switch between inference providers via `INFERENCE_PROVIDER` with automatic cross-provider and cross-model failover.
* **Groq Models:**
  * **Primary:** `qwen/qwen3.8-27b` — ultra-fast reasoning, high-fidelity tool-calling, and 128k context window.
  * **Backup:** `openai/gpt-oss-120b` — automatically activated if the primary model encounters rate limits (HTTP 429) or capacity issues.
* **Fireworks AI Models:**
  * **Primary:** `accounts/fireworks/models/glm-5p3-flash` — high-speed reasoning model.
  * **Backup:** `accounts/fireworks/models/deepseek-v4-flash-0731` — rapid secondary reasoning engine.
* **Thinking & Reasoning Extraction:** Embedded `<think>` blocks are captured and converted into native reasoning streams via `extractReasoningMiddleware`, with configurable reasoning effort (default: `'low'`).
* **TPM Protection & Conciseness:** Capped to 6,000 max output tokens per turn (`GROQ_MAX_TOKENS`) with concise system prompts to prevent rate-limit exhaustion.
* **Fluid Word-by-Word Streaming:** Powered by `smoothStream` (15ms delay, word-level chunking) to deliver a smooth, natural reading experience rather than erratic burst streaming.

### 2. Comprehensive Suite of Live Market Tools (Zero Fake Data)
Argus provides immediate, unauthenticated access to the full suite of public Binance Spot and Perpetual Futures market data endpoints (`api.binance.com` and `fapi.binance.com`). **Zero synthetic fallback prices or mock tickers** — if an invalid symbol is entered, Argus surfaces authentic Binance exchange errors:
* **`get_ticker_price`:** Real-time spot price tick for any valid pair.
* **`get_order_book`:** Live bid/ask depth with custom levels (up to 100), computing best bids, best asks, spreads, spread percentages, and depth imbalance ratios.
* **`get_klines`:** Historical OHLCV candlestick data across standard intervals (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`) with period percentage change calculation.
* **`get_24h_stats`:** Rolling 24-hour price change percentage, 24h high, low, base volume, quote volume, and weighted average price.
* **`get_funding_rate`:** Binance Perpetual Futures funding rates, mark price, index price, next funding settlement countdown, and annualized APR.
* **`get_open_interest`:** Real-time Binance Perpetual Futures open interest contracts and latest settlement timestamp.
* **`get_average_price`:** 5-minute rolling Volume Weighted Average Price (VWAP) fair value benchmark.
* **`get_recent_trades`:** Public trade tape prints with timestamps, quantities, and taker buyer vs. seller volume ratio.

### 3. Market Data Guardrails & Universal Symbol Sanitization
To ensure robust analysis and protect against faulty inputs, Argus incorporates rigorous data handling rules:
* **Zero Fake / Synthetic Market Data:** If an invalid symbol is passed or an API request fails, authentic Binance errors are surfaced. Prices and market metrics are never fabricated or estimated.
* **Symbol Sanitization (`normalizeSymbol`):** Automatically cleans quotes (`"BTCUSDT"`), internal separators (`BTC/USDT`, `BTC-USDT`), and lowercase casing (`btcusdt`), enforcing standard alphanumeric quote asset formats (`USDT`, `USDC`, etc.).
* **Deterministic Calculations:** Order book spread percentages, depth imbalance ratios, candlestick percentage movements, and taker volume flow are computed via pure mathematical functions.

### 4. Single-Turn Parallel Tool Execution
* Dispatches independent market queries concurrently in a single LLM round-trip.
* When asking for a coin's status, Argus simultaneously fetches ticker price, 24h market statistics, recent trades, and order book depth—reducing multi-step latency by up to 70%.

### 5. 100% Live Public Feeds (Zero API Keys or KYC Required)
Argus queries production Binance REST APIs (`api.binance.com` and `fapi.binance.com`) for **100% real, live market data** across all market analysis tools. Anyone can run and evaluate real-time analytics, liquidity depth checks, and derivative sentiment immediately out of the box with zero deposit, API keys, KYC, or private credentials required.

### 7. Unified "Worked for # seconds" Process Timeline
* **Single Collapsible Group:** All agent execution steps (reasoning blocks, tool invocations, and formatted tool results) are cleanly bundled inside an overarching accordion.
* **Live Elapsed Timer:** Real-time counter updates dynamically during execution (`Working (4s)`) before finalizing to elapsed duration (`Worked for 4 seconds`).
* **Smart Auto-Collapse:** Automatically collapses once the final answer arrives, preserving a clean reading flow while keeping the entire execution history one click away.
* **Smooth Framer Motion Transitions:** Jitter-free accordion mechanics, smooth empty chat state transitions, and unified dropdown menu animations defined in `src/constants/animation.ts`.

### 8. Inspectable Visual Cards (Zero Raw JSON Dumps)
Sub-accordions in the process timeline render purpose-built visual cards for each tool with zero technical clutter or raw JSON:
* **Order Book Depth Card:** Split side-by-side Buy (Bids) and Sell (Asks) panels with volume depth fill bars, mid-market price, spread percentage, and crypto quantity formatting that avoids truncating fractional amounts.
* **Recent Trades Card:** Public tape stream displaying fill price, quantity, execution timestamp, and a calculated taker buyer vs. seller volume ratio bar.
* **Funding Rate Card:** Displays perpetual contract funding rate, annualized APR, mark price, and countdown to next funding settlement.
* **Average Price (VWAP) Card:** 5-minute rolling fair value benchmark comparison.
* **Candlestick Chart Card:** Visual candlestick chart rendering for historical kline intervals.
* **24h Market Stats Card:** 24h high/low range, price change percentage, and trading volume metrics.

### 9. Local-First Session Management
* Powered by **Dexie IndexedDB** for private, client-side conversation persistence.
* Supports creating new chats, switching between saved conversations, and inline chat renaming without page reloads.

---

## Technology Stack

* **Framework:** Next.js 16 (Turbopack, App Router, React 19)
* **Runtime & Package Manager:** Bun (`bun@1.4.0+`) exclusively
* **Language & Tooling:** TypeScript 7 (native Go compiler), Oxlint (`oxlint@1.81.0+`)
* **Styling & Motion:** Tailwind CSS v4 with Neo-Minimalist Architectural design tokens configured in `globals.css` and Framer Motion animations
* **Agent Engine:** Vercel AI SDK (`ai@7`, `@ai-sdk/groq`, `@ai-sdk/fireworks`)
* **Client Database:** Dexie IndexedDB (`dexie`, `dexie-react-hooks`)
* **Icons:** Lucide React

---

## Project Structure

```
src/
├── app/                  # Route boundaries, page layouts, and SSE API endpoints
│   ├── api/agent/chat/   # Server-Sent Events (SSE) streaming endpoint
│   ├── globals.css       # 15 theme tokens, typography, and spacing variables
│   └── page.tsx          # Single-page trading interface with environment toggle & chat
├── components/           # Presentation UI components
│   └── (dashboard)/
│       ├── cards/        # AccountPortfolioCard, ActiveTradesCard, DailyMarketCard
│       ├── chat/         # ChatWindow, ChatMessage, ProcessTimeline, ToolResultCard, SessionsMenu
│       ├── argus-icon.tsx# Brand SVG icon
│       ├── market-chart-view.tsx # High-fidelity candlestick market chart
│       ├── stage-view-switcher.tsx # Agent Chat vs Trading Chart toggle
│       ├── top-nav-bar.tsx # Architectural top bar with search and status
│       └── markdown-view.tsx # Custom GFM renderer with styled tables & code blocks
├── constants/            # Centralized UI copy, tool labels, and animation variants
│   ├── animation.ts      # Unified Framer Motion accordion, dropdown, and entrance variants
│   └── content.ts        # Centralized UI dictionary text, tool badges, and placeholders
├── hooks/                # Custom React hooks (useAgentChat, useExecutionMode)
├── lib/
│   ├── agents/           # Client-side SSE stream transport and chat history helpers
│   ├── binance-mcp/      # Production REST client and paper wallet sandbox
│   │   ├── index.ts      # Adapter provider & singleton exports
│   │   ├── public-api-client.ts # Live Binance REST caller with unified error extraction
│   │   ├── simulated-wallet.ts  # In-memory paper wallet with idempotency & PERCENT_PRICE rules
│   │   ├── simulated-adapter.ts # Adapter orchestrating live REST data & paper wallet
│   │   └── types.ts      # Binance tool interfaces & Zod schemas
│   ├── db/               # Dexie IndexedDB schema, queries, and step normalizers
│   ├── risk-engine/      # Deterministic mathematical risk evaluation functions
│   ├── types/            # Shared domain types and Zod runtime schemas
│   └── utils.ts          # Pure utility helpers
└── agent/                # Core AI agent engine
    ├── engine.ts         # Multi-step streaming loop with rate-limit failover & tool error handling
    ├── prepare-invocation.ts # Model binding, tool configuration, and dynamic prompt assembly
    ├── providers.ts      # Multi-provider model factories (Groq & Fireworks AI) with failover
    ├── title-stream-filter.ts # Stream interceptor preventing raw XML tag leakage
    ├── tools.ts          # Binance MCP tool definitions with Zod schemas & sanitization
    ├── prompts.ts        # System prompts, tool descriptions, and formatting guidelines
    └── types.ts          # Agent result, step, and stream event interfaces
```

---

## Engineering & Design Standards

Argus follows strict engineering rules defined in [`AGENTS.md`](./AGENTS.md):
1. **Zero Hardcoded Design Tokens:** All colors, font sizes, weights, and spacing use strict CSS variables (`--theme-*`, `--text-*`, `--spacing-*`).
2. **Zero Hardcoded UI Text:** User-facing strings and error messages reside in centralized constants.
3. **Bun Only:** All scripts, dependencies, and tools are run via `bun` (`bun add`, `bun run dev`, `bun x tsc`).
4. **TS7 & Oxlint:** Clean type checking (`bun x tsc --noEmit`) and linting (`bun run lint`) with 0 errors and 0 warnings.
5. **Human Language:** Conversational, approachable tone with zero military or robotic fluff.
6. **Parallel Execution:** Tools and file operations are batched concurrently in single operations.

---

## Quick Start Guide

### Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* An API key for [Groq](https://console.groq.com/keys) or [Fireworks AI](https://fireworks.ai/api-keys)

### 1. Clone & Install Dependencies
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

Configure your credentials in `.env.local`:
```env
# ------------------------------------------------------------------------------
# 1. Inference Provider ('groq' | 'fireworks')
# ------------------------------------------------------------------------------
INFERENCE_PROVIDER=groq

# --- Groq Provider Configuration ---
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_BACKUP_MODEL=openai/gpt-oss-120b
GROQ_REASONING_EFFORT=low
GROQ_MAX_TOKENS=6000

# --- Fireworks AI Provider Configuration ---
FIREWORKS_API_KEY=your_fireworks_api_key_here
FIREWORKS_MODEL=accounts/fireworks/models/glm-5p3-flash
FIREWORKS_BACKUP_MODEL=accounts/fireworks/models/deepseek-v4-flash-0731
FIREWORKS_REASONING_EFFORT=low

# Optional: Automatic cross-provider failover
BACKUP_INFERENCE_PROVIDER=fireworks

# ------------------------------------------------------------------------------
# 2. Binance Execution Mode
# ------------------------------------------------------------------------------
# Mode: 'simulation' (100% real live Binance market feeds + paper wallet sandbox)
NEXT_PUBLIC_BINANCE_MODE=simulation
```

### 3. Start Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Code Quality Checks
```bash
# TypeScript 7 Type Check
bun x tsc --noEmit

# Oxlint Linter
bun run lint
```

---

## License

MIT
