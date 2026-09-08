import type { Metadata } from 'next';
import { AgentMarketplaceClient } from '@/components/(agent-marketplace)/agent-marketplace.client';

export const metadata: Metadata = {
  title: 'Agent Marketplace — ERC-8004 Registry | Argus',
  description:
    'Discover, inspect, and benchmark autonomous AI agents on BNB Chain powered by ERC-8004 specification and 8004scan.',
};

export default function MarketplacePage() {
  return (
    <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-theme-bg-base">
      <AgentMarketplaceClient />
    </main>
  );
}
