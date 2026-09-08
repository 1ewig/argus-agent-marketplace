'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAgentMarketplace } from '@/hooks/agents';
import { useAppStore } from '@/stores/app-store';
import { MarketplaceHeader } from './marketplace-header';
import { MarketplaceFilterBar } from './marketplace-filter-bar';
import { AgentGrid } from './agent-grid';
import { AgentDetailModal } from './agent-detail-modal';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export function AgentMarketplaceClient() {
  const router = useRouter();
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const setInput = useAppStore((state) => state.setInput);

  const {
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

  // Handle transfer to chat reasoning desk
  const handleAnalyzeInChat = useCallback(
    (prompt: string) => {
      setSelectedAgent(null);
      setInput(prompt);
      router.push('/');
    },
    [router, setInput, setSelectedAgent],
  );

  const handleResetFilters = useCallback(() => {
    clearSearch();
    setSelectedTab('all');
  }, [clearSearch, setSelectedTab]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* 1. Header Toolbar */}
      <MarketplaceHeader
        onRefresh={refetch}
        onToggleMobileSidebar={toggleMobileSidebar}
        totalCount={totalCount}
        isFetching={isFetching}
      />

      {/* 2. Main Scrollable Marketplace Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Categories & Curated Feeds Filter Tabs */}
        <MarketplaceFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        {/* Agents Grid & Pagination */}
        <AgentGrid
          agents={agents}
          spotlightAgents={
            !searchQuery && selectedTab === 'all' && page === 0
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

      {/* 3. Detailed Profile Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={handleCloseModal}
        onAnalyzeInChat={handleAnalyzeInChat}
      />
    </div>
  );
}
