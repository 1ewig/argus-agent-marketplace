# Argus — Technical Project Summary

> A deep technical walkthrough of **Argus**, the intelligent trading-desk companion built for the **Binance Agent OS Mini Hackathon (Track A)**.
>
> 🌐 **Live Web Terminal:** [https://argus-ai-agent-hackathon.vercel.app](https://argus-ai-agent-hackathon.vercel.app)
>
> This document complements the marketing-style [`README.md`](../README.md) with a module-by-module deep dive: architecture, data flow, the agent engine, the Agent Marketplace, tooling conventions, and the persistence layer. It is written for engineers working in this repository.

---

## 1. Overview

**Argus** is a grounded, conversational crypto assistant that pairs **live Binance market feeds** (Spot REST + Futures REST) with **Exa AI neural search** and an **ERC-8004 Agent Marketplace**. Instead of summarizing stale data or guessing, it reaches directly into exchange endpoints and search engines, extracts the exact metrics that matter, and explains them in plain, conversational English.

The product solves a real pain point for active traders: juggling multiple tabs (prices, order books, funding rates, news). Argus consolidates all of that into a single conversation — with a live candlestick chart and a browsable agent registry alongside the chat.

### Key product surfaces
- **Agent chat (center stage):** multi-turn, tool-calling conversation streamed via SSE with a visible, collapsible reasoning/tool-execution timeline.
- **Trading Chart stage (center stage alt):** an interactive `lightweight-charts` candlestick canvas toggled from the header (Agent ⇄ Chart). Fetches historical klines per active timeframe, then live-streams `<symbol>@kline_<interval>` + `<symbol>@ticker` over WebSocket — with crosshair legend, zoom-to-recent, reset zoom, and fullscreen. Six timeframes (15M/1H/4H/1D/7D/30D).
- **Agent Marketplace (route):** browsable ERC-8004 agent registry with category filters, search, spotlight, and detail modal. Agents are sourced from the 8004scan API with in-memory caching and offline fallback.

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
| Agent Registry | 8004scan REST API (ERC-8004 agents on BNB Chain) |
| Local Persistence | Dexie IndexedDB v4 (`dexie@^4.4.5`, `dexie-react-hooks`) |
| Styling & Motion | Tailwind CSS v4 design tokens & Framer Motion (`clsx` + `tailwind-merge` for `cn()`) |
| Global State | Zustand 5 (with `persist`) |
| Server/Client Caching (Data) | TanStack React Query 5 (`@tanstack/react-query@^5`) |
| Validation | Zod v4 |
| Markdown Rendering | `react-markdown` + `remark-gfm` |
| Icons | `lucide-react` |
| Charts | `lightweight-charts@^5.2.1` (candlestick canvas) |

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
│   ├── prompts/                  # system prompt, directives, tool descriptions
│   ├── providers/                # Groq/Fireworks model resolution + cross-provider failover
│   ├── tools/                    # 11 AI SDK tool definitions wrapped around lib clients
│   ├── transforms/               # sanitizer, follow-up extractor, session-title filter
│   ├── types.ts                  # AgentOptions/Result, stream events, Zod chat schema
│   └── index.ts                  # public barrel
│
├── lib/                          # external clients, persistence, shared types
│   ├── 8004scan/                 # 8004scan API client for ERC-8004 agent registry
│   │   ├── client.ts             # list/search/category/spotlight/leaderboard/trending/featured/latest/detail
│   │   ├── types.ts              # ScanAgentItem, MarketplaceTab, FetchAgentsParams, AgentsApiResponse
│   │   ├── categories.ts         # CATEGORY_DISCOVERY_CONFIG (single source of truth for category labels)
│   │   └── index.ts              # barrel export
│   ├── binance-mcp/              # Binance REST client + normalized types
│   │   ├── public-api-client.ts  # normalizeSymbol + fetch functions (per-endpoint revalidate)
│   │   └── types.ts
│   ├── exa/                      # Exa search client + input/output types + Zod schema
│   ├── db/                       # Dexie IndexedDB schema + reactive queries
│   │   ├── schema.ts             # record types, constants, v1→v3 migrations, db singleton
│   │   ├── conversations.ts      # session CRUD, default conversation
│   │   ├── messages.ts           # message persistence, retention pruning, normalizeMessageSteps
│   │   ├── queries.ts            # useConversations / useMessages (+prewarm cache)
│   │   └── index.ts              # barrel export (public API for the db layer)
│   ├── queries/                  # TanStack queryOptions factories
│   │   └── agents.query.ts       # React Query wrapper for /api/agents
│   ├── chat/                     # client-side transport & history helpers
│   │   ├── chat-stream-client.ts # SSE reader for /api/agent/chat
│   │   └── chat-history.ts       # sliding 10-message context window builder
│   ├── symbols.ts                # normalizeSymbolForDisplay / parseSymbolAssets / base-asset
│   ├── types/                    # modular domain types (agent, alpha, risk, execution, x402, global-market)
│   └── utils.ts                  # cn(), id/time helpers
│
├── hooks/                        # specialized reactive hooks (barrel aggregates 3 domains)
│   ├── chat/                     # chat orchestration, sessions & scroll
│   │   ├── use-agent-chat.ts     # SSE streaming + Dexie persistence orchestration
│   │   ├── use-chat-sessions.ts  # session CRUD, flat sorted conversations
│   │   └── use-chat-scroll.ts    # RAF-throttled scroll orchestration
│   ├── agents/                   # agent marketplace
│   │   └── use-agent-marketplace.ts # filter/pagination/search/spotlight state
│   ├── ui/                       # generic UX hooks
│   │   ├── use-theme.ts / use-sidebar.ts / use-active-timer.ts / use-execution-mode.ts
│   │   ├── use-tab-visibility.ts # useSyncExternalStore visibility tracker (stream sleep)
│   │   └── use-accordion-open-state.ts
│   └── index.ts                  # aggregate barrel → export * from chat/ agents/ ui/
│
├── components/                   # pure presentation (decoupled from transports)
│   ├── (agent-marketplace)/      # Agent Marketplace UI
│   │   ├── agent-marketplace.client.tsx # main marketplace client shell
│   │   ├── marketplace-header.tsx # search, refresh, count badge
│   │   ├── marketplace-filter-bar.tsx # category + sort tabs
│   │   ├── agent-grid.tsx        # responsive card grid + pagination
│   │   ├── agent-card.tsx        # compact agent card with badges/scores
│   │   ├── agent-detail-modal.tsx # full profile modal with diagnostics
│   │   └── index.ts              # barrel export
│   ├── (dashboard)/
│   │   ├── dashboard-client.tsx  # chat + chart stage orchestration
│   │   ├── dashboard-header.tsx  # stage (Agent/Chart) toggle, timeframe switcher, New Chat
│   │   ├── markdown-view.tsx     # sanitized markdown renderer (react-markdown + remark-gfm)
│   │   └── chat/                 # chat-client, empty-state, dock, input, message,
│   │                             #   message-list, agent-process-timeline, thought-accordion,
│   │                             #   agent-work-group, tool-result-card,
│   │                             #   tool-results/ (10 per-tool cards) + display-info/helpers
│   │   └── chart/                # Trading Chart stage (lightweight-charts)
│   │       ├── chart-client.tsx  # REST kline load + combined kline/ticker WS stream
│   │       ├── candlestick-canvas.tsx # minimal canvas, crosshair sync, zoom-to-recent
│   │       ├── chart-header.tsx  # floating live price / 24h stats / WS status / actions
│   │       └── chart-legend.tsx  # O/H/L/C crosshair legend
│   ├── sidebar/                  # session list, nav views, theme toggle
│   ├── common/                   # agent-loader, argus-icon, confirm-dialog
│   ├── providers/                # QueryProvider (TanStack React Query)
│   └── left-sidebar.tsx
│
├── stores/
│   └── app-store.ts              # Zustand persisted UI state (activeConversationId,
│                                 #  isSidebarCollapsed, rightPanelTab) via persist → localStorage
│
├── constants/
│   └── content/                  # ALL user-facing copy, modularized (AGENTS.md Rule 1)
│       ├── index.ts              # assembles APP_CONTENT
│       ├── sidebar.content.ts / chat.content.ts / process.content.ts
│       ├── market.content.ts / marketplace.content.ts
│   └── animation.ts              # Framer Motion animation tokens
│
└── app/
    ├── layout.tsx                # root layout, fonts, pre-hydration theme/sidebar script
    ├── page.tsx                  # agent chart stage switcher
    ├── marketplace/page.tsx      # Agent Marketplace route
    ├── agents/page.tsx           # alias → marketplace
    ├── globals.css               # design tokens + Tailwind utilities
    └── api/
        ├── agent/chat/route.ts   # SSE streaming endpoint
        └── agents/route.ts       # Agent Marketplace API (8004scan proxy + cache + fallback)
```

---

## 4. Data Flow

### 4.1 Chat request lifecycle (SSE streaming)

1. User submits a message in `ChatInput` → `useAgentChat.handleSend` ([`src/hooks/chat/use-agent-chat.ts`](../src/hooks/chat/use-agent-chat.ts)).
2. The user message is optimistically persisted to Dexie + memory cache; an `AbortController` is created for cancellation (`handleStop`).
3. `streamAgentChat` ([`src/lib/chat/chat-stream-client.ts`](../src/lib/chat/chat-stream-client.ts)) `POST`s to `/api/agent/chat` with `{ message, mode, history, isFirstTurn }`.
4. The route validates the body against `AgentChatRequestSchema`, then calls `executeAgentStream` ([`src/agent/chat/stream-engine.ts`](../src/agent/chat/stream-engine.ts)).
5. `executeAgentStream` invokes Vercel AI SDK `streamText` with the assembled model, system prompt, conversation history (sliding window of ≤10), 11 tools, and a `smoothStream` (15ms / word) transform.
6. The model calls the defined tools **in parallel** against live Binance/Exa endpoints (e.g. price + 24h stats + order book + news in one round-trip).
7. The engine translates SDK stream parts into SSE events (`step_start`, `step_update`, `reasoning_delta`, `text_delta`, `clear_text`, `session_title`, `done`, `error`) streamed back to the client.
8. The client reconstructs a live `activeStreamMessage`, strips internal markup (`<session_title>` / `<follow_up_questions>`), and persists the completed message to Dexie once `done` arrives. Conversation title + follow-up questions are applied.

### 4.2 Trading Chart stage lifecycle

1. The **Chart** entry in the header toggles `stageView` between `'agent'` and `'chart'` ([`src/lib/types/agent.ts`](../src/lib/types/agent.ts)); the chart mounts only while active (zero-flash hidden subtree in [`DashboardClient`](../src/components/(dashboard)/dashboard-client.tsx)).
2. [`ChartClient`](../src/components/(dashboard)/chart/chart-client.tsx) resolves the active timeframe (default `1D`, six options from `APP_CONTENT.chart.timeframes`) and fetches historical klines via Binance Spot REST (`/api/v3/klines?interval=<tf>&limit=<tf.limit>`).
3. A combined WebSocket stream (`<symbol>@kline_<interval>` + `<symbol>@ticker`) then live-updates the canvas via `candlestick-canvas`'s imperative `updateCandle` handle; candle state keeps the floating legend (O/H/L/C) and live price in sync.
4. The canvas [`candlestick-canvas.tsx`](../src/components/(dashboard)/chart/candlestick-canvas.tsx) applies precision-aware price formatting, a dotted crosshair with axis badges, crosshair→legend sync, and `zoomToRecent` (36 visible bars). Reset-zoom and fullscreen controls are exposed in the floating action strip.
5. The stream sleeps on `document.hidden` and reconnects with exponential backoff (`min(1000·1.5^retries, 8000)`). The chart uses its own direct REST+WS channels.

### 4.3 Agent Marketplace lifecycle

1. The marketplace route ([`src/app/marketplace/page.tsx`](../src/app/marketplace/page.tsx)) mounts `AgentMarketplaceClient` which orchestrates the full UI.
2. [`useAgentMarketplace`](../src/hooks/agents/use-agent-marketplace.ts) manages filter state (tabs, search, pagination) and issues TanStack React Query requests to `GET /api/agents` with params (`feed`, `category`, `search`, `limit`, `offset`).
3. `GET /api/agents` ([`src/app/api/agents/route.ts`](../src/app/api/agents/route.ts)) acts as a server-side proxy: it checks an in-memory 60s TTL cache, then dispatches to the appropriate 8004scan endpoint (`listAgents`, `searchAgents`, `getAgentsByCategory`, `getLeaderboard`, `getTrendingAgents`, `getFeaturedAgents`, `getLatestAgents`, or `getSpotlightAgents`).
4. On API failure, the route falls back to a local JSON snapshot (`scripts/data/agents-bsc.json`) with client-side filtering.
5. Spotlight agents (Hevo & 4LPHA) are fetched in parallel via a dedicated query and displayed inline at the top of the default feed.

---

## 5. Agent Engine Details ([`src/agent/`](../src/agent/))

### Streaming architecture
- `executeAgentStream` — real-time SSE streaming with `smoothStream` (15ms delay, word chunking) and a full step timeline. Used by the chat route (`streamArgusAgent` alias).

### Model providers ([`src/agent/providers/`](../src/agent/providers/))
- Active provider resolved from `INFERENCE_PROVIDER` env (`groq` default | `fireworks`), overridable per request via `provider`.
- **Groq:** `qwen/qwen3.8-27b` (backup `openai/gpt-oss-120b`), env-overridable via `GROQ_MODEL` / `GROQ_BACKUP_MODEL`.
- **Fireworks:** code defaults in [`config.ts`](../src/agent/providers/config.ts) are `deepseek-v4-flash-0731` (primary) / `glm-5p3-flash` (backup), whereas `.env.example` lists them swapped — when `FIREWORKS_MODEL`/`FIREWORKS_BACKUP_MODEL` are set, env wins. Models are wrapped with `extractReasoningMiddleware({ tagName: 'think' })`.
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
- `<session_title>` is captured **in-stream**: `executeAgentStream` regex-matches the accumulated text and emits a `session_title` SSE event the moment a complete tag appears; `extractSessionTitle` ([`transforms/title-stream-filter.ts`](../src/agent/transforms/title-stream-filter.ts)) strips the tag from the final payload and falls back to a keyword-driven `generateFallbackSessionTitle` on turn 1, while `sanitizeAgentText` removes any lingering or in-flight XML so raw markup never reaches the UI.
- `stripIntermediateTextPrefix` ([`transforms/sanitizer.ts`](../src/agent/transforms/sanitizer.ts)) deduplicates any pre-tool intermediate text that leaked into the final response, preventing thought duplication at inference end.
- `extractFollowUpQuestions` ([`transforms/follow-up-extractor.ts`](../src/agent/transforms/follow-up-extractor.ts)) parses the trailing `<follow_up_questions>` block into `followUpQuestions[]` and pads to exactly 3 with contextual fallbacks.

### System prompt guards ([`src/agent/prompts/`](../src/agent/prompts/))
- **Zero assumptions:** the model must call live tools before reporting any price/stats; no hallucinated fallbacks; unquoted tickers default to USDT pairs.
- **Parallel tool calling:** it must dispatch independent tools in a single round-trip (e.g., price + 24h stats + depth + news simultaneously).
- **Formatting:** clean executive markdown with snapshot tables, bold metrics, and a one-line takeaway blockquote.
- **Consistency:** mandatory 2–4 word `<session_title>` on turn 1; exactly 3 follow-up questions in `<follow_up_questions>` tags.
- **Token conservation:** responses capped at ~250–350 words (TPM protection).
- Per-environment (`getEnvironmentDirective`) and first-turn (`FIRST_TURN_SESSION_TITLE_DIRECTIVE`) directives are injected dynamically by `prepareAgentInvocation`.

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

The Binance REST client ([`src/lib/binance-mcp/public-api-client.ts`](../src/lib/binance-mcp/public-api-client.ts)) targets a **multi-cluster failover pool**: `BINANCE_SPOT_CLUSTER_ENDPOINTS` (`api.binance.com`, `data-api.binance.vision`, `api1/2/3.binance.com`, `api-gcp.binance.com`) for Spot and the single `BINANCE_FUTURES_CLUSTER_ENDPOINTS` base (`fapi.binance.com`) for Futures — covering both the `/fapi/` and `/futures/data/` path namespaces. Each attempt is capped at a 6s `AbortSignal.timeout`; on timeouts, 429s, 5xx, or 451 geo-blocks it retries the next cluster (throwing immediately on deterministic 400 symbol errors), and `BINANCE_SPOT_API_URL` / `BINANCE_FUTURES_API_URL` prepend custom cluster bases. Per-endpoint `revalidate` caching applies (ticker/depth/trades 2s, klines 10s, 24h stats/avg 5s, funding/OI/ratios 15s) with unified error extraction.

---

## 7. Persistence Layer ([`src/lib/db/`](../src/lib/db/))

Dexie `ArgusDatabase` with **versioned migrations**:

- **v1:** flat `messages` (`id, timestamp, role`).
- **v2:** multi-conversation threads — adds `conversations` table, indexes `conversationId`/`status`, backfills legacy rows to a default conversation.
- **v3:** legacy symbol workspaces (kept for migration compatibility only — `symbol` field removed from TypeScript interfaces).

Key behaviors:
- `ConversationRecord` (`id`, `title`, `createdAt`, `updatedAt`) and `ChatMessageRecord` (`id`, `conversationId`, `role`, `content`, `status`, `followUpQuestions?`, `toolCalls?`, `steps?`, `stepCount?`, `workedDurationMs?`, `timestamp`).
- **Default conversation:** `DEFAULT_CONVERSATION_ID = 'default'`; `ensureDefaultConversation()` lazily creates a single default chat if none exists.
- **Retention pruning:** `MAX_MESSAGES_PER_CONVERSATION = 100` (oldest trimmed after every save).
- **Message cache** (`prewarmMessagesCache`/`updateCachedMessage`/`useMessages` in [`queries.ts`](../src/lib/db/queries.ts)) eliminates flash-of-empty when switching conversations (0ms switching).
- `normalizeMessageSteps` backfills legacy `toolCalls`-only message records into the new `steps` timeline for rendering.
- `prepareConversationHistory` ([`src/lib/chat/chat-history.ts`](../src/lib/chat/chat-history.ts)) builds a sliding 10-message context window, filtering `error` states.
- `useChatSessions` ([`src/hooks/chat/use-chat-sessions.ts`](../src/hooks/chat/use-chat-sessions.ts)) provides a flat, chronologically sorted list of conversations with session CRUD (create, rename, delete) and message count tracking.

---

## 8. API Reference

### `POST /api/agent/chat`
Streams SSE events of `AgentStreamEvent`. Request schema (`AgentChatRequestSchema`):
- `message` (required), `mode` (`'simulation'`), `apiKey?`, `history?` (`role`/`content`), `isFirstTurn?`.

Event types emitted: `step_start`, `step_update`, `reasoning_delta`, `text_delta`, `clear_text`, `session_title`, `done`, `error`. Aborts cleanly when the client disconnects (`req.signal`).

### `GET /api/agents`
Agent Marketplace API proxy. Query params: `feed` (`all`|`leaderboard`|`trending`|`featured`|`latest`|`spotlight`|`category`), `category` (for category feed), `search` (free text), `limit`, `offset`. Returns `AgentsApiResponse` with `{ success, feed, items, total, fallback?, spotlight? }`. In-memory 60s TTL cache; falls back to local JSON snapshot on 8004scan failure.

> **Deployment:** API routes pin `preferredRegion = 'fra1'` and [`vercel.json`](../vercel.json) declares `regions: ["fra1"]` — keeping Vercel serverless functions on the Frankfurt cluster to avoid Binance's HTTP 451 geo-restriction on US-region IPs.

---

## 9. Conventions & Tooling (from [`AGENTS.md`](../AGENTS.md))

1. **Zero hardcoded theme values / UI text** — design tokens live in `src/app/globals.css` (e.g. `bg-theme-bg-surface`, `text-theme-brand-binance`, `p-spacing-md`); all copy lives in `src/constants/content/` (modular sidebar/chat/process/marketplace files exported as `APP_CONTENT`).
2. **Bun only** — `bun install`, `bun run dev`, `bun run build`, `bun run start`, `bun run lint`, `bun x tsc --noEmit`, `bun x oxlint`.
3. **TypeScript 7 strict + Oxlint** — zero `any` escapes; zero lint warnings/errors.
4. **Modular layering** — agent / lib / hooks / components / constants / stores clearly separated.
5. **Execution integrity** — authentic live data only; deterministic fallbacks derive from real exchange math, never synthetic prices.

### Environment variables (`.env.example`)
- `INFERENCE_PROVIDER` (`groq` | `fireworks`), `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BACKUP_MODEL`, `GROQ_REASONING_EFFORT`, `GROQ_MAX_TOKENS`.
- `FIREWORKS_API_KEY`, `FIREWORKS_MODEL`, `FIREWORKS_BACKUP_MODEL`, `FIREWORKS_REASONING_EFFORT`, `BACKUP_INFERENCE_PROVIDER`.
- `EXA_API_KEY` (news search), `NEXT_PUBLIC_BINANCE_MODE=simulation`, and optional x402 wallet placeholders.
- `BINANCE_SPOT_API_URL` / `BINANCE_FUTURES_API_URL` (optional custom cluster bases prepended to the failover pools).

---

*Generated from source analysis on the repository at `main`.*
