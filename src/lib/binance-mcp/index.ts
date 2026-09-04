import type { IBinanceAgentAdapter } from './types';
import { SimulatedBinanceAdapter } from './simulated-adapter';

export * from './types';
export * from './public-api-client';
export * from './simulated-wallet';
export * from './simulated-adapter';

// Singleton instance for persistent in-memory session/balance management
let simulatedInstance: SimulatedBinanceAdapter | null = null;

/**
 * Returns the active Binance Adapter powered by live Binance public market feeds
 * and the high-fidelity paper trading execution sandbox.
 */
export function getBinanceAdapter(): IBinanceAgentAdapter {
  if (!simulatedInstance) {
    simulatedInstance = new SimulatedBinanceAdapter();
  }
  return simulatedInstance;
}

