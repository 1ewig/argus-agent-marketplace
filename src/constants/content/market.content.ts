/**
 * Market search modal copy.
 */

export const marketContent = {
  symbolSearch: {
    buttonLabel: 'Search Markets',
    buttonAria: 'Search all Binance USDT markets',
    shortcut: '⌘K',
    shortcutWin: 'Ctrl+K',
    dialogTitle: 'Select Trading Pair',
    dialogSubtitle: 'Browse and switch between active Binance USDT spot markets',
    inputPlaceholder: 'Search pair (e.g. BTC, SOL, PEPE, SUI)...',
    activeBadge: 'ACTIVE',
    emptyTitle: 'No matching pairs found',
    emptySubtitle: 'Try searching with a different ticker or token name.',
    loading: 'Loading symbols...',
    errorMessage: 'Failed to load symbols from Binance API.',
    clearSearch: 'Clear search input',
    closeDialog: 'Close market search',
    marketsCount: (count: number) => `${count} USDT Markets`,
    pairsCount: (count: number) => `${count} pairs`,
    keyboardHint: 'ESC to exit • ↑↓ to navigate • ENTER to select',
    navLegend: '↑↓ navigate',
    selectLegend: '↵ select',
    escLegend: 'esc close',
    loadMoreHint: (remaining: number) => `Scroll down to load ${remaining} more pairs...`,
    showingCount: (visible: number, total: number) => `Showing ${visible} of ${total} pairs`,
  },
} as const;
