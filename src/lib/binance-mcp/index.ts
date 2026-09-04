import type { IBinanceAgentAdapter } from './types';
import { LiveBinanceMCPAdapter } from './live-mcp-adapter';
import { SimulatedBinanceAdapter } from './simulated-adapter';

export * from './types';
export * from './public-api-client';
export * from './simulated-wallet';
export * from './simulated-adapter';
export * from './live-mcp-adapter';

// Singleton instances for persistent in-memory session/balance management
let simulatedInstance: SimulatedBinanceAdapter | null = null;
let liveInstance: LiveBinanceMCPAdapter | null = null;

/**
 * Returns the active Binance Agent OS Adapter based on the requested mode
 * Defaults to 'simulation' if not specified or if NEXT_PUBLIC_BINANCE_MODE is set
 */
export function getBinanceAdapter(mode?: 'live_mcp' | 'simulation'): IBinanceAgentAdapter {
  const targetMode = mode ?? (process.env.NEXT_PUBLIC_BINANCE_MODE === 'live_mcp' ? 'live_mcp' : 'simulation');

  if (targetMode === 'live_mcp') {
    if (!liveInstance) {
      liveInstance = new LiveBinanceMCPAdapter();
    }
    return liveInstance;
  }

  if (!simulatedInstance) {
    simulatedInstance = new SimulatedBinanceAdapter();
  }
  return simulatedInstance;
}
