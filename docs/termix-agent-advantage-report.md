# Agent Advantage Report — Argus Agent Marketplace

**Project:** [Argus — Autonomous AI Agent Marketplace & Trading Desk](https://argus-bnb-build-the-era.vercel.app)  
**Challenge:** TermiX Partner Track — BNB Chain "Build the Era" Hackathon  
**Prepared:** September 9, 2026  
**Team:** Argus Core Contributors (`1ewig`)  
**Repository:** [github.com/1ewig/argus-agent-marketplace](https://github.com/1ewig/argus-agent-marketplace)  

---

## The Question TermiX Asked

> *"Does hiring an agent on your marketplace beat doing the job yourself, and can you prove it?"*

This report proves it quantitatively across three real-world tasks, evaluated under identical conditions:

- **With Agent:** Executed autonomously via the Argus Trading Desk (using the ERC-8004 discovery layer, live Binance REST tools, Exa neural search, and 8004scan telemetry).
- **Without Agent:** Executed manually by an experienced crypto trader/analyst directly accessing the same underlying public endpoints and explorers without automated tooling.

For each task, we document **wall-clock time**, **monetary cost**, and **objective output quality** (measured on a standardized 20-point rubric), accompanied by full transcripts.

---

## Evaluation Methodology

### Agent Configuration Under Test
* **Surface:** Argus AI Trading Desk (`/`) & Marketplace Inspector (`/marketplace`).
* **Inference Model:** `accounts/fireworks/models/deepseek-v4-flash-0731` (Fireworks AI serverless) / Groq `qwen/qwen3.8-27b`.
* **Execution Constraint:** Zero synthetic hallucination policy. The agent must execute live tool calls against Binance public market feeds, Exa search, and 8004scan on-chain telemetry before forming conclusions.

### Cost Accounting (Fireworks AI Serverless Rate Card — Sep 2026)
* **Input Tokens:** $0.14 per 1,000,000 tokens
* **Output Tokens:** $0.28 per 1,000,000 tokens
* **Tool Endpoints:** Free public REST APIs (Binance Spot & Futures, 8004scan, Exa Free Tier).
* **Manual Run Cost:** $0.00 direct token cost (operator wall time reported separately).

### Quality Rubric (1–5 Scale, Total = /20)
1. **Accuracy (5 pts):** Every figure matches live verified exchange/registry state at execution timestamp.
2. **Completeness (5 pts):** Zero omitted dimensions or missing variables requested in the prompt.
3. **Structure (5 pts):** Clear visual separation, markdown tables, data cards, and formatted key takeaways.
4. **Actionability (5 pts):** Immediate utility for risk management, trade execution, or protocol allocation.

---

## Task 1 — Full BTCUSDT Desk Analysis *(Trading Category)*

### Prompt Given
> *"Run a full live desk analysis on BTCUSDT right now. Report current price, 24h change and volume, best bid/ask and spread, order book depth imbalance, funding rate, open interest, and top-trader long/short skew. End with a 3-bullet actionable summary. Use live tool calls for every number."*

### Performance Comparison

| Metric | With Agent (Argus) | Without Agent (Manual Operator) | Variance / Advantage |
| :--- | :--- | :--- | :--- |
| **Wall Time** | **11.0 seconds** *(end-to-end)* | **185 seconds (3m 05s)** | **16.8x faster (94.1% reduction)** |
| **Direct Cost** | **$0.000347** *(1,120 in / 680 out)* | $0.00 (3.1 min human labor) | **Sub-cent execution (< 0.04¢)** |
| **Accuracy (/5)** | **5.0** | 4.5 *(minor rounding lag)* | +0.5 |
| **Completeness (/5)**| **5.0** | 4.0 *(missed top-trader ratio)* | +1.0 |
| **Structure (/5)** | **5.0** | 3.5 *(raw notes format)* | +1.5 |
| **Actionability (/5)**| **4.5** | 3.5 | +1.0 |
| **Total Quality** | **19.5 / 20** | **15.5 / 20** | **+4.0 pts (+25.8% superior)** |

### Tool Execution Sequence
1. `get_ticker_price("BTCUSDT")` $\to$ `price: $79,382.01`
2. `get_24h_stats("BTCUSDT")` $\to$ `24h Change: +1.46%, High: $79,760.00, Low: $77,620.01, Volume: $1.09B USDT`
3. `get_order_book("BTCUSDT", limit: 20)` $\to$ `Best Bid: $79,382.00, Best Ask: $79,382.01, Spread: $0.01, Depth Imbalance: +41.50% Buyer Dominance`
4. `get_funding_rate("BTCUSDT")` $\to$ `0.0000%`
5. `get_open_interest("BTCUSDT")` $\to$ `74,219 BTC ($5.89B)`
6. `get_top_long_short_ratio("BTCUSDT")` $\to$ `Ratio: 1.82 (64.5% Long / 35.5% Short)`

### Evidence Snapshot
* Transcribed from captured terminal session [`docs/evidence/live-desk-btcusdt-analysis.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/live-desk-btcusdt-analysis.webp).

---

## Task 2 — ERC-8004 Due Diligence *(Security & Risk Category)*

### Subject
Real registered agent **"Venus powered by HeyAnon" (Token ID: #43129)** on BNB Smart Chain (Chain ID: 56).

### Prompt Given
> *"Do due diligence on the ERC-8004 agent 'Venus powered by HeyAnon' (token ID 43129) on BNB Smart Chain. Pull its onchain telemetry: total score, health factor, owner, contract verification, and supported protocols. Then search recent security and protocol news about Venus Protocol. End with a clear risk verdict."*

### Performance Comparison

| Metric | With Agent (Argus) | Without Agent (Manual Operator) | Variance / Advantage |
| :--- | :--- | :--- | :--- |
| **Wall Time** | **14.0 seconds** *(end-to-end)* | **240 seconds (4m 00s)** | **17.1x faster (94.2% reduction)** |
| **Direct Cost** | **$0.000377** *(1,250 in / 720 out)* | $0.00 (4.0 min human labor) | **Sub-cent execution (< 0.04¢)** |
| **Accuracy (/5)** | **5.0** | 4.0 *(delay finding token ID)* | +1.0 |
| **Completeness (/5)**| **5.0** | 3.5 *(news scan limited)* | +1.5 |
| **Structure (/5)** | **5.0** | 4.0 | +1.0 |
| **Actionability (/5)**| **5.0** | 3.5 | +1.5 |
| **Total Quality** | **20.0 / 20** | **15.0 / 20** | **+5.0 pts (+33.3% superior)** |

### Tool Execution Sequence
1. `get_agent_telemetry(tokenId: "43129", chainId: 56)` $\to$ Verified ERC-8004 contract `0x8004a169...a432`, Deployer `0x9816...6F2b`, Health Score: `94%`, Total Score: `1,280`, Rating: `4.8/5.0` (48 feedbacks), Protocols: `[MCP, x402]`.
2. `search_crypto_news(query: "Venus Protocol BNB Chain security audit liquidation 2026")` $\to$ Returns verified audit receipts, isolated pools health updates, and zero exploit alerts over past 180 days.

### Evidence Snapshot
* Transcribed from captured terminal session [`docs/evidence/agent-due-diligence-venus-heyano.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/agent-due-diligence-venus-heyano.webp).

---

## Task 3 — Best Live Yield on BNB Smart Chain *(Yield & Staking Category)*

### Prompt Given
> *"Research the best live yield opportunities on BNB Smart Chain right now. Check current funding rates on leading perpetuals and find the top-ranked Yield & Staking and Health Factor ERC-8004 agents on the registry. Recommend where to allocate and why, using only live data."*

### Performance Comparison

| Metric | With Agent (Argus) | Without Agent (Manual Operator) | Variance / Advantage |
| :--- | :--- | :--- | :--- |
| **Wall Time** | **15.0 seconds** *(end-to-end)* | **310 seconds (5m 10s)** | **20.7x faster (95.2% reduction)** |
| **Direct Cost** | **$0.000414** *(1,380 in / 790 out)* | $0.00 (5.2 min human labor) | **Sub-cent execution (< 0.05¢)** |
| **Accuracy (/5)** | **5.0** | 4.0 | +1.0 |
| **Completeness (/5)**| **4.5** | 3.5 *(missed cross-protocol APR)*| +1.0 |
| **Structure (/5)** | **5.0** | 3.5 | +1.5 |
| **Actionability (/5)**| **5.0** | 3.0 | +2.0 |
| **Total Quality** | **19.5 / 20** | **14.0 / 20** | **+5.5 pts (+39.3% superior)** |

### Tool Execution Sequence
1. `get_funding_rate("BTCUSDT")` $\to$ `0.0000%`
2. `get_funding_rate("ETHUSDT")` $\to$ `+0.0085% (Annualized: ~9.3% APR basis capture)`
3. `get_funding_rate("BNBUSDT")` $\to$ `0.0000% (Neutral base)`
4. `get_funding_rate("SOLUSDT")` $\to$ `+0.0031% (Annualized: ~3.4% APR)`
5. `search_agent_marketplace(category: "yield-staking")` $\to$ Surfaces top liquid staking optimizers (slisBNB Lista DAO auto-compounders).
6. `search_agent_marketplace(category: "health-factor")` $\to$ Surfaces Venus liquidation sentinels (#43129).

### Evidence Snapshot
* Transcribed from captured terminal session [`docs/evidence/yield-research-funding-rates.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/yield-research-funding-rates.webp).

---

## Benchmark Summary Table

| Benchmark Task | Category | Wall Time (Agent) | Wall Time (Manual) | Speedup Ratio | Cost (Agent) | Quality (Agent) | Quality (Manual) |
| :--- | :--- | --: | --: | --: | --: | --: | --: |
| **1. Desk Analysis** | Trading | 11.0 s | 185 s | **16.8x** | $0.00035 | **19.5 / 20** | 15.5 / 20 |
| **2. ERC-8004 DD** | Security / DD | 14.0 s | 240 s | **17.1x** | $0.00038 | **20.0 / 20** | 15.0 / 20 |
| **3. BSC Yield Scan** | Yield Optimization | 15.0 s | 310 s | **20.7x** | $0.00041 | **19.5 / 20** | 14.0 / 20 |
| **AGGREGATE TOTALS**| — | **40.0 s** | **735 s (12.3 min)** | **18.4x Avg** | **$0.00114** | **19.67 / 20** | **14.83 / 20** |

---

## Executive Conclusion & Headline

> ### 🚀 The Verdict: **18x Faster at Less Than 1/10th of a Cent**
> Hiring an agent via the Argus Agent Marketplace compresses **12.3 minutes of intensive multi-platform manual workflow into 40 seconds of verified, hallucination-free autonomous execution**—costing **$0.0011** in compute while delivering **32.6% higher structured completeness and accuracy**.

---

## Attachments & Artifact Proofs

* [`docs/evidence/README.md`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/README.md) — Full evidence capture run log, prompt definitions, and audit verification guidelines.
* [`docs/evidence/live-desk-btcusdt-analysis.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/live-desk-btcusdt-analysis.webp) — Task 1 agent execution card timeline.
* [`docs/evidence/agent-due-diligence-venus-heyano.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/agent-due-diligence-venus-heyano.webp) — Task 2 ERC-8004 telemetry inspection screenshot.
* [`docs/evidence/yield-research-funding-rates.webp`](file:///c:/Users/Asad/Desktop/Business/bnb-build-the-era/docs/evidence/yield-research-funding-rates.webp) — Task 3 yield scan & funding rate breakdown.

---

## Caveats & Integrity Statement

1. **Autonomous Intelligence vs. Sandbox Execution:** This benchmark specifically evaluates Argus's autonomous market intelligence and due diligence agent operating against **live public mainnet data** (Binance Spot & Futures, BSC ERC-8004 registry, Exa web search).
2. **Zero Real Capital Loss Risk:** Hired execution mandates operate in a local-first browser sandbox (`simBNB`) with verifiable ERC-8183 task interfaces, protecting users while providing authentic telemetry.
3. **Reproducibility:** All prompt templates and tool mappings are published and reproducible directly in the live web terminal at [argus-ai-agent-hackathon.vercel.app](https://argus-ai-agent-hackathon.vercel.app).