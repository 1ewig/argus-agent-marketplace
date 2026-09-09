# Agent Advantage Report — Evidence Capture Checklist

> For: TermiX Challenge — `docs/termix-agent-advantage-report.md`
> Method: run each task **with the Argus Trading Desk agent** (live, at https://argus-bnb-build-the-era.vercel.app) vs **without** (manual, direct public tools).

## Rules for every run

1. **Fresh session per task.** Click "New Chat" before starting each prompt — every run starts cold, no prior context.
2. **Time yourself.** Start the stopwatch the moment you paste the prompt (press Enter), stop it the moment the final answer finishes streaming.
3. **Capture the full chat.** Use the browser screenshot tool (full page) or export. Save to `docs/evidence/`.
4. **Count the numbers.** The agent attaches live tool cards (price, order book, funding, etc.) — keep them visible in the screenshot; they are the proof the data is live.
5. Record date + approximate UTC time of each run in the run log below.

---

## Run Log

| Run # | Task | Prompt (id) | Date | UTC time | Wall time (s) | Screenshot/file |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | Full BTCUSDT desk analysis | T1 | 2026-09-09 | 12:14:00Z | 11.0 s | [`docs/evidence/live-desk-btcusdt-analysis.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/live-desk-btcusdt-analysis.webp) |
| 2 | ERC-8004 due diligence (Venus/HeyAnon #43129) | T2 | 2026-09-09 | 12:15:00Z | 14.0 s | [`docs/evidence/agent-due-diligence-venus-heyano.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/agent-due-diligence-venus-heyano.webp) |
| 3 | Best live yield on BSC | T3 | 2026-09-09 | 12:16:00Z | 15.0 s | [`docs/evidence/yield-research-funding-rates.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/yield-research-funding-rates.webp) |

---

## T1 — Full BTCUSDT desk analysis (trading)

> The agent must pull current price, 24h change/volume, spread + order book depth/imbalance, funding rate, open interest, and top-trader long/short skew — then synthesize a 3-bullet actionable read.

**Paste this exact prompt:**

```
Run a full live desk analysis on BTCUSDT right now. Report: current price, 24h change and volume, best bid/ask and spread, order book depth imbalance, funding rate, open interest, and top-trader long/short skew. End with a 3-bullet actionable summary. Use live tool calls for every number.
```

**Check the agent used** (open the "Tools used" accordion):
- `get_ticker_price`, `get_24h_stats`, `get_order_book`, `get_funding_rate`, `get_open_interest`, `get_top_long_short_ratio`

---

## T2 — ERC-8004 due diligence (security/risk)

> The agent must inspect the live onchain telemetry of a real registered agent and cross-check external news, then give a risk verdict.

**Paste this exact prompt:**

```
Do due diligence on the ERC-8004 agent "Venus powered by HeyAnon" (token ID 43129) on BNB Smart Chain. Pull its onchain telemetry: total score, health factor, owner, contract verification, and supported protocols. Then search recent security and protocol news about Venus Protocol. End with a clear risk verdict and whether you would delegate funds to it.
```

**Check the agent used:**
- `get_agent_telemetry`, `search_crypto_news`

---

## T3 — Best live yield on BSC (yield research)

> The agent must scan live funding conditions and surface top-ranked real ERC-8004 yield + health agents, then recommend where to allocate.

**Paste this exact prompt:**

```
Research the best live yield opportunities on BNB Smart Chain right now. Check current funding rates on leading perpetuals and find the top-ranked Yield & Staking and Health Factor ERC-8004 agents on the registry. Recommend where to allocate and why, using only live data.
```

**Check the agent used:**
- `get_funding_rate`, `search_agent_marketplace`

---

## Attached Evidence
- `docs/evidence/live-desk-btcusdt-analysis.webp` — Task 1 agent output (live tool timeline & structured desk snapshot)
- `docs/evidence/agent-due-diligence-venus-heyano.webp` — Task 2 agent output (on-chain registry telemetry & protocol security)
- `docs/evidence/yield-research-funding-rates.webp` — Task 3 agent output (multi-perp funding sweep & top yield agents)