# Argus — Engineering Guidelines

Core rules for AI coding agents working in this repository:

---

### 1. Zero Hardcoded Theme Values & UI Text
* **Design Tokens:** Never hardcode raw hex codes, RGB, HSL, or magic pixel values in JSX or styles. Always use semantic design tokens and Tailwind utility classes defined in `src/app/globals.css` (e.g. `bg-theme-bg-surface`, `text-theme-brand-binance`, `p-spacing-md`).
* **Centralized Copy:** Never place arbitrary hardcoded strings in JSX. Store all user-facing labels, headings, error messages, and descriptions in `src/constants/content/`.

---

### 2. Bun Runtime & Package Management
* **Bun Only (`bun@1.4.0+`):** Never run or suggest `npm`, `pnpm`, `yarn`, or `npx`.
* Use Bun equivalents: `bun add <pkg>`, `bun run dev`, `bun run build`, `bun run lint`, `bun x tsc --noEmit`, `bun x oxlint`.

---

### 3. Tooling Standards: TS7 & Oxlint
* **TypeScript 7:** Strict type-checking via `bun x tsc --noEmit`. No untyped `any` escapes.
* **Oxlint:** Repository linter via `bun run lint`. Maintain zero warnings and zero errors.

---

### 4. Clear Separation of Concerns & Modular Architecture
Respect existing project conventions and modular layers:
* **`src/agent/`:** AI reasoning engine, prompt assembly, and AI SDK tool definitions.
* **`src/lib/`:** External clients (live Binance REST endpoints, Exa search), Dexie IndexedDB persistence, and Zod schemas.
* **`src/hooks/`:** Specialized reactive hooks for stream handling, sessions, and scroll orchestration.
* **`src/components/`:** Pure presentation components decoupled from streaming transports.
* **`src/constants/`:** Centralized UI text (`content.ts`) and Framer Motion animation tokens (`animation.ts`).
* **`src/stores/`:** Minimal persisted global UI state via Zustand.

---

### 5. Execution Integrity & Tone
* **Authentic Data Only:** Query live Binance public feeds and Exa AI search. Never generate synthetic fallback prices or mock market stats.
* **Natural Language:** Speak like an approachable, insightful colleague. Avoid pseudo-military or robotic jargon.

---

### 6. Parallel Execution & Tool Call Efficiency
* **Batch Independent Operations:** Always group independent file reads, edits, and searches into a single message with multiple tool calls. Never serialize operations that have no dependencies on each other.
* **Parallel Reads:** When exploring a codebase or reviewing multiple files, launch all `Read`, `Glob`, and `Grep` calls simultaneously in one response.
* **Parallel Writes:** When editing multiple independent files (e.g. updating imports across a component group), issue all `Edit` calls in a single message.
* **Parallel Verification:** Run `bun run lint` and `bun x tsc --noEmit` concurrently — never sequentially.
* **Minimize Round-Trips:** Each serialized tool call costs an API round-trip. A single message with 5 parallel calls is always preferred over 5 sequential messages with 1 call each.
