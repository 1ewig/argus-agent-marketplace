'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import {
  type ToolDisplayInfo,
  type ToolResultCardProps,
  getToolDisplayInfo,
  TickerPriceCard,
  OrderBookCard,
  Stats24hCard,
  KlinesCard,
  FundingRateCard,
  AveragePriceCard,
  RecentTradesCard,
  OpenInterestCard,
  LongShortRatioCard,
  CryptoNewsCard,
  AgentTelemetryCard,
  AgentSearchCard,
} from './tool-results';

export type { ToolDisplayInfo, ToolResultCardProps };
export { getToolDisplayInfo };

/**
 * Organizes tool results into sleek, compact financial widgets.
 * Memoized to prevent re-rendering during timeline timer ticks.
 */
export const ToolResultCard = React.memo(function ToolResultCard({
  toolName,
  toolResult,
}: ToolResultCardProps) {
  const res = APP_CONTENT.process.results;

  const resultObj =
    toolResult && typeof toolResult === 'object' ? (toolResult as Record<string, unknown>) : null;

  const isError = resultObj?.success === false || Boolean(resultObj?.error);
  const errorMessage = typeof resultObj?.error === 'string' ? resultObj.error : null;

  const renderContent = () => {
    if (isError) {
      return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-theme-status-danger/10 border border-theme-status-danger/20 text-theme-status-danger text-xs font-medium">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="truncate">{errorMessage ?? res.errorTitle}</span>
        </div>
      );
    }

    if (!toolResult || !resultObj) {
      return (
        <span className="text-theme-text-muted text-xs italic py-1">
          {res.emptyResult}
        </span>
      );
    }

    switch (toolName) {
      case 'get_ticker_price':
        return <TickerPriceCard resultObj={resultObj} />;
      case 'get_order_book':
        return <OrderBookCard resultObj={resultObj} />;
      case 'get_24h_stats':
        return <Stats24hCard resultObj={resultObj} />;
      case 'get_klines':
        return <KlinesCard resultObj={resultObj} />;
      case 'get_funding_rate':
        return <FundingRateCard resultObj={resultObj} />;
      case 'get_average_price':
        return <AveragePriceCard resultObj={resultObj} />;
      case 'get_recent_trades':
        return <RecentTradesCard resultObj={resultObj} />;
      case 'get_open_interest':
        return <OpenInterestCard resultObj={resultObj} />;
      case 'get_global_long_short_ratio':
      case 'get_top_long_short_ratio':
        return <LongShortRatioCard resultObj={resultObj} />;
      case 'search_crypto_news':
        return <CryptoNewsCard resultObj={resultObj} />;
      case 'get_agent_telemetry':
        return <AgentTelemetryCard resultObj={resultObj} />;
      case 'search_agent_marketplace':
        return <AgentSearchCard resultObj={resultObj} />;
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80 text-xs text-theme-text-secondary">
            <CheckCircle2 className="size-3.5 text-theme-brand-binance shrink-0" />
            <span className="font-medium">{res.actionSuccess}</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-lg transition-all duration-200">
      {renderContent()}
    </div>
  );
});