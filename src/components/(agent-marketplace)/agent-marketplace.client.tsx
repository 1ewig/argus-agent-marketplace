'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAgentMarketplace } from '@/hooks/agents';
import { useAppStore } from '@/stores/app-store';
import { db, createConversation } from '@/lib/db';
import { MarketplaceHeader } from './marketplace-header';
import { MarketplaceFilterBar } from './marketplace-filter-bar';
import { AgentGrid } from './agent-grid';
import { AgentDetailModal } from './agent-detail-modal';
import { HireAgentModal } from './(hire-workflow)/hire-agent-modal';
import { HiredAgentsPanel } from './(hire-workflow)/hired-agents-panel';
import type { ScanAgentItem } from '@/lib/8004scan/types';
import type { HiredAgentRecord } from '@/lib/types';

export function AgentMarketplaceClient() {
  const router = useRouter();
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const setInput = useAppStore((state) => state.setInput);

  // Hired Agents Panel state (overlay)
  const [isHiredPanelOpen, setIsHiredPanelOpen] = useState(false);
  const [agentToHire, setAgentToHire] = useState<ScanAgentItem | null>(null);

  // Live query for active hired count
  const hiredAgents = useLiveQuery(() => db.hiredAgents.toArray(), []);
  const activeHiredCount = (hiredAgents ?? []).filter((a) => a.status === 'active').length;

  const {
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    selectedTab,
    setSelectedTab,
    searchQuery,
    setSearchQuery,
    clearSearch,
    selectedAgent,
    setSelectedAgent,
    page,
    setPage,
    pageSize,
    totalPages,
    agents,
    totalCount,
    spotlightHevo,
    spotlightAlpha,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAgentMarketplace();

  // Handle agent inspection
  const handleSelectAgent = useCallback(
    (agent: ScanAgentItem) => {
      setSelectedAgent(agent);
    },
    [setSelectedAgent],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedAgent(null);
  }, [setSelectedAgent]);

  // Handle hiring initiation
  const handleOpenHireModal = useCallback(
    (agent: ScanAgentItem) => {
      setSelectedAgent(null);
      setAgentToHire(agent);
    },
    [setSelectedAgent],
  );

  const handleHireSuccess = useCallback((_record: HiredAgentRecord) => {
    setIsHiredPanelOpen(true);
  }, []);

  const setActiveConversationId = useAppStore((state) => state.setActiveConversationId);

  // Handle transfer to chat reasoning desk
  const handleAnalyzeInChat = useCallback(
    async (prompt: string, agentName?: string) => {
      setSelectedAgent(null);

      // Create a brand new conversation session
      const title = agentName ? `Analyze ${agentName}` : undefined;
      const newConv = await createConversation(title);
      setActiveConversationId(newConv.id);

      // Pre-populate input in store
      setInput(prompt);

      // Navigate to chat trading desk
      router.push('/');
    },
    [router, setInput, setSelectedAgent, setActiveConversationId],
  );

  const handleResetFilters = useCallback(() => {
    clearSearch();
    setSelectedCategory('all');
    setSelectedSort('leaderboard');
  }, [clearSearch, setSelectedCategory, setSelectedSort]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* 1. Header Toolbar */}
      <MarketplaceHeader
        onRefresh={refetch}
        onToggleMobileSidebar={toggleMobileSidebar}
        totalCount={totalCount}
        isFetching={isFetching}
        isHiredPanelOpen={isHiredPanelOpen}
        onToggleHiredPanel={() => setIsHiredPanelOpen((prev) => !prev)}
        hiredCount={activeHiredCount}
      />

      {/* 2. Main Scrollable Marketplace Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Categories & Curated Feeds Filter Tabs */}
        <MarketplaceFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        {/* Agents Grid & Pagination */}
        <AgentGrid
          agents={agents}
          spotlightAgents={
            !searchQuery && selectedCategory === 'all' && page === 0
              ? [...spotlightHevo.slice(0, 1), ...spotlightAlpha.slice(0, 1)]
              : undefined
          }
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          onSelectAgent={handleSelectAgent}
          onRetry={refetch}
          onResetFilters={handleResetFilters}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* 3. Hired Agents Overlay Drawer */}
      <HiredAgentsPanel
        isOpen={isHiredPanelOpen}
        onClose={() => setIsHiredPanelOpen(false)}
      />

      {/* 3. Detailed Profile Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={handleCloseModal}
        onAnalyzeInChat={handleAnalyzeInChat}
        onHireAgent={handleOpenHireModal}
      />

      {/* 4. Hire Agent Modal */}
      <HireAgentModal
        agent={agentToHire}
        isOpen={Boolean(agentToHire)}
        onClose={() => setAgentToHire(null)}
        onSuccess={handleHireSuccess}
      />
    </div>
  );
}
