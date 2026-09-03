# Argus — Trading Assistant for Binance Agent OS

> **Intelligent, Data-Grounded Trading Assistant & Risk Guardian**  
> Built for the **Binance Agent OS Mini Hackathon — Track A ($20,000 USDC)**

---

## Overview

**Argus** is an approachable, high-performance trading assistant powered by **Binance Agent OS**. Unlike generic chatbots that hallucinate market data or execute trades blindly, Argus operates directly against real-time Binance spot market feeds and order books with built-in mathematical risk checks and automatic model failover.

Argus pairs ultra-fast inference with a clean, local-first interactive console—giving traders clear, actionable insights without unnecessary complexity or robotic theatrics.

---

## Key Capabilities & Architecture

### 1. High-Throughput Inference with Automatic Failover
* **Primary Model:** `qwen/qwen3.8-27b` — ultra-fast reasoning, strong tool-calling fidelity, and 128k context window.
* **Backup Model:** `openai/gpt-oss-120b` — automatically activated if the primary model encounters rate limits (HTTP 429) or capacity issues, ensuring uninterrupted chat availability.
* **Fluid Word-by-Word Streaming:** Powered by `smoothStream` (15ms delay, word-level chunking) to deliver a smooth, natural reading experience rather than erratic burst streaming.

### 2. Single-Turn Parallel Tool Execution
* Dispatches independent market queries concurrently in a single API round-trip.
* When asking for a coin's status, Argus simultaneously fetches ticker price, 24h market statistics, and live order book depth—reducing latency by up to 70%.

### 3. Dual-Adapter Architecture
Argus implements a unified `IBinanceAgentAdapter` interface supporting two execution environments:
* **Sandbox Mode (`simulation`):** Streams live, real-time Binance market feeds while operating an in-memory isolated sandbox wallet. Hackathon judges can evaluate trade analysis, order sizing, and executions with zero wallet deposits required.
* **Live MCP Mode (`live_mcp`):** Connects directly over Model Context Protocol (MCP) to the official Binance Agent OS endpoint (`https://agent.binance.com/mcp/agentic`).

### 4. Interactive Reasoning & Process Progression
* **Uncontained, Clean Timeline:** Transparently renders the agent's internal reasoning steps and tool calls without cluttered card containers or distracting dividers.
* **Live Step States:** Visual indicators for running, completed, and failed tool steps.
* **Inspectable Data:** Expandable drawers allow users to inspect exact tool arguments, raw JSON responses, and internal reasoning on demand.

### 5. Local-First Session Management
* Powered by **Dexie IndexedDB** for private, client-side conversation persistence.
* Supports creating new chats, switching between saved conversations, and inline chat renaming without page reloads.

### 6. Signature Executive Markdown Formatting
Argus outputs clean, easily scannable answers designed for fast decision-making:
* **Direct Lead:** 1–2 sentence immediate summary answering the user's intent.
* **Snapshot Tables:** Compact markdown tables comparing price, 24h range, volume, and spread.
* **Structured Breakdowns:** Grouped bullet points with bold descriptive lead anchors.
* **Grounded Takeaways:** A concise blockquote summary highlighting the bottom line.

---

## Technology Stack

* **Framework:** Next.js 16 (Turbopack, App Router, React 19)
* **Runtime & Package Manager:** Bun (`bun@1.4.0+`) exclusively
* **Language & Tooling:** TypeScript 7 (native Go compiler), Oxlint (`oxlint@1.81.0+`)
* **Styling:** Tailwind CSS v4 with Neo-Minimalist Architectural design tokens configured in `globals.css`
* **Agent Engine:** Vercel AI SDK (`ai@7`, `@ai-sdk/groq`, `@ai-sdk/mcp`)
* **Client Database:** Dexie IndexedDB (`dexie`, `dexie-react-hooks`)
* **Icons:** Lucide React

---

## Project Structure

```
src/
├── app/                  # Route boundaries, page layouts, and SSE API endpoints
│   ├── api/agent/chat/   # Server-Sent Events (SSE) streaming endpoint
│   ├── globals.css       # 15 theme tokens, typography, and spacing variables
│   └── page.tsx          # Single-page cockpit deck with mode toggle & chat
├── components/           # Presentation UI components
│   └── (dashboard)/
│       ├── chat/         # ChatWindow, ChatMessage, ProcessTimeline, SessionsMenu
│       ├── argus-icon.tsx# Brand SVG icon
│       └── markdown-view.tsx # Custom GFM renderer with styled tables & code blocks
├── constants/            # Centralized UI copy, tool labels, and quick prompts
├── hooks/                # Custom React hooks (useAgentChat, useExecutionMode)
├── lib/
│   ├── agents/           # Client-side SSE stream transport and chat history helpers
│   ├── binance-mcp/      # Simulation adapter and live MCP client
│   ├── db/               # Dexie IndexedDB schema, queries, and step normalizers
│   ├── risk-engine/      # Deterministic mathematical risk evaluation functions
│   ├── types/            # Shared domain types and Zod runtime schemas
│   └── utils.ts          # Pure utility helpers
└── agent/                # Core AI agent engine
    ├── engine.ts         # Multi-step streaming loop with rate-limit failover
    ├── prepare-invocation.ts # Model binding, tool configuration, and prompt assembly
    ├── providers.ts      # Groq model providers (primary & backup)
    ├── title-stream-filter.ts # Stream interceptor preventing raw XML tag leakage
    ├── tools.ts          # Binance MCP tool definitions with Zod schemas
    ├── prompts.ts        # System prompts and ChatGPT-style formatting guidelines
    └── types.ts          # Agent result, step, and stream event interfaces
```

---

## Engineering & Design Standards

Argus follows strict engineering rules defined in [`AGENTS.md`](./AGENTS.md):
1. **Zero Hardcoded Design Tokens:** All colors, font sizes, weights, and spacing use strict CSS variables (`--theme-*`, `--text-*`, `--spacing-*`).
2. **Zero Hardcoded UI Text:** User-facing strings and error messages reside in `src/constants/content.ts`.
3. **Bun Only:** All scripts, dependencies, and tools are run via `bun` (`bun add`, `bun run dev`, `bun x tsc`).
4. **TS7 & Oxlint:** Clean type checking (`bun x tsc --noEmit`) and linting (`bun run lint`) with 0 errors and 0 warnings.
5. **Human Language:** Conversational, approachable tone with zero military or robotic fluff.
6. **Parallel Execution:** Tools and file operations are batched concurrently in single operations.

---

## Quick Start Guide

### Prerequisites
* [Bun](https://bun.sh/) `v1.4.0` or higher
* A [Groq API Key](https://console.groq.com/keys)

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
# Groq Inference API Key
GROQ_API_KEY=gsk_your_groq_api_key_here

# Primary Model (Ultra-fast, tool calling)
GROQ_MODEL=qwen/qwen3.8-27b

# Backup Model (Automatic failover on rate limits)
GROQ_BACKUP_MODEL=openai/gpt-oss-120b

# Reasoning Effort: 'none' | 'low' | 'medium' | 'high'
GROQ_REASONING_EFFORT=high

# Execution Mode: 'simulation' | 'live_mcp'
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
