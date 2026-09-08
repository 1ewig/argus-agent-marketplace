import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DATA_DIR,
  REQUIRED_CATEGORIES,
  MIN_AGENTS_PER_REQUIRED_CATEGORY,
  MAX_FAILURE_RATE,
} from "./config";
import { requestLog } from "./8004scan-client";
import type { AgentCompact, CategoryBuckets, QualityGateReport } from "./types";

export function evaluateQualityGates(
  compact: AgentCompact[],
  byCategory: CategoryBuckets,
  failureRate: number,
): QualityGateReport {
  const duplicates =
    compact.length - new Set(compact.map((a) => a.agent_id)).size;

  return {
    generated_at: new Date().toISOString(),
    total_agents: compact.length,
    duplicates,
    request_stats: {
      total: requestLog.total,
      failures: requestLog.entries.length,
      failure_rate: Number(failureRate.toFixed(3)),
      failures_detail: requestLog.entries.slice(0, 20),
    },
    category_counts: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, v.length]),
    ),
    quality_gates: {
      all_required_categories_min_15: REQUIRED_CATEGORIES.every(
        (c) => byCategory[c].length >= MIN_AGENTS_PER_REQUIRED_CATEGORY,
      ),
      no_duplicate_agent_ids: duplicates === 0,
      failure_rate_under_30pct: failureRate < MAX_FAILURE_RATE,
    },
  };
}

export async function saveArtifacts(
  compact: AgentCompact[],
  byCategory: CategoryBuckets,
  report: QualityGateReport,
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  const outPath = join(DATA_DIR, "agents-bsc.json");
  await writeFile(outPath, JSON.stringify(compact, null, 2));
  console.log(`\nSaved: ${outPath}`);

  const catPath = join(DATA_DIR, "agents-by-category.json");
  await writeFile(
    catPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        counts: Object.fromEntries(
          Object.entries(byCategory).map(([k, v]) => [k, v.length]),
        ),
        agents: Object.fromEntries(
          Object.entries(byCategory).map(([k, v]) => [k, v.slice(0, 30)]),
        ),
      },
      null,
      2,
    ),
  );
  console.log(`Saved: ${catPath}`);

  const reportPath = join(DATA_DIR, "fetch-report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`Saved: ${reportPath}`);
}

export function printExecutionSummary(
  compact: AgentCompact[],
  byCategory: CategoryBuckets,
  report: QualityGateReport,
): void {
  console.log("\n--- Category coverage ---");
  for (const [cat, agents] of Object.entries(byCategory)) {
    if (cat === "uncategorized") continue;
    const tag = REQUIRED_CATEGORIES.includes(
      cat as (typeof REQUIRED_CATEGORIES)[number],
    )
      ? "*"
      : " ";
    console.log(`  ${tag} ${cat.padEnd(14)} ${String(agents.length).padStart(4)}`);
  }
  console.log(
    `    uncategorized  ${String(byCategory.uncategorized.length).padStart(4)}`,
  );

  console.log(
    `\nFailure rate: ${(report.request_stats.failure_rate * 100).toFixed(1)}% (${requestLog.entries.length}/${requestLog.total} requests)`,
  );
  for (const [name, passed] of Object.entries(report.quality_gates)) {
    console.log(`  gate ${passed ? "PASS" : "FAIL"}: ${name}`);
  }

  console.log("\nTop 10 by score:");
  for (const a of compact.slice(0, 10)) {
    const cats = a.categories.length ? a.categories.join(",") : "-";
    console.log(
      `  ${String(a.total_score).padStart(6)} | ${(a.name ?? "unnamed").slice(0, 40).padEnd(40)} | ${cats}`,
    );
  }
}
