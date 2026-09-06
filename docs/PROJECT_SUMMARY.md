# Argus — Technical Project Summary

> A deep technical walkthrough of **Argus**, the intelligent trading-desk companion built for the **Binance Agent OS Mini Hackathon (Track A)**.
>
> This document complements the marketing-style [`README.md`](../README.md) with a module-by-module deep dive: architecture, data flow, the agent engine, tooling conventions, and the persistence layer. It is written for engineers working in this repository.

---

## 1. Overview

**Argus** is a grounded, conversational crypto assistant that pairs **live Binance market feeds** (Spot REST + WebSocket and Futures REST) with **Exa AI neural search**. Instead of summarizing stale data or guessing, it reaches directly into exchange endpoints and search engines, extracts the exact metrics that matter, and explains them in plain, conversational English.

The product solves a real pain point for active traders: juggling multiple tabs (prices, order books, funding rates, news). Argus consolidates all of that into a single conversation with a **live market deck** beside the chat.

### Key product surfaces
- **Agent chat (center):** multi-turn, tool-calling conversation streamed via SSE with a visible, collapsible reasoning/tool-execution timeline.
- **Live market panel (right):** real-time Binance WebSocket telemetry — price ticker, order book depth, micro-sparkline, and perpetual futures funding sentinel.
- **Workspaces & sessions:** symbol-tagged workspaces (`BTCUSDT`, `SOLUSDT`, `GLOBAL`, ...) with persistent chat sessions stored locally in the browser.

---

## 2. Technology Stack

| Concern | Technology |
| :--- | :--- |
| Framework & UI | Next.js 16 (Turbopack, App Router, React 19) |
| Runtime & Package Manager | Bun `bun@1.4.0+` |
| Tooling | TypeScript 7 (strict) & Oxlint |
| AI & Agent Streaming | Vercel AI SDK (`ai@7`, `@ai-sdk/groq`, `@ai-sdk/fireworks`) with `smoothStream` |
| Market Data | Binance Public REST API & Binance Client WebSockets |
| Search | Exa AI REST API |
| Local Persistence | Dexie IndexedDB (`dexie`, `dexie-react-hooks`) |
| Styling & Motion | Tailwind CSS v4 design tokens & Framer Motion |
| Global State | Zustand (with `persist`) |
| Server Caching (Data) | TanStack React Query |
| Validation | Zod |
| Markdown Rendering | `react-markdown` + `remark-gfm` |

---

## 3. Architecture & Directory Map

The repository follows the modular convention laid out in [`AGENTS.md`](../AGENTS.md): strict separation of the agent reasoning engine, external clients, reactive hooks, pure presentation components, centralized copy, and persisted global state.

```
src/
├── agent/                        # AI reasoning layer
│   ├── engine.ts                 # streamText / generateText execution + step timeline
│   ├── prompts.ts                # system prompt, directives, tool descriptions
│   ├── providers.ts              # Groq/Fireworks model resolution + failover
│   ├── tools.ts                  # AI SDK tool definitions wrapped around lib clients
│   ├── types.ts                  # AgentOptions/Result, stream events, Zod chat schema
│   ├── prepare-invocation.ts     # builds model+prompt+messages per request
│   ├── follow-up-extractor.ts    # parses <follow_up_questions> block
│   ├── title-stream-filter.ts    # intercepts <session_title> during streaming
│   └── index.ts                  # public barrel
│
├── lib/                          # external clients, persistence, shared types
│   ├── binance-mcp/              # Binance REST client + normalized types
│   │   ├── public-api-client.ts  # normalizeSymbol + all fetch functions
│   │   └── types.ts
│   ├── binance-websocket/        # WS URL builders + message parsers
│   │   ├── parsers.ts
│   │   └── types.ts
│   ├── exa/                      # Exa search client + input/output types
│   ├── db/                       # Dexie IndexedDB schema + reactive queries
│   │   ├── chat-db.ts
│   │   └── queries.ts
│   ├── agents/                   # client-side transport helpers
│   │   ├── chat-stream-client.ts # SSE reader for /api/agent/chat
│   │   └── chat-history.ts       # sliding context window builder
│   ├── types/                    # domain types (trades, risk certs, invoices)
│   └── utils.ts                  # cn(), id/time helpers
│
├── hooks/                        # specialized reactive hooks (barrel in index.ts)
│   ├── use-agent-chat.ts         # chat orchestration + streaming + persistence
│   ├── use-binance-market-stream.ts # live WS ticker/depth
│   ├── use-chat-sessions.ts      # conversation CRUD/menu
│   ├── use-chat-scroll.ts        # RAF-throttled scroll orchestration
│   ├── use-symbol-search.ts      # symbol catalog filtering
│   ├── use-url-symbol-sync.ts    # syncs workspace symbol to URL
│   ├── use-theme.ts / use-sidebar.ts / use-active-timer.ts / use-execution-mode.ts
│   └── use-binance-futures-funding.ts # futures funding sentinel
│
├── components/                   # pure presentation (decoupled from transports)
│   ├── (dashboard)/
│   │   ├── chat-client.tsx       # chat stage + market panel layout shell
│   │   ├── chat/                 # message, input, process timeline, tool result cards
│   │   ├── market-panel/         # price ticker, order book depth, sparkline, futures
│   │   └── market-chart-view.tsx # placeholder chart stage
│   ├── sidebar/                  # nav, sessions, workspaces, theme toggle
│   ├── common/                   # agent-loader, argus-icon, confirm-dialog
│   ├── modals/                   # symbol search modal
│   ├── providers/                # QueryProvider
│   └── left-sidebar.tsx
│
├── stores/
│   └── app-store.ts              # Zustand persisted global UI state
│
├── constants/
│   ├── content.ts                # ALL user-facing copy (AGENTS.md Rule 1)
│   └── animation.ts              # Framer Motion animation tokens
│
└── app/
    ├── layout.tsx                # root layout, fonts, pre-hydration theme script
    ├── page.tsx                  # chat/chart stage switcher
    ├── globals.css               # design tokens + Tailwind utilities
    └── api/
        ├── agent/chat/route.ts   # SSE streaming endpoint
        └── binance/symbols/route.ts # cached USDT symbol catalog
```

---

## 4. Data Flow

### 4.1 Chat request lifecycle (SSE streaming)

1. User submits a message in `ChatInput` → `useAgentChat.handleSend` ([`src/hooks/use-agent-chat.ts`](../src/hooks/use-agent-chat.ts)).
2. The user message is optimistically persisted to Dexie; an AbortController is created for cancellation.
3. `streamAgentChat` ([`src/lib/agents/chat-stream-client.ts`](../src/lib/agents/chat-stream-client.ts)) `POST`s to `/api/agent/chat`.
4. The route validates the body against `AgentChatRequestSchema`, then calls `executeAgentStream` ([`src/agent/engine.ts`](../src/agent/engine.ts)).
5. `executeAgentStream` invokes Vercel AI SDK `streamText` with the assembled model, system prompt, conversation history, tools, and `smoothStream` transform.
6. The model calls the defined tools **in parallel** against live Binance/Exa endpoints.
7. The engine translates SDK stream parts into SSE events (`step_start`, `step_update`, `reasoning_delta`, `text_delta`, `session_title`, `done`, `error`) streamed back to the client.
8. The client reconstructs a live `activeStreamMessage`, strips internal markup (`<session_title>` / `<follow_up_questions>`), and persists the completed message to Dexie once `done` arrives.

### 4.2 Live market telemetry (WebSocket)

- [`use-binance-market-stream`](../src/hooks/use-binance-market-stream.ts) opens a combined Binance Spot stream: `<symbol>@ticker` (1000ms) + `<symbol>@depth10@100ms`.
- [`use-binance-futures-funding`](../src/hooks/use-binance-futures-funding.ts) opens a Futures mark-price stream for funding/settlement data.
- Parsers in [`src/lib/binance-websocket/parsers.ts`](../src/lib/binance-websocket/parsers.ts) normalize raw frames into UI-ready models (deriving spread, depth imbalance, annualized APR, flash direction, precision, etc.).
- The streams **auto-sleep when the browser tab is hidden** (`visibilitychange` + `useSyncExternalStore`) and auto-reconnect with exponential backoff.

---

## 5. Agent Engine Details ([`src/agent/`](../src/agent/))

### Streaming vs. batch
- `executeAgentStream` — real-time SSE streaming with TPM-friendly `smoothStream` (15ms delay, word chunking) and a full step timeline. Used by the chat route.
- `executeAgent` — one-shot `generateText` batch inference (aliased `runAgent`, `runArgusAgent`).

### Model providers ([`providers.ts`](../src/agent/providers.ts))
- Active provider resolved from `INFERENCE_PROVIDER` env (`groq` default | `fireworks`).
- **Groq:** `qwen/qwen3.8-27b` (backup `openai/gpt-oss-120b`).
- **Fireworks:** `glm-5p3-flash` (backup `deepseek-v4-flash-0731`), wrapped with `extractReasoningMiddleware({ tagName: 'think' })` to capture thinking deltas.
- **Failover:** if the primary model throws before producing text, the engine retries on the backup model — including cross-provider failover (Groq→Fireworks) when a Fireworks key is present.

### Step timeline state machine
Each turn maintains an ordered list of `AgentExecutionStep` with types `thinking` | `tool` | `intermediate_text` and status `active` | `completed` | `error`. The engine:
- Opens a **thinking** step on `reasoning-delta` events and closes it on text or a tool call.
- Opens a **tool** step on `tool-call`, marks it `completed`/`error` on `tool-result`/`tool-error`, and attaches `toolArgs` + `toolResult`.
- Converts any text emitted before a tool call into an **intermediate_text** step.
- Dangling `active` steps are finalized on completion, error, or abort.

### Output post-processing
- `SessionTitleStreamFilter` intercepts `<session_title>` so raw XML never leaks to the client.
- `extractFollowUpQuestions` parses the trailing `<follow_up_questions>` block into `followUpQuestions[]`.

### System prompt guards ([`prompts.ts`](../src/agent/prompts.ts))
- **Zero assumptions:** the model must call live tools before reporting any price/stats; no hallucinated fallbacks.
- **Parallel tool calling:** it must dispatch independent tools in a single round-trip (e.g., price + 24h stats + news simultaneously).
- **Formatting:** clean executive markdown with snapshot tables, bold metrics, and a takeaway blockquote.
- **Consistency:** mandatory 2–4 word `<session_title>` on turn 1; exactly 3 follow-up questions at the end.
- Per-workspace and per-environment directives are injected dynamically via `getWorkspaceSymbolDirective` and `getEnvironmentDirective`.

---

## 6. Agent Tools ([`src/agent/tools.ts`](../src/agent/tools.ts))

All tools validate symbols through a strict Zod schema built on `normalizeSymbol` (handles quoting, separators like `SOL/USDT`, casing, and alphanumeric enforcement). Each returns `{ success, ... }` and surfaces errors as `{ success: false, error }`.

| Tool | Source | Purpose |
| :--- | :--- | :--- |
| `get_ticker_price` | Binance Spot | Real-time spot price tick |
| `get_order_book` | Binance Spot | Live bid/ask depth, spread %, imbalance ratio |
| `get_klines` | Binance Spot | Candlestick OHLCV across many intervals |
| `get_24h_stats` | Binance Spot | 24h high/low, price change %, volume |
| `get_funding_rate` | Binance Futures | Funding rate, mark price, annualized APR, next settlement |
| `get_average_price` | Binance Spot | 5-minute rolling VWAP |
| `get_recent_trades` | Binance Spot | Trade tape with taker buy vs. sell ratios |
| `get_open_interest` | Binance Futures | Open interest contracts |
| `get_global_long_short_ratio` | Binance Futures | Retail account long/short sentiment |
| `get_top_long_short_ratio` | Binance Futures | Top-20% whale long/short positioning |
| `search_crypto_news` | Exa AI | Live news, catalysts, regulatory, sentiment |

The Binance REST client ([`src/lib/binance-mcp/public-api-client.ts`](../src/lib/binance-mcp/public-api-client.ts)) targets `api.binance.com` (Spot) and `fapi.binance.com`/`futures/data` (Futures), with per-endpoint `revalidate` caching (2–15s) and unified error extraction.

---

## 7. Market Telemetry Parsers

- **Ticker** → price, 24h high/low, change, volume, `rangePositionPercent`, `flashDirection` (up/down flash), derived precision.
- **Depth** → cumulative bid/ask levels with `depthPercent` bars, best bid/ask, spread, spread %, bid/ask ratio.
- **Futures mark price** → mark/index price, funding rate %, annualized APR (1095 cycles/yr), basis & basis %, next settlement countdown.

---

## 8. Persistence Layer ([`src/lib/db/`](../src/lib/db/))

Dexie `ArgusDatabase` with **versioned migrations**:

- **v1:** flat `messages`.
- **v2:** multi-conversation threads — adds `conversations` table, indexes `conversationId`/`status`, backfills legacy rows.
- **v3:** symbol workspaces — adds `symbol` to conversations, backfills to `BTCUSDT`.

Key behaviors:
- `ConversationRecord` (id, title, symbol, timestamps) and `ChatMessageRecord` (role, content, status, follow-ups, toolCalls, steps, workedDurationMs).
- **Retention pruning:** `MAX_MESSAGES_PER_CONVERSATION = 100` (oldest trimmed).
- **Message cache** (`useMessages`/`prewarmMessagesCache` in [`queries.ts`](../src/lib/db/queries.ts)) eliminates flash-of-empty when switching conversations (0ms switching).
- `prepareConversationHistory` ([`src/lib/agents/chat-history.ts`](../src/lib/agents/chat-history.ts)) builds a sliding 10-message context window, filtering error states.

---

## 9. API Reference

### `POST /api/agent/chat`
Streams SSE events of `AgentStreamEvent`. Request schema (`AgentChatRequestSchema`):
- `message` (required), `symbol?`, `mode` (`simulation`), `apiKey?`, `history?` (`role`/`content`), `isFirstTurn?`.

Event types emitted: `step_start`, `step_update`, `reasoning_delta`, `text_delta`, `clear_text`, `session_title`, `done`, `error`.

### `GET /api/binance/symbols`
Returns the active Binance **USDT spot pairs** (from `exchangeInfo?permissions=SPOT`), prioritized with popular pairs first (BTC, ETH, SOL, ...) then alphabetical. `dynamic = 'force-static'`, `revalidate = 3600`, plus an in-memory 1-hour cache. On network failure it gracefully degrades to a fallback symbol list.

---

## 10. Conventions & Tooling (from [`AGENTS.md`](../AGENTS.md))

1. **Zero hardcoded theme values / UI text** — design tokens live in `src/app/globals.css` (e.g. `bg-theme-bg-surface`, `text-theme-brand-binance`, `p-spacing-md`); all copy lives in `src/constants/content.ts`.
2. **Bun only** — `bun install`, `bun run dev`, `bun run build`, `bun run lint`, `bun x tsc --noEmit`, `bun x oxlint`.
3. **TypeScript 7 strict + Oxlint** — zero `any` escapes; zero lint warnings/errors.
4. **Modular layering** — agent / lib / hooks / components / constants / stores clearly separated.
5. **Execution integrity** — authentic live data only, no synthetic fallback prices.

---

## 11. Roadmap Reference

[`future-plan.md`](../future-plan.md) describes the **3-pane workstation architecture**: a left symbol catalog (Dexie-cached USDT pairs), center agent chat, and a right "intelligence deck" with live telemetry widgets plus **isolated sidecar AI agents** pushing structured JSON (Tactical Signal & Key Levels, Catalyst & News Radar, Liquidity & Risk Sentinel) via `generateObject` with strict Zod schemas.

---

*Generated from source analysis on the repository at `main`.*
