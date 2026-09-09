# Agent Advantage Report — Argus Agent Marketplace

**Project:** [Argus — Autonomous AI Agent Marketplace & Trading Desk](https://argus-ai-agent-hackathon.vercel.app)
**Challenge:** TermiX Partner Track — BNB Chain "Build the Era" Hackathon
**Prepared:** Sep 9, 2026
**Team:** <placeholder>
**Contact:** <placeholder>

---

## The question TermiX asked

> Does hiring an agent on your marketplace beat doing the job yourself, and can you prove it?

This report proves it with numbers. Three real tasks, run two ways each:

- **With agent** — the same task executed through the Argus Trading Desk (hiring an ERC-8004 agent surface / the autonomous analysis layer of the marketplace).
- **Without agent** — the task done manually by a human using the same underlying public data sources, directly, with no assistant.

For each task we report **time**, **cost**, and **output quality**, and attach the actual outputs.

---

## Method

**Agent under test:** Argus Trading Desk (live at argus-ai-agent-hackathon.vercel.app), running the marketplace's autonomous analysis layer. Model: `accounts/fireworks/models/deepseek-v4-flash-0731` (Fireworks AI serverless). It retrieves every number through live tool calls against Binance public market data, Exa AI web search, and the 8004scan ERC-8004 registry — a hard "no speculation before live tools" rule enforced in its system prompt.

**Model pricing used for the cost column** (Fireworks AI serverless, public rate card, Sep 2026):

| Rate | Value |
| :-- | :-- |
| Input | $0.14 / 1M tokens |
| Output | $0.28 / 1M tokens |

Cost per agent run is derived from the tool-call step timeline exposed in the chat (tokens × rate). Tool calls to Binance / 8004scan / Exa are free public endpoints. Manual runs have zero token cost but are billed at the operator's time cost (reported separately as wall time).

**Timing:** wall-clock from first input to final output. Agent runs are measured end-to-end including tool-call latency; manual runs include navigation, query construction, and consolidation.

**Quality rubric** (1–5 each, sum = total, /20):
1. **Accuracy** — every figure checked against the live source at the time of the run.
2. **Completeness** — all requested dimensions covered (no missing columns, no "can't check" gaps).
3. **Structure** — output is immediately usable: sections, summary, and a decision recommendation.
4. **Actionability** — a non-expert could act on it without extra research.

---

## Task 1 — Full BTCUSDT desk analysis *(trading category, required)*

**Prompt (with agent):**
> Run a full live desk analysis on BTCUSDT right now. Report current price, 24h change and volume, best bid/ask and spread, order book depth imbalance, funding rate, open interest, and top-trader long/short skew. End with a 3-bullet actionable summary. Use live tool calls for every number.

**Manual baseline scope:** a trader pulled the same values directly from Binance public endpoints (ticker, 24h stats, order book, funding rate, open interest, long/short ratio) and wrote the summary by hand.

| Metric | With agent | Without agent |
| :-- | :-- | :-- |
| Wall time | <to be filled> | <to be filled> |
| Cost | < to be filled from token timeline> | $0.00 (manual) |
| Accuracy (/5) | | |
| Completeness (/5) | | |
| Structure (/5) | | |
| Actionability (/5) | | |
| **Total quality (/20)** | | |

**Output (with agent):** <attach screenshot — `docs/evidence/t1-agent.png`> or transcribe below.
**Output (without agent):** <attach manual baseline — see below>.

---

## Task 2 — ERC-8004 due diligence *(security category, required)*

Subject: real registered agent `Venus powered by HeyAnon` (#43129) on BNB Smart Chain.

**Prompt (with agent):**
> Do due diligence on the ERC-8004 agent "Venus powered by HeyAnon" (token ID 43129) on BNB Smart Chain. Pull its onchain telemetry: total score, health factor, owner, contract verification, and supported protocols. Then search recent security and protocol news about Venus Protocol. End with a clear risk verdict.

**Manual baseline scope:** a user browsed 8004scan.io and BscScan for the agent, then ran a web search for Venus Protocol news, and formed a verdict by hand.

| Metric | With agent | Without agent |
| :-- | :-- | :-- |
| Wall time | <to be filled> | <to be filled> |
| Cost | <to be filled> | $0.00 (manual) |
| **Total quality (/20)** | | |

**Output (with agent):** <attach screenshot — `docs/evidence/t2-agent.png`>.
**Output (without agent):** <attach manual baseline notes>.

---

## Task 3 — Best live yield on BNB Smart Chain *(trading/yield category)*

**Prompt (with agent):**
> Research the best live yield opportunities on BNB Smart Chain right now. Check current funding rates on leading perpetuals and find the top-ranked Yield & Staking and Health Factor ERC-8004 agents on the registry. Recommend where to allocate and why, using only live data.

**Manual baseline scope:** a user scanned funding rates on Binance futures and manually browsed 8004scan for top yield/health agents, then wrote allocation notes.

| Metric | With agent | Without agent |
| :-- | :-- | :-- |
| Wall time | <to be filled> | <to be filled> |
| Cost | <to be filled> | $0.00 (manual) |
| **Total quality (/20)** | | |

**Output (with agent):** <attach screenshot — `docs/evidence/t3-agent.png`>.
**Output (without agent):** <attach manual baseline notes>.

---

## Summary

| Task | Category | Time (agent) | Time (manual) | Cost (agent) | Cost (manual) | Quality (agent) | Quality (manual) |
| :-- | :-- | --: | --: | --: | --: | --: | --: |
| 1. BTCUSDT desk analysis | Trading | | | | $0.00 | /20 | /20 |
| 2. ERC-8004 DD | Security | | | | $0.00 | /20 | /20 |
| 3. BSC yield scan | Trading/Yield | | | | $0.00 | /20 | /20 |

**Headline:** <to be filled once data lands>.

---

## Attachments

- `docs/evidence/t1-agent.png` — Task 1 agent output (live tool cards + analysis)
- `docs/evidence/t2-agent.png` — Task 2 agent output
- `docs/evidence/t3-agent.png` — Task 3 agent output
- Manual baseline data — <to be added>

---

## Caveats & honesty notes

- The marketplace's *hiring/escrow* execution layer is a zero-capital sandbox (`simBNB`); **this report measures the marketplace's autonomous analysis agent**, which operates on live production data. We do not present simulated trade outcomes as real.
- Cost figures exclude the free public tool calls (Binance/8004scan/Exa); if the "alternative" is a paid analyst or a heavier model, comparable costs would favor the agent.
- All timings are wall-clock and include streaming latency.