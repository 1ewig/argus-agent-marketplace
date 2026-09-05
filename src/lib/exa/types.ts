import { z } from 'zod';

/**
 * Exa Search result item interface
 */
export interface ExaSearchResultItem {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
}

/**
 * Exa Search response structure
 */
export interface ExaSearchResponse {
  results: ExaSearchResultItem[];
  autopromptString?: string;
}

/**
 * Parameters for executing a crypto news or web search via Exa
 */
export interface ExaSearchOptions {
  query: string;
  type?: 'auto';
  numResults?: number;
  category?: 'news' | 'company' | 'research paper' | 'financial report' | 'general';
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  livecrawl?: 'preferred' | 'always' | 'fallback';
  useAutoprompt?: boolean;
  includeText?: boolean;
  maxTextCharacters?: number;
  highlightsPerUrl?: number;
  apiKey?: string;
}

/**
 * Zod validation schema for Exa search tool arguments with robust defaults
 */
export const ExaSearchInputSchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .describe('Natural language search query for news, catalysts, events, or crypto narratives'),
  symbol: z
    .string()
    .optional()
    .describe('Optional trading symbol context (e.g. SOL, BTC, ETH)'),
  category: z
    .enum(['news', 'company', 'financial report', 'research paper', 'general'])
    .default('news')
    .describe('Search corpus category focus (default: news)'),
  startPublishedDate: z
    .string()
    .optional()
    .describe('Optional ISO 8601 publication start date to filter breaking or recent news (e.g. "2026-09-04T00:00:00Z" for last 24h)'),
  endPublishedDate: z
    .string()
    .optional()
    .describe('Optional ISO 8601 publication end date'),
  includeDomains: z
    .array(z.string())
    .optional()
    .describe('Optional list of authoritative domains to restrict search to (e.g. ["coindesk.com", "theblock.co"])'),
  numResults: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(3)
    .describe('Number of results to return (default: 3, max: 10)'),
  includeText: z
    .boolean()
    .default(true)
    .describe('Whether to fetch page text preview (default: true)'),
  highlightsPerUrl: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .default(2)
    .describe('Number of key sentence highlights per URL (default: 2)'),
});

export type ExaSearchInput = z.infer<typeof ExaSearchInputSchema>;
