/**
 * Interactive TradingView Candlestick Chart UI Copy, timeframes, legends, and status tokens.
 */

export interface ChartTimeframeOption {
  id: string;
  label: string;
  binanceInterval: string;
  limit: number;
}

export const chartContent = {
  chart: {
    title: 'Trading Chart',
    subtitle: 'Real-time Binance Spot candlestick telemetry & volume flow',
    badge: 'BINANCE LIVE',
    switchToChart: 'Switch to Chart View',
    switchToAgent: 'Switch to Agent Chat',
    stageSwitchAria: 'Toggle between Agent Chat and Trading Chart',
    resetZoom: 'Reset Zoom',
    resetZoomTooltip: 'Reset to recent zoomed view',
    fullscreen: 'Fullscreen',
    fullscreenTooltip: 'Toggle fullscreen chart view',
    liveStreamBadge: 'Binance Live',
    connectingBadge: 'Connecting...',
    offlineBadge: 'Offline',
    reconnectingBadge: 'Reconnecting...',
    legend: {
      open: 'O',
      high: 'H',
      low: 'L',
      close: 'C',
      change: 'Change',
    },
    stats: {
      high24h: '24h High',
      low24h: '24h Low',
      change24h: '24h Change',
      volume24h: '24h Vol',
    },
    timeframes: [
      { id: '15m', label: '15M', binanceInterval: '15m', limit: 120 },
      { id: '1h', label: '1H', binanceInterval: '1h', limit: 120 },
      { id: '4h', label: '4H', binanceInterval: '4h', limit: 120 },
      { id: '1D', label: '1D', binanceInterval: '1d', limit: 100 },
      { id: '7D', label: '7D', binanceInterval: '1w', limit: 100 },
      { id: '30D', label: '30D', binanceInterval: '1M', limit: 100 },
    ] as ChartTimeframeOption[],
    loadingCandles: 'Loading historical candlesticks...',
    loadingError: 'Unable to fetch chart candles from Binance REST API.',
    globalBenchmarkNotice: 'Macro workspace active. Charting BTC/USDT benchmark market.',
    emptyTitle: 'Trading Chart Integration',
    emptySubtitle: 'Interactive real-time candlestick charts and technical indicator overlays.',
    switchHint: 'Switch back to the Agent view to interact with live Binance feeds and market analysis.',
  },
} as const;
