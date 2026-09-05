### The 3-Pane Workstation Architecture

```
┌──────────────────┬─────────────────────────────────┬───────────────────────────────┐
│  LEFT SIDEBAR    │      CENTER: AGENT CHAT         │     RIGHT PANEL: WORKSPACE    │
│                  │                                 │     INTELLIGENCE DECK         │
├──────────────────┼─────────────────────────────────┼───────────────────────────────┤
│ • Symbol Switcher│ [SOL/USDT Workspace]            │ [LIVE TELEMETRY]              │
│   (Search all    │ Active Session: "Breakout Check"│ • Live Price: $148.20 (+3.4%) │
│    USDT pairs)   │                                 │ • 20-level Depth Imbalance    │
│                  │ User: "Check the 15m order book"│ • Funding Rate & Next Reset   │
│ • Pinned Symbols │                                 │                               │
│   BTC, ETH, SOL  │ Argus: "Bid wall defending..."  │ [ISOLATED AI MODULES (JSON)]  │
│                  │                                 │ • 🎯 Quant Signal & Key Levels│
│ • Workspace Chats│                                 │ • 📰 Catalyst & News Radar    │
│   - Session 1    │                                 │ • 🛡️ Liquidity & Risk Sentinel│
│   - Session 2    │                                 │                               │
│                  │ [Input: Ask Argus about SOL...] │ [ ↻ Refresh AI Analysis ]     │
└──────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

---

### Detailed Breakdown of the Components

#### 1. Symbol Catalog & Local Caching
* **Source:** A single call to `https://api.binance.com/api/v3/exchangeInfo` or `https://api.binance.com/api/v3/ticker/24hr` pulls all **active USDT spot pairs** (with 24h volume, base asset, and quote asset).
* **Storage:** Cached in local storage or Dexie IndexedDB (`workspace_catalog`), revalidated once every 24 hours.
* **UX:** A Command-K style symbol search bar with instant fuzzy filtering (e.g. typing "SOL" instantly selects `SOLUSDT` with 24h volume and price badge).

#### 2. Workspace & Session Data Model (in Dexie IndexedDB)
* **Workspace:** Stored by symbol (e.g. `symbol: "SOLUSDT"`, `pinned: true`, `lastVisited: timestamp`).
* **Sessions:** One-to-many relationship (`workspaceSymbol: "SOLUSDT"`, `sessionId: "...", title: "..."`).
* Selecting a symbol opens that symbol’s workspace and loads its active chat history while keeping previous conversations preserved.

#### 3. Right-Side Workspace Deck: Two Distinct Layers

##### Layer A: Live Telemetry Widgets (Pure Binance Public REST / SWR)
* **Real-time Price & 24h Ticker:** High, Low, Volume, % change.
* **Order Book Depth Barometer:** Visual bid vs. ask depth ratio from `get_order_book`.
* **Funding & Sentiment Meter:** Real-time perpetual funding rate APR and open interest.

##### Layer B: Isolated Sidecar AI Agents (Structured JSON Output)
These run via dedicated lightweight endpoints that invoke specific tools and enforce **strict Zod JSON schemas** (using `generateObject` from Vercel AI SDK):

1. **🎯 Tactical Signal & Key Levels Agent:**
   * Runs `get_klines` + `get_order_book` + `get_average_price`.
   * **JSON Schema:**
     ```ts
     {
       bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH',
       confidenceScore: number, // 0 - 100
       supportLevel: number,
       resistanceLevel: number,
       vwapDeviation: string,
       orderBookPressure: 'BID_HEAVY' | 'ASK_HEAVY' | 'BALANCED',
       summary: string
     }
     ```
   * **UI:** A signal badge, confidence gauge, and key price levels.

2. **📰 Catalyst & News Radar Agent:**
   * Runs `search_crypto_news` via Exa AI.
   * **JSON Schema:**
     ```ts
     {
       overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
       sentimentScore: number,
       topCatalysts: Array<{ title: string; url: string; date: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }>,
       upcomingEvents: string[]
     }
     ```
   * **UI:** Clickable catalyst pills with impact badges and source links.

3. **🛡️ Liquidity & Risk Sentinel Agent:**
   * Evaluates slippage risks for standard trade sizes ($5k, $25k) and liquidation heat.
   * **JSON Schema:**
     ```ts
     {
       slippageTier: 'MINIMAL' | 'MODERATE' | 'HIGH',
       estimatedSlippage10k: number,
       fundingCostImpact: 'FAVORABLE' | 'EXPENSIVE' | 'NEUTRAL',
       volatilityRisk: 'LOW' | 'MEDIUM' | 'HIGH'
     }
     ```

---

### Why Judges Will Love This for Track A
* **It looks and feels like a professional product:** Not just another single-column chat clone, but an integrated trading dashboard.
* **Clear separation of concerns:** Interactive multi-turn chat in the center; deterministic live feeds and autonomous structured AI analysis on the side.
* **Parallel background intelligence:** The user can be typing a question in chat while the background agents refresh news sentiment and quant signals in the right panel.
* **Strict JSON Schemas:** Using `generateObject` with Zod guarantees zero markdown formatting glitches in the telemetry panel.

---

### How We Can Roll This Out Step-by-Step

1. **Step 1: Data Model & Symbol Catalog**
   * Fetch and cache all Binance USDT pairs via `fetchBinanceExchangeInfo()`.
   * Update Dexie schema to support `workspaces` (keyed by symbol) with associated `sessions`.
2. **Step 2: Workstation Layout (3-Pane Shell)**
   * Add a Symbol Picker in the header/sidebar.
   * Build the Right-Side Workspace Deck container (collapsible on smaller viewports).
3. **Step 3: Live Telemetry in Right Panel**
   * Embed real-time price, 20-level order book depth imbalance, and funding stats for the active symbol.
4. **Step 4: The Isolated Sidecar AI Endpoints & Widgets**
   * Create dedicated API endpoints using `generateObject` for:
     * Quant Signal & Key Levels
     * News & Catalyst Radar
   * Render them as interactive cards with a manual "Run Analysis" / "Refresh" trigger.