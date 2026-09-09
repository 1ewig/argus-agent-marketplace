import {
  getCached,
  parseAgentQueryParams,
  resolveMarketplaceAgents,
  respondWithCache,
  setCached,
} from '@/lib/8004scan';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = parseAgentQueryParams(request.url);

  // 1. Check in-memory cache
  const cachedData = getCached(params.cacheKey);
  if (cachedData) {
    return respondWithCache(cachedData, true);
  }

  // 2. Resolve marketplace agents (handles live 8004scan & graceful fallback)
  const payload = await resolveMarketplaceAgents(params);
  setCached(params.cacheKey, payload);

  return respondWithCache(payload, false);
}
