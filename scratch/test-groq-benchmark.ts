/**
 * Benchmark Script for Groq Models
 * Measures Time To First Token (TTFT), Generation Tokens Per Second (TPS),
 * and End-to-End Latency using streaming SSE.
 * 
 * Run with: bun run scratch/test-groq-benchmark.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 1. Manually parse .env.local if not already in process.env
if (existsSync(resolve(process.cwd(), '.env.local'))) {
  const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_PRIMARY = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
const MODEL_BACKUP = process.env.GROQ_BACKUP_MODEL || 'openai/gpt-oss-120b';

if (!GROQ_API_KEY) {
  console.error('❌ Error: GROQ_API_KEY is not set in .env.local or environment');
  process.exit(1);
}

interface BenchmarkResult {
  model: string;
  promptLabel: string;
  ttftMs: number;
  totalDurationMs: number;
  generationDurationMs: number;
  outputTokens: number;
  inputTokens: number;
  generationTps: number;
  endToEndTps: number;
  sampleText: string;
  error?: string;
}

const TEST_PROMPTS = [
  {
    label: 'Market Query (Short)',
    prompt: 'Give a 2-sentence summary of why Bitcoin volatility increases around funding rate settlements.',
    maxTokens: 150,
  },
  {
    label: 'Technical Breakdown (Medium)',
    prompt: 'Explain what order book depth imbalance means and how a trader should interpret a 70% bid wall vs a 30% ask wall in 3 concise bullet points.',
    maxTokens: 350,
  },
];

async function measureModelPerformance(
  model: string,
  promptLabel: string,
  promptText: string,
  maxTokens: number
): Promise<BenchmarkResult> {
  const startTime = performance.now();
  let firstTokenTime: number | null = null;
  let accumulatedText = '';
  let usageTokens = { prompt_tokens: 0, completion_tokens: 0 };
  let estimatedTokens = 0;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an institutional crypto analyst. Provide direct, sharp answers without fluff.',
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: maxTokens,
        temperature: 0.2,
      }),
    });

    if (!response.ok || !response.body) {
      const errBody = await response.text();
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${errBody}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);

          // Capture usage if delivered in stream
          if (parsed.usage) {
            usageTokens.prompt_tokens = parsed.usage.prompt_tokens || usageTokens.prompt_tokens;
            usageTokens.completion_tokens = parsed.usage.completion_tokens || usageTokens.completion_tokens;
          }

          const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.delta?.reasoning_content || '';
          if (delta) {
            if (firstTokenTime === null) {
              firstTokenTime = performance.now();
            }
            accumulatedText += delta;
            estimatedTokens += Math.max(1, Math.round(delta.length / 3.8));
          }
        } catch {
          // Ignore partial chunk parse
        }
      }
    }

    const endTime = performance.now();
    const finalFirstTokenTime = firstTokenTime ?? endTime;
    const ttftMs = Math.round(finalFirstTokenTime - startTime);
    const totalDurationMs = Math.round(endTime - startTime);
    const generationDurationMs = Math.max(1, Math.round(endTime - finalFirstTokenTime));

    const finalOutputTokens = usageTokens.completion_tokens > 0 ? usageTokens.completion_tokens : estimatedTokens;
    const finalInputTokens = usageTokens.prompt_tokens > 0 ? usageTokens.prompt_tokens : Math.round(promptText.length / 4);

    const generationSec = generationDurationMs / 1000;
    const totalSec = totalDurationMs / 1000;

    const generationTps = +(finalOutputTokens / generationSec).toFixed(1);
    const endToEndTps = +(finalOutputTokens / totalSec).toFixed(1);

    return {
      model,
      promptLabel,
      ttftMs,
      totalDurationMs,
      generationDurationMs,
      outputTokens: finalOutputTokens,
      inputTokens: finalInputTokens,
      generationTps,
      endToEndTps,
      sampleText: accumulatedText.slice(0, 120).replace(/\n/g, ' ') + (accumulatedText.length > 120 ? '...' : ''),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const endTime = performance.now();
    return {
      model,
      promptLabel,
      ttftMs: 0,
      totalDurationMs: Math.round(endTime - startTime),
      generationDurationMs: 0,
      outputTokens: 0,
      inputTokens: 0,
      generationTps: 0,
      endToEndTps: 0,
      sampleText: '',
      error: errorMsg,
    };
  }
}

async function runBenchmark() {
  console.log('\n===============================================================');
  console.log('       ⚡ Groq Model Benchmark: TTFT & TPS Performance         ');
  console.log('===============================================================');
  console.log(`Model 1 (Primary): ${MODEL_PRIMARY}`);
  console.log(`Model 2 (Backup) : ${MODEL_BACKUP}`);
  console.log('---------------------------------------------------------------\n');

  const models = [
    { name: 'Primary Model', id: MODEL_PRIMARY },
    { name: 'Backup Model', id: MODEL_BACKUP },
  ];

  const results: BenchmarkResult[] = [];

  for (const modelInfo of models) {
    console.log(`Testing Model: ${modelInfo.name} [${modelInfo.id}]...`);

    for (const testPrompt of TEST_PROMPTS) {
      process.stdout.write(`  ↳ Running "${testPrompt.label}"... `);
      const res = await measureModelPerformance(
        modelInfo.id,
        testPrompt.label,
        testPrompt.prompt,
        testPrompt.maxTokens
      );

      if (res.error) {
        console.log(`❌ FAILED`);
        console.log(`    Error: ${res.error}\n`);
      } else {
        console.log(`✅ Completed`);
        console.log(`    • TTFT (Time to First Token) : ${res.ttftMs} ms`);
        console.log(`    • Generation Speed (TPS)     : ${res.generationTps} tokens/sec`);
        console.log(`    • Tokens Output              : ${res.outputTokens} tokens`);
        console.log(`    • Total Duration             : ${res.totalDurationMs} ms`);
        console.log(`    • Sample Output              : "${res.sampleText}"\n`);
      }

      results.push(res);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  // Summary Comparison Table
  console.log('\n========================================================================================');
  console.log('                             BENCHMARK SUMMARY COMPARISON                               ');
  console.log('========================================================================================');
  console.log(
    '| Model Name                     | Test Case       | TTFT (ms) | Gen TPS   | Output Tok | Total (ms) |'
  );
  console.log(
    '|--------------------------------|-----------------|-----------|-----------|------------|------------|'
  );

  for (const r of results) {
    const modelShort = r.model.slice(0, 30);
    if (r.error) {
      console.log(
        `| ${modelShort.padEnd(30)} | ${r.promptLabel.padEnd(15)} | ERROR: ${r.error.slice(0, 35)} |`
      );
    } else {
      console.log(
        `| ${modelShort.padEnd(30)} | ${r.promptLabel.padEnd(15)} | ${String(r.ttftMs).padStart(7)}ms | ${(String(r.generationTps) + ' t/s').padStart(9)} | ${String(r.outputTokens).padStart(10)} | ${String(r.totalDurationMs).padStart(8)}ms |`
      );
    }
  }
  console.log('========================================================================================\n');
}

runBenchmark();
