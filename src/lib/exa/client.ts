import type { ExaSearchOptions, ExaSearchResultItem } from './types';

const EXA_API_URL = 'https://api.exa.ai/search';

/**
 * Executes an intelligent semantic web search or crypto news query via the Exa AI REST API.
 * Uses search mode 'auto' with customizable category, date ranges, domain scoping, and token-optimized highlights.
 * 
 * @param options - Configurable search parameters with robust defaults
 * @returns Clean, structured search results
 */
export async function searchExa(options: ExaSearchOptions): Promise<{
  query: string;
  results: ExaSearchResultItem[];
  totalResults: number;
  category: string;
}> {
  const {
    query,
    type = 'auto',
    numResults = 3,
    category = 'news',
    startPublishedDate,
    endPublishedDate,
    includeDomains,
    excludeDomains,
    livecrawl = 'preferred',
    useAutoprompt = true,
    includeText = true,
    maxTextCharacters = 600,
    highlightsPerUrl = 2,
    apiKey,
  } = options;

  const resolvedApiKey = apiKey ?? process.env.EXA_API_KEY;
  if (!resolvedApiKey) {
    throw new Error('EXA_API_KEY environment variable is not configured. Please set your Exa API key in .env.local to enable web search.');
  }

  const safeNumResults = Math.min(Math.max(numResults, 1), 10);
  const safeHighlightsCount = Math.min(Math.max(highlightsPerUrl, 1), 5);

  const requestBody: Record<string, unknown> = {
    query,
    type,
    numResults: safeNumResults,
    useAutoprompt,
    livecrawl,
    contents: {
      highlights: {
        numSentences: 2,
        highlightsPerUrl: safeHighlightsCount,
      },
      text: includeText ? { maxCharacters: maxTextCharacters } : false,
    },
  };

  // Only apply category filter if not generic
  if (category && category !== 'general') {
    requestBody.category = category;
  }

  if (startPublishedDate) {
    requestBody.startPublishedDate = startPublishedDate;
  }

  if (endPublishedDate) {
    requestBody.endPublishedDate = endPublishedDate;
  }

  if (includeDomains && includeDomains.length > 0) {
    requestBody.includeDomains = includeDomains;
  }

  if (excludeDomains && excludeDomains.length > 0) {
    requestBody.excludeDomains = excludeDomains;
  }

  const response = await fetch(EXA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': resolvedApiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Exa search request failed with status ${response.status}: ${errorText || response.statusText}`);
  }

  const data = (await response.json()) as {
    results?: Array<{
      id?: string;
      title?: string;
      url?: string;
      publishedDate?: string;
      author?: string;
      text?: string;
      highlights?: string[];
      summary?: string;
    }>;
  };

  const results: ExaSearchResultItem[] = (data.results ?? []).map((item, idx) => ({
    id: item.id ?? `exa_res_${idx}_${Date.now()}`,
    title: item.title || 'Untitled Article',
    url: item.url || '',
    publishedDate: item.publishedDate,
    author: item.author,
    text: item.text,
    highlights: item.highlights,
    summary: item.summary,
  }));

  return {
    query,
    category,
    results,
    totalResults: results.length,
  };
}
