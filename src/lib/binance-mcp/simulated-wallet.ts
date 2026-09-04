import type { AccountBalance, OrderExecutionResult, PlaceSpotOrderParams } from './types';
import { normalizeSymbol } from './public-api-client';

interface InternalOrderRecord extends OrderExecutionResult {
  lockedAmount: number;
  lockedAsset: string;
}

/**
 * Isolated in-memory Agentic Wallet sandbox for paper trading and simulation.
 * Manages balances, fee deductions, order state machines, deterministic order identifiers,
 * and strict server-side idempotency/replay protection.
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
  private orders: Map<string, InternalOrderRecord> = new Map();
  private clientOrderMap: Map<string, string> = new Map(); // clientOrderId -> orderId
  private recentOrderFingerprints: Map<string, { orderId: string; timestamp: number }> = new Map();

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

  private formatOrderResult(record: InternalOrderRecord): OrderExecutionResult {
    return {
      orderId: record.orderId,
      clientOrderId: record.clientOrderId,
      symbol: record.symbol,
      side: record.side,
      status: record.status,
      executedQty: record.executedQty,
      cummulativeQuoteQty: record.cummulativeQuoteQty,
      price: record.price,
      commissionUsd: record.commissionUsd,
      commissionAsset: record.commissionAsset,
      timestamp: record.timestamp,
    };
  }

  /**
   * Executes or places a spot order in the sandbox wallet.
   * 
   * Enforces:
   * 1. Strict server-side idempotency on clientOrderId/newClientOrderId (replays return original fill receipt)
   * 2. Replay protection on identical payloads within 5s window
   * 3. Symbol sanitization
   * 4. Required positive limit price for LIMIT orders
   * 5. PERCENT_PRICE price filter sanity check (+/- bounds against real market price)
   * 6. State machine: LIMIT orders placed below/above market are marked NEW and lock funds
   */
  public executeOrder(params: PlaceSpotOrderParams, currentMarketPrice: number): OrderExecutionResult {
    const cleanSymbol = normalizeSymbol(params.symbol);
    const effectiveClientId = params.newClientOrderId ?? params.clientOrderId;

    // 1. Idempotency Check: Return existing order if clientOrderId is re-submitted
    if (effectiveClientId && this.clientOrderMap.has(effectiveClientId)) {
      const existingOrderId = this.clientOrderMap.get(effectiveClientId)!;
      const existing = this.orders.get(existingOrderId);
      if (existing) {
        return this.formatOrderResult(existing);
      }
    }

    // 2. Replay Protection: Dedup identical orders submitted within 5 seconds
    const isLimit = params.type === 'LIMIT';
    const fingerprint = `${cleanSymbol}:${params.side}:${params.quantity}:${params.type ?? 'MARKET'}:${isLimit ? params.price : ''}`;
    const now = Date.now();
    const recent = this.recentOrderFingerprints.get(fingerprint);

    if (recent && now - recent.timestamp < 5000) {
      const existing = this.orders.get(recent.orderId);
      if (existing) {
        // Associate this clientOrderId if provided on the replay
        if (effectiveClientId) {
          this.clientOrderMap.set(effectiveClientId, existing.orderId);
        }
        return this.formatOrderResult(existing);
      }
    }

    // 3. Resolve Quote and Base Assets
    const quoteAssets = ['USDT', 'USDC', 'FDUSD', 'EUR', 'TRY', 'BTC', 'ETH', 'BNB'];
    const quoteAsset = quoteAssets.find((q) => cleanSymbol.endsWith(q) && cleanSymbol.length > q.length) ?? 'USDT';
    const baseAsset = cleanSymbol.slice(0, cleanSymbol.length - quoteAsset.length);

    // 4. LIMIT order specific validations
    if (isLimit) {
      if (typeof params.price !== 'number' || params.price <= 0 || isNaN(params.price)) {
        throw new Error('A positive limit price is required for LIMIT orders');
      }

      // 5. Binance PERCENT_PRICE filter check
      const minAllowedPrice = currentMarketPrice * 0.2;
      const maxAllowedPrice = currentMarketPrice * 5.0;

      if (params.price < minAllowedPrice || params.price > maxAllowedPrice) {
        throw new Error(
          `Filter failure: PERCENT_PRICE. Limit price ($${params.price}) deviates too far from market price ($${currentMarketPrice.toFixed(2)}). Real exchange rules reject this as far off-book.`
        );
      }
    }

    const executionPrice = isLimit ? params.price! : currentMarketPrice;
    const totalCost = params.quantity * executionPrice;
    const commissionUsd = +(totalCost * 0.001).toFixed(4); // 0.1% spot fee

    const quoteBal = this.balances.get(quoteAsset) ?? { free: 0, locked: 0 };
    const baseBal = this.balances.get(baseAsset) ?? { free: 0, locked: 0 };

    this.orderCounter += 1;
    const orderId = `SIM-${this.orderCounter}`;
    const clientOrderId = effectiveClientId ?? `cli_${now}_${Math.random().toString(36).slice(2, 7)}`;

    // 6. Determine whether order fills immediately or rests on the book as NEW
    const doesImmediatelyFill =
      !isLimit ||
      (params.side === 'BUY' && executionPrice >= currentMarketPrice) ||
      (params.side === 'SELL' && executionPrice <= currentMarketPrice);

    if (doesImmediatelyFill) {
      // Execute immediately (MARKET or crossing LIMIT)
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

      const record: InternalOrderRecord = {
        orderId,
        clientOrderId,
        symbol: cleanSymbol,
        side: params.side,
        status: 'FILLED',
        executedQty: params.quantity,
        cummulativeQuoteQty: +totalCost.toFixed(4),
        price: executionPrice,
        commissionUsd,
        commissionAsset: quoteAsset,
        timestamp: now,
        lockedAmount: 0,
        lockedAsset: '',
      };

      this.orders.set(orderId, record);
      this.clientOrderMap.set(clientOrderId, orderId);
      if (effectiveClientId) {
        this.clientOrderMap.set(effectiveClientId, orderId);
      }
      this.recentOrderFingerprints.set(fingerprint, { orderId, timestamp: now });

      return this.formatOrderResult(record);
    } else {
      // Resting LIMIT order: place on book as NEW and lock required collateral
      if (params.side === 'BUY') {
        const requiredCollateral = totalCost + commissionUsd;
        if (quoteBal.free < requiredCollateral) {
          throw new Error(
            `Insufficient ${quoteAsset} balance to place open limit order. Required: $${requiredCollateral.toFixed(2)}, Available: $${quoteBal.free.toFixed(2)}`
          );
        }
        quoteBal.free = +(quoteBal.free - requiredCollateral).toFixed(4);
        quoteBal.locked = +(quoteBal.locked + requiredCollateral).toFixed(4);
        this.balances.set(quoteAsset, quoteBal);

        const record: InternalOrderRecord = {
          orderId,
          clientOrderId,
          symbol: cleanSymbol,
          side: params.side,
          status: 'NEW',
          executedQty: 0,
          cummulativeQuoteQty: 0,
          price: executionPrice,
          commissionUsd: 0,
          commissionAsset: quoteAsset,
          timestamp: now,
          lockedAmount: requiredCollateral,
          lockedAsset: quoteAsset,
        };

        this.orders.set(orderId, record);
        this.clientOrderMap.set(clientOrderId, orderId);
        if (effectiveClientId) {
          this.clientOrderMap.set(effectiveClientId, orderId);
        }
        this.recentOrderFingerprints.set(fingerprint, { orderId, timestamp: now });

        return this.formatOrderResult(record);
      } else {
        if (baseBal.free < params.quantity) {
          throw new Error(
            `Insufficient ${baseAsset} balance to place open limit order. Required: ${params.quantity}, Available: ${baseBal.free}`
          );
        }
        baseBal.free = +(baseBal.free - params.quantity).toFixed(4);
        baseBal.locked = +(baseBal.locked + params.quantity).toFixed(4);
        this.balances.set(baseAsset, baseBal);

        const record: InternalOrderRecord = {
          orderId,
          clientOrderId,
          symbol: cleanSymbol,
          side: params.side,
          status: 'NEW',
          executedQty: 0,
          cummulativeQuoteQty: 0,
          price: executionPrice,
          commissionUsd: 0,
          commissionAsset: quoteAsset,
          timestamp: now,
          lockedAmount: params.quantity,
          lockedAsset: baseAsset,
        };

        this.orders.set(orderId, record);
        this.clientOrderMap.set(clientOrderId, orderId);
        if (effectiveClientId) {
          this.clientOrderMap.set(effectiveClientId, orderId);
        }
        this.recentOrderFingerprints.set(fingerprint, { orderId, timestamp: now });

        return this.formatOrderResult(record);
      }
    }
  }

  /**
   * Cancels an active open order in the sandbox wallet.
   * Unlocks collateral and rejects invalid, already-filled, or already-cancelled orders.
   */
  public cancelOrder(symbol: string, orderId: string): { success: boolean; orderId: string; status: string } {
    const cleanSymbol = normalizeSymbol(symbol);
    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order "${orderId}" not found for symbol ${cleanSymbol}`);
    }

    if (order.symbol !== cleanSymbol) {
      throw new Error(`Order "${orderId}" belongs to symbol ${order.symbol}, not ${cleanSymbol}`);
    }

    if (order.status === 'FILLED') {
      throw new Error(`Cannot cancel order "${orderId}" — order is already FILLED`);
    }

    if (order.status === 'CANCELED') {
      throw new Error(`Order "${orderId}" is already CANCELED`);
    }

    if (order.status === 'NEW') {
      // Unlock reserved collateral
      if (order.lockedAsset && order.lockedAmount > 0) {
        const bal = this.balances.get(order.lockedAsset);
        if (bal) {
          bal.locked = Math.max(0, +(bal.locked - order.lockedAmount).toFixed(4));
          bal.free = +(bal.free + order.lockedAmount).toFixed(4);
          this.balances.set(order.lockedAsset, bal);
        }
      }

      order.status = 'CANCELED';
      this.orders.set(orderId, order);

      return {
        success: true,
        orderId,
        status: 'CANCELED',
      };
    }

    throw new Error(`Order "${orderId}" cannot be canceled (current status: ${order.status})`);
  }
}
