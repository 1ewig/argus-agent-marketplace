import type { AccountBalance, OrderExecutionResult, PlaceSpotOrderParams } from './types';

/**
 * Isolated in-memory Agentic Wallet sandbox for paper trading and simulation.
 * Manages balances, fee deductions, and deterministic order identifiers.
 */
export class SimulatedAgentWallet {
  private balances: Map<string, { free: number; locked: number }> = new Map([
    ['USDT', { free: 500.0, locked: 0.0 }],
    ['USDC', { free: 500.0, locked: 0.0 }],
    ['SOL', { free: 0.0, locked: 0.0 }],
    ['BTC', { free: 0.0, locked: 0.0 }],
    ['ETH', { free: 0.0, locked: 0.0 }],
  ]);

  private orderCounter = 100000;

  /**
   * Returns current balances across all tracked assets.
   */
  public getBalances(): AccountBalance[] {
    const result: AccountBalance[] = [];
    for (const [asset, bal] of this.balances.entries()) {
      result.push({
        asset,
        free: bal.free,
        locked: bal.locked,
      });
    }
    return result;
  }

  /**
   * Executes a spot order in the sandbox wallet against market or limit price.
   */
  public executeOrder(params: PlaceSpotOrderParams, currentMarketPrice: number): OrderExecutionResult {
    const baseAsset = params.symbol.replace(/USDT|USDC$/, '');
    const quoteAsset = params.symbol.endsWith('USDC') ? 'USDC' : 'USDT';

    const executionPrice = params.price ?? currentMarketPrice;
    const totalCost = params.quantity * executionPrice;
    const commissionUsd = +(totalCost * 0.001).toFixed(4); // 0.1% standard spot trading fee

    const quoteBal = this.balances.get(quoteAsset) ?? { free: 0, locked: 0 };
    const baseBal = this.balances.get(baseAsset) ?? { free: 0, locked: 0 };

    if (params.side === 'BUY') {
      if (quoteBal.free < totalCost + commissionUsd) {
        throw new Error(
          `Insufficient ${quoteAsset} balance in Agentic Wallet. Required: $${(totalCost + commissionUsd).toFixed(2)}, Available: $${quoteBal.free.toFixed(2)}`
        );
      }

      quoteBal.free = +(quoteBal.free - (totalCost + commissionUsd)).toFixed(4);
      baseBal.free = +(baseBal.free + params.quantity).toFixed(4);
    } else {
      if (baseBal.free < params.quantity) {
        throw new Error(
          `Insufficient ${baseAsset} balance in Agentic Wallet. Required: ${params.quantity}, Available: ${baseBal.free}`
        );
      }

      baseBal.free = +(baseBal.free - params.quantity).toFixed(4);
      quoteBal.free = +(quoteBal.free + (totalCost - commissionUsd)).toFixed(4);
    }

    this.balances.set(quoteAsset, quoteBal);
    this.balances.set(baseAsset, baseBal);

    this.orderCounter += 1;
    const orderId = `SIM-${this.orderCounter}`;
    const clientOrderId = params.newClientOrderId ?? `cli_${Date.now()}`;

    return {
      orderId,
      clientOrderId,
      symbol: params.symbol.toUpperCase(),
      side: params.side,
      status: 'FILLED',
      executedQty: params.quantity,
      cummulativeQuoteQty: +totalCost.toFixed(4),
      price: executionPrice,
      commissionUsd,
      commissionAsset: quoteAsset,
      timestamp: Date.now(),
    };
  }

  /**
   * Simulates order cancellation.
   */
  public cancelOrder(_symbol: string, orderId: string): { success: boolean; orderId: string } {
    return {
      success: true,
      orderId,
    };
  }
}
