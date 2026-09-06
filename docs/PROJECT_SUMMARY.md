# Argus — Technical Project Summary

> A deep technical walkthrough of **Argus**, the intelligent trading-desk companion built for the **Binance Agent OS Mini Hackathon (Track A)**.
>
> This document complements the marketing-style [`README.md`](../README.md) with a module-by-module deep dive: architecture, data flow, the agent engine, the Market Intelligence Agent, tooling conventions, and the persistence layer. It is written for engineers working in this repository.

---

## 1. Overview

**Argus** is a grounded, conversational crypto assistant that pairs **live Binance market feeds** (Spot REST + WebSocket, Futures REST + WebSocket) with **Exa AI neural search**. Instead of summarizing stale data or guessing, it reaches directly into exchange endpoints and search engines, extracts the exact metrics that matter, and explains them in plain, conversational English.

The product solves a real pain point for active traders: juggling multiple tabs (prices, order books, funding rates, news). Argus consolidates all of that into a single conversation with a **live market deck** beside the chat.

### Key product surfaces
- **Agent chat (center):** multi-turn, tool-calling conversation streamed via SSE with a visible, collapsible reasoning/tool-execution timeline.
- **Live market panel (right):** real-time Binance WebSocket telemetry — price ticker + micro-sparkline, order book depth, and a perpetual futures funding sentinel; plus a two-tab switcher (**Live Telemetry** / **Market Intelligence**).
- **Market Intelligence Agent (right-panel tab):** a background sidecar agent that scans 9 live data sources in parallel and emits **one structured JSON payload → four executive cards** (CONTROL, KEY LEVELS, POSITIONING, TACTICAL PLAYBOOK) via `generateObject`, cached for 1 hour.
- **Workspaces & sessions:** symbol-tagged workspaces (`BTCUSDT`, `SOLUSDT`, `GLOBAL`, ...) with persistent chat sessions stored locally in the browser, deep-linkable via URL params (`?symbol=BTCUSDT&chat=conv_...`).

---

## 2. Technology Stack

| Concern | Technology |
| :--- | :--- |
| Framework & UI | Next.js 16.3.4 (Turbopack, App Router, React 19.2.8) |
| Runtime & Package Manager | Bun `bun@1.4.0+` |
| Tooling | TypeScript 7 (strict) & Oxlint (`oxlint@^1.81`) |
| AI & Agent Streaming | Vercel AI SDK (`ai@^7.0.90`, `@ai-sdk/groq@^4`, `@ai-sdk/fireworks@^3`) with `smoothStream`, `generateObject` |
| Market Data | Binance Public REST API & Binance Client WebSockets (Spot + Futures) |
| Search | Exa AI REST API |
| Local Persistence | Dexie IndexedDB v4 (`dexie@^4.4.5`, `dexie-react-hooks`) |
| Styling & Motion | Tailwind CSS v4 design tokens & Framer Motion |
| Global State | Zustand 5 (with `persist`) |
| Server/Client Caching (Data) | TanStack React Query 5 (`@tanstack/react-query@^5`) |
| Validation | Zod v4 |
| Markdown Rendering | `react-markdown` + `remark-gfm` |
| Icons | `lucide-react` |

---

## 3. Architecture & Directory Map

The repository follows the modular convention laid out in [`AGENTS.md`](../AGENTS.md): strict separation of the agent reasoning engine, external clients, reactive hooks, pure presentation components, centralized copy, and persisted global state.

```
src/
├── agent/                        # AI reasoning layer
│   ├── chat/                     # SSE streaming engine + step state machine
│   │   ├── prepare-invocation.ts # builds model+prompt+messages+directives per request
│   │   ├── stream-state-machine.ts # thinking/tool/intermediate_text step timeline
│   │   └── stream-engine.ts      # streamText execution + step timeline + failover
│   ├── intelligence/             # Market Intelligence Agent (generateObject → 4-card payload)
│   │   ├── engine.ts             # 9-source parallel scan + generateObject orchestration
│   │   ├── schemas.ts            # strict Zod MarketIntelligencePayloadSchema
│   │   └── synthesizer.ts        # deterministic fallback from raw exchange math
│   ├── prompts/                  # system prompt, directives, tool descriptions
│   ├── providers/                # Groq/Fireworks model resolution + cross-provider failover
│   ├── tools/                    # 11 AI SDK tool definitions wrapped around lib clients
│   ├── transforms/               # sanitizer, follow-up extractor, session-title filter
│   ├── types.ts                  # AgentOptions/Result, stream events, Zod chat schema
│   └── index.ts                  # public barrel
│
├── lib/                          # external clients, persistence, shared types
│   ├── binance-mcp/              # Binance REST client + normalized types
│   │   ├── public-api-client.ts  # normalizeSymbol + fetch functions (per-endpoint revalidate)
│   │   └── types.ts
│   ├── binance-websocket/        # WS URL builders + message parsers (Spot + Futures)
│   │   ├── parsers.ts
│   │   └── types.ts
│   ├── exa/                      # Exa search client + input/output types + Zod schema
│   ├── db/                       # Dexie IndexedDB schema + reactive queries
│   │   ├── schema.ts             # record types, constants, v1→v4 migrations, db singleton
│   │   ├── conversations.ts      # session CRUD, default/global workspaces, symbol resolution
│   │   ├── messages.ts           # message persistence, retention pruning, normalizeMessageSteps
│   │   ├── intelligence.ts       # Market Intelligence in-memory Map + Dexie v4 snapshot cache
│   │   ├── queries.ts            # useConversations / useMessages (+prewarm cache)
│   │   └── index.ts              # barrel export (public API for the db layer)
│   ├── queries/                  # TanStack queryOptions factories
│   │   ├── market-intelligence.query.ts # 4-card scan cache (1h stale / 24h GC)
│   │   └── symbols.query.ts      # cached USDT symbol catalog
│   ├── chat/                     # client-side transport & history helpers
│   │   ├── chat-stream-client.ts # SSE reader for /api/agent/chat
│   │   └── chat-history.ts       # sliding 10-message context window builder
│   ├── symbols.ts                # normalizeSymbolForDisplay / parseSymbolAssets / base-asset
│   ├── types/                    # domain types (trades, risk certs, invoices, x402)
│   └── utils.ts                  # cn(), GLOBAL workspace helpers, id/time helpers
│
├── hooks/                        # specialized reactive hooks (barrel aggregates 3 domains)
│   ├── chat/                     # chat orchestration, sessions & scroll
│   │   ├── use-agent-chat.ts     # SSE streaming + Dexie persistence orchestration
│   │   ├── use-chat-sessions.ts  # session CRUD, symbol workspace grouping, Global pinning
│   │   └── use-chat-scroll.ts    # RAF-throttled scroll orchestration
│   ├── market/                   # live market data + intelligence
│   │   ├── use-binance-market-stream.ts # live spot WS ticker/depth (tab-visibility sleep)
│   │   ├── use-binance-futures-funding.ts # futures mark-price/funding stream + REST availability + countdown
│   │   ├── use-market-intelligence.ts / use-scan-market-intelligence.ts # TanStack+Dexie cached agent
│   │   ├── use-symbol-search.ts  # symbol catalog, fuzzy + keyboard nav, ⌘K
│   │   └── use-sparkline-data.ts / use-sparkline-geometry.ts # micro price sparkline math
│   ├── ui/                       # generic UX hooks
│   │   ├── use-theme.ts / use-sidebar.ts / use-active-timer.ts / use-execution-mode.ts
│   │   ├── use-tab-visibility.ts # useSyncExternalStore visibility tracker (stream sleep)
│   │   ├── use-url-symbol-sync.ts # deep-link ?symbol=&chat= sync + back/forward
│   │   └── use-accordion-open-state.ts
│   └── index.ts                  # aggregate barrel → export * from chat/ market/ ui/
│
├── components/                   # pure presentation (decoupled from transports)
│   ├── (dashboard)/
│   │   ├── dashboard-client.tsx  # chat stage + market panel + empty state orchestration
│   │   ├── dashboard-header.tsx  # workspace switcher, New Chat, Market Panel toggle
│   │   ├── chat/                 # empty-state, dock, input, message, message-list, timeline,
│   │   │                         #   thought-accordion, work-group, tool-result-card,
│   │   │                         #   markdown-view + tool-results/ (10 per-tool cards)
│   │   ├── market-panel/         # collapsible right deck (Live Telemetry / Market Intelligence / Global Market)
│   │   │   ├── telemetry/        # price-ticker (+sparkline), futures-funding, order-book-depth
│   │   │   ├── agents/           # market-intelligence-agent-view + cards/ (4 executive cards)
│   │   │   └── global/           # global-market-view + cards/ (4 macro cards: Pulse, Movers, Funding, Positioning)
│   │   └── market-chart-view.tsx # placeholder trading-chart stage
│   ├── sidebar/                  # workspace groups, session list, nav views, theme toggle
│   ├── common/                   # agent-loader, argus-icon, confirm-dialog
│   ├── modals/                   # symbol search modal
│   ├── providers/                # QueryProvider (TanStack React Query)
│   └── left-sidebar.tsx
│
├── stores/
│   └── app-store.ts              # Zustand persisted UI state (symbol, panel, tabs, streams,
│                                 #  sidebar) via persist → localStorage; 7-tab rightPanelTab
│                                 #  enum reserved for future sidecar agents (UI renders 2)
│
├── constants/
│   └── content/                  # ALL user-facing copy, modularized (AGENTS.md Rule 1)
│       ├── index.ts              # assembles APP_CONTENT
│       ├── sidebar.content.ts / chat.content.ts / process.content.ts
│       ├── market.content.ts / intelligence.content.ts
│   └── animation.ts              # Framer Motion animation tokens
│
└── app/
    ├── layout.tsx                # root layout, fonts, pre-hydration theme/sidebar script
    ├── page.tsx                  # agent chart stage switcher + SymbolSearchModal
    ├── globals.css               # design tokens + Tailwind utilities
    └── api/
        ├── agent/chat/route.ts         # SSE streaming endpoint
        ├── agent/intelligence/route.ts # Market Intelligence Agent endpoint
        ├── binance/global-overview/route.ts # Global Market Overview endpoint (pure data layer)
        └── binance/symbols/route.ts    # cached USDT symbol catalog
```

---

## 4. Data Flow

### 4.1 Chat request lifecycle (SSE streaming)

1. User submits a message in `ChatInput` → `useAgentChat.handleSend` ([`src/hooks/chat/use-agent-chat.ts`](../src/hooks/chat/use-agent-chat.ts)).
2. The user message is optimistically persisted to Dexie + memory cache; an `AbortController` is created for cancellation (`handleStop`).
3. `streamAgentChat` ([`src/lib/chat/chat-stream-client.ts`](../src/lib/chat/chat-stream-client.ts)) `POST`s to `/api/agent/chat` with `{ message, mode, symbol, history, isFirstTurn }`.
4. The route validates the body against `AgentChatRequestSchema`, then calls `executeAgentStream` ([`src/agent/chat/stream-engine.ts`](../src/agent/chat/stream-engine.ts)).
5. `executeAgentStream` invokes Vercel AI SDK `streamText` with the assembled model, system prompt, conversation history (sliding window of ≤10), 11 tools, and a `smoothStream` (15ms / word) transform.
6. The model calls the defined tools **in parallel** against live Binance/Exa endpoints (e.g. price + 24h stats + order book + news in one round-trip).
7. The engine translates SDK stream parts into SSE events (`step_start`, `step_update`, `reasoning_delta`, `text_delta`, `clear_text`, `session_title`, `done`, `error`) streamed back to the client.
8. The client reconstructs a live `activeStreamMessage`, strips internal markup (`<session_title>` / `<follow_up_questions>`), and persists the completed message to Dexie once `done` arrives. Conversation title + follow-up questions are applied.

### 4.2 Market Intelligence Agent lifecycle

1. User opens the **Market Intelligence** tab (from the right panel tabs) → [`MarketIntelligenceAgentView`](../src/components/(dashboard)/market-panel/agents/market-intelligence-agent-view.tsx) mounts.
2. TanStack React Query keyed `['market-intelligence', symbol]` resolves from the React Query cache, the synchronous in-memory `getCachedIntelligence`, or Dexie v4 `marketIntelligence` storage while fresh (<1h) — then `POST /api/agent/intelligence` on first miss.
3. The route validates `{ symbol, apiKey?, providerOverride? }` and calls `executeMarketIntelligence` ([`src/agent/intelligence/engine.ts`](../src/agent/intelligence/engine.ts)).
4. The engine fires **9 parallel `Promise.allSettled` fetches**: ticker price, 20-level order book, 15m klines (30), 1h klines (24), 5m VWAP, funding rate, global long/short account ratio (5m×5), top trader long/short (5m×5), and Exa news (3 results, `category: 'news'`).
5. Quantitative anchors are derived deterministically (best bid/ask, bid/ask volume imbalance, 15m/1h range low/high) and injected — alongside live news snippets — into a grounded prompt.
6. `generateObject` (primary model, then backup on failure) fills the strict `MarketIntelligencePayloadSchema`. If both models fail, a **deterministic fallback synthesizer** computes the 4-card payload from the same raw exchange math (never hallucinated prices).
7. The response is returned via JSON, persisted directly to Dexie v4 (`marketIntelligence` table), hydrated into React Query (`staleTime: 1h`, `gcTime: 24h`), and rendered as 4 executive cards. The panel header's **Scan Market** button (`handleScan` → `fetchMarketIntelligence({ force: true })`) forces a fresh scan.

### 4.3 Live market telemetry (WebSocket)

- [`use-binance-market-stream`](../src/hooks/market/use-binance-market-stream.ts) opens a combined Binance Spot stream: `<symbol>@ticker` (1000ms) + `<symbol>@depth10@100ms`.
- [`use-binance-futures-funding`](../src/hooks/market/use-binance-futures-funding.ts) performs an initial REST `premiumIndex` fetch (instant display + availability check), then a Futures `<symbol>@markPrice@1s` stream; drives a per-second settlement countdown.
- Parsers in [`src/lib/binance-websocket/parsers.ts`](../src/lib/binance-websocket/parsers.ts) normalize raw frames into UI-ready models (spread, depth imbalance, annualized APR, flash direction, precision, basis).
- Both streams **auto-sleep when the browser tab is hidden** (`visibilitychange` + `useSyncExternalStore`) and auto-reconnect with exponential backoff (Spot: `min(1000·1.5^retries, 10s)`; Futures: fixed 3s).

---

## 5. Agent Engine Details ([`src/agent/`](../src/agent/))

### Streaming architecture
- `executeAgentStream` — real-time SSE streaming with `smoothStream` (15ms delay, word chunking) and a full step timeline. Used by the chat route (`streamArgusAgent` alias).

### Model providers ([`src/agent/providers/`](../src/agent/providers/))
- Active provider resolved from `INFERENCE_PROVIDER` env (`groq` default | `fireworks`), overridable per request via `provider`.
- **Groq:** `qwen/qwen3.8-27b` (backup `openai/gpt-oss-120b`), env-overridable via `GROQ_MODEL` / `GROQ_BACKUP_MODEL`.
- **Fireworks:** `glm-5p3-flash` (backup `deepseek-v4-flash-0731`), wrapped with `extractReasoningMiddleware({ tagName: 'think' })`; env-overridable via `FIREWORKS_MODEL` / `FIREWORKS_BACKUP_MODEL`.
- **Reasoning effort:** per-provider env (`GROQ_REASONING_EFFORT` / `FIREWORKS_REASONING_EFFORT`, default `'low'`), mapped into `providerOptions` (`groq.reasoningEffort`, `fireworks.thinking.enabled`).
- **Max tokens:** default `6000`, overridable via `GROQ_MAX_TOKENS` or `AgentOptions.maxTokens`.
- **Failover:** if the primary model throws before producing text, the engine retries on the backup model — including **cross-provider** failover (Groq→Fireworks) whenever a `FIREWORKS_API_KEY` is present or `BACKUP_INFERENCE_PROVIDER` is set.

### Step timeline state machine
Each turn maintains an ordered list of `AgentExecutionStep` with types `thinking` | `tool` | `intermediate_text` and status `active` | `completed` | `error`. The engine:
- Opens a **thinking** step on `reasoning-delta` events and closes it on text or a tool call (empty thinking steps are dropped).
- Opens a **tool** step on `tool-call`, marks it `completed`/`error` on `tool-result`/`tool-error`, and attaches `toolArgs` + `toolResult`.
- Converts any text emitted before a tool call into an **intermediate_text** step (`clear_text` flushes prior delta text).
- Dangling `active` steps are finalized (completed/error) on completion, error, or abort; failed primary attempts before failover mark leftover steps as `error` with "Switched to backup model".

### Output post-processing
- `<session_title>` is captured **in-stream**: `executeAgentStream` regex-matches the accumulated text and emits a `session_title` SSE event the moment a complete tag appears; `extractSessionTitle` (`transforms/title-stream-filter.ts`) strips the tag from the final payload and falls back to a keyword-driven `generateFallbackSessionTitle` on turn 1, while `sanitizeAgentText` removes any lingering or in-flight XML so raw markup never reaches the UI.
- `extractFollowUpQuestions` parses the trailing `<follow_up_questions>` block into `followUpQuestions[]` and pads to exactly 3 with symbol-aware fallbacks.

### System prompt guards ([`src/agent/prompts/`](../src/agent/prompts/))
- **Zero assumptions:** the model must call live tools before reporting any price/stats; no hallucinated fallbacks; unquoted tickers default to USDT pairs.
- **Parallel tool calling:** it must dispatch independent tools in a single round-trip (e.g., price + 24h stats + depth + news simultaneously).
- **Formatting:** clean executive markdown with snapshot tables, bold metrics, and a one-line takeaway blockquote.
- **Consistency:** mandatory 2–4 word `<session_title>` on turn 1; exactly 3 follow-up questions in `<follow_up_questions>` tags.
- **Token conservation:** responses capped at ~250–350 words (TPM protection).
- Per-workspace (`getWorkspaceSymbolDirective`) and per-environment (`getEnvironmentDirective`) directives are injected dynamically by `prepareAgentInvocation`, plus a `FIRST_TURN_SESSION_TITLE_DIRECTIVE`.

---

## 6. Agent Tools ([`src/agent/tools/registry.ts`](../src/agent/tools/registry.ts))

All tools validate symbols through a strict Zod schema built on `normalizeSymbol` (strips quotes/separators, uppercases, enforces alphanumeric format and a valid quote suffix from `USDT | USDC | FDUSD | EUR | TRY | BTC | ETH | BNB`). Each returns `{ success, ... }` with live data envelopes (e.g. order book summaries with spread + imbalance, kline period change %, trade-tape taker buy ratio, sentiment buckets) and surfaces failures as `{ success: false, error }`.

| Tool | Source | Purpose |
| :--- | :--- | :--- |
| `get_ticker_price` | Binance Spot | Real-time spot price tick |
| `get_order_book` | Binance Spot | Live bid/ask depth, spread %, imbalance ratio (1–100 levels) |
| `get_klines` | Binance Spot | Candlestick OHLCV across 15 intervals, period change % |
| `get_24h_stats` | Binance Spot | 24h high/low, price change %, volume |
| `get_funding_rate` | Binance Futures | Funding rate, mark/index price, annualized APR, next settlement |
| `get_average_price` | Binance Spot | 5-minute rolling VWAP |
| `get_recent_trades` | Binance Spot | Trade tape with taker buy vs. sell ratios |
| `get_open_interest` | Binance Futures | Open interest contracts |
| `get_global_long_short_ratio` | Binance Futures | Retail account long/short sentiment (9 periods) |
| `get_top_long_short_ratio` | Binance Futures | Top-20% whale long/short positioning, sentiment bucket |
| `search_crypto_news` | Exa AI | News/catalysts with category, date-range, domain filters |

The Binance REST client ([`src/lib/binance-mcp/public-api-client.ts`](../src/lib/binance-mcp/public-api-client.ts)) targets `https://api.binance.com` (Spot) and `https://fapi.binance.com` / `https://fapi.binance.com/futures/data` (Futures), with per-endpoint `revalidate` caching (ticker/depth/trades 2s, klines 10s, 24h stats/avg 5s, funding/OI/ratios 15s) and unified error extraction.

---

## 7. Market Telemetry Parsers

- **Ticker** → price, 24h high/low/change, base+quote volume, `rangePositionPercent`, `flashDirection` (up/down flash, auto-clear after 700ms), derived decimal precision.
- **Depth** → cumulative bid/ask levels with `depthPercent` bars, best bid/ask, spread, spread %, bid/ask ratio, depth-limiting to 8 visible levels.
- **Futures mark price** → mark/index price, funding rate %, annualized APR (3 cycles/day × 365 = 1095), basis & basis %, next-settlement countdown (both WS `@markPrice@1s` and REST `premiumIndex` parsers).

---

## 8. Persistence Layer ([`src/lib/db/`](../src/lib/db/))

Dexie `ArgusDatabase` with **versioned migrations**:

- **v1:** flat `messages` (`id, symbol, timestamp, role`).
- **v2:** multi-conversation threads — adds `conversations` table, indexes `conversationId`/`status`, backfills legacy rows to a default conversation.
- **v3:** symbol workspaces — adds `symbol` index on conversations, backfills to `BTCUSDT`.
- **v4:** symbol-specific Market Intelligence — adds `marketIntelligence` table keyed by `symbol` (`symbol, timestamp`), enabling 1-hour durable snapshot caching.

Key behaviors:
- `ConversationRecord` (id, title, symbol, createdAt, updatedAt) and `ChatMessageRecord` (id, conversationId, role, content, symbol?, status, followUpQuestions?, toolCalls?, steps?, stepCount?, workedDurationMs?, timestamp).
- **Special conversations:** `DEFAULT_CONVERSATION_ID = 'default'`, `DEFAULT_GLOBAL_CONVERSATION_ID = 'default_global'`, `GLOBAL_WORKSPACE_SYMBOL = 'GLOBAL'`; `ensureDefaultGlobalConversation()` always keeps a permanent Global workspace chat.
- **Retention pruning:** `MAX_MESSAGES_PER_CONVERSATION = 100` (oldest trimmed after every save).
- **Message cache** (`prewarmMessagesCache`/`updateCachedMessage`/`useMessages` in [`queries.ts`](../src/lib/db/queries.ts)) eliminates flash-of-empty when switching conversations (0ms switching).
- **Intelligence cache** — two-tier read path: synchronous in-memory Map for 0ms within-session switching (`getCachedIntelligence`), backed durably by the Dexie `marketIntelligence` table (`getStoredIntelligence`/`saveStoredIntelligence`), all respecting `ONE_HOUR_MS` freshness; `prewarmIntelligenceCache()` rehydrates memory from Dexie on boot.
- `normalizeMessageSteps` backfills legacy `toolCalls`-only message records into the new `steps` timeline for rendering.
- `prepareConversationHistory` ([`src/lib/chat/chat-history.ts`](../src/lib/chat/chat-history.ts)) builds a sliding 10-message context window, filtering `error` states.
- `useChatSessions` groups conversations into symbol workspaces (`symbolGroups`) via `parseSymbolAssets`, keeps Global pinned at top, and syncs the persisted `selectedSymbol` workspace across refresh/session-switching.

---

## 9. API Reference

### `POST /api/agent/chat`
Streams SSE events of `AgentStreamEvent`. Request schema (`AgentChatRequestSchema`):
- `message` (required), `symbol?`, `mode` (`'simulation'`), `apiKey?`, `history?` (`role`/`content`), `isFirstTurn?`.

Event types emitted: `step_start`, `step_update`, `reasoning_delta`, `text_delta`, `clear_text`, `session_title`, `done`, `error`. Aborts cleanly when the client disconnects (`req.signal`).

### `POST /api/agent/intelligence`
Validates `{ symbol (required), apiKey?, providerOverride? ('groq'|'fireworks') }`, calls `executeMarketIntelligence`, and returns `{ success, symbol, timestamp, data, newsCount, sources }` where `data` is the 4-card `MarketIntelligencePayload`.

### `GET /api/binance/symbols`
Returns active Binance **USDT spot pairs** (from `exchangeInfo?permissions=SPOT`, filtered to `TRADING` + USDT quote + spot-trading allowed), prioritized popular pairs first (BTC, ETH, SOL, ...) then alphabetical. `dynamic = 'force-static'`, `revalidate = 3600`, plus an in-memory 1-hour TTL cache. Fetches with `cache: 'no-store'` to bypass Next's 2MB data-cache limit (raw payload ~23MB), and degrades gracefully to a fallback symbol list on network failure.

---

## 10. Conventions & Tooling (from [`AGENTS.md`](../AGENTS.md))

1. **Zero hardcoded theme values / UI text** — design tokens live in `src/app/globals.css` (e.g. `bg-theme-bg-surface`, `text-theme-brand-binance`, `p-spacing-md`); all copy lives in `src/constants/content/` (modular sidebar/chat/process/market/intelligence files exported as `APP_CONTENT`).
2. **Bun only** — `bun install`, `bun run dev`, `bun run build`, `bun run start`, `bun run lint`, `bun x tsc --noEmit`, `bun x oxlint`.
3. **TypeScript 7 strict + Oxlint** — zero `any` escapes; zero lint warnings/errors.
4. **Modular layering** — agent / lib / hooks / components / constants / stores clearly separated.
5. **Execution integrity** — authentic live data only; deterministic fallbacks derive from real exchange math, never synthetic prices.

### Environment variables (`.env.example`)
- `INFERENCE_PROVIDER` (`groq` | `fireworks`), `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BACKUP_MODEL`, `GROQ_REASONING_EFFORT`, `GROQ_MAX_TOKENS`.
- `FIREWORKS_API_KEY`, `FIREWORKS_MODEL`, `FIREWORKS_BACKUP_MODEL`, `FIREWORKS_REASONING_EFFORT`, `BACKUP_INFERENCE_PROVIDER`.
- `EXA_API_KEY` (news search), `NEXT_PUBLIC_BINANCE_MODE=simulation`, optional x402 wallet placeholders.

---

## 11. Roadmap Status

[`future-plan.md`](../future-plan.md) describes the **3-pane workstation architecture**: symbol catalog (Dexie-cached USDT pairs), center agent chat, right **intelligence deck** with isolated sidecar agents producing strict-Zod structured JSON via `generateObject`.

**Implemented so far:**
- Full 3-pane workstation shell (sidebar ↔ agent chat ↔ collapsible right panel with Live Telemetry / Market Intelligence tabs).
- **Market Intelligence Agent** — a unified sidecar agent covering the Quant/Levels, Catalyst/News, and Liquidity/Positioning planes in **one structured 4-card payload** (CONTROL, KEY LEVELS, POSITIONING, TACTICAL PLAYBOOK) with 1-hour snapshot caching.

**Still on the roadmap:** dedicated independent sidecar endpoints per agent (Tactical Signal & Key Levels, Catalyst & News Radar as standalone subscriptions, Liquidity & Risk Sentinel with slippage tiers), richer charting, and additional workspace-deck modules.

---

*Generated from source analysis on the repository at `main`.*