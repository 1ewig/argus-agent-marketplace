import { z } from 'zod';

/**
 * x402 Micropayment Invoice
 */
export const X402InvoiceSchema = z.object({
  protocol: z.literal('x402'),
  version: z.literal('1.0'),
  invoiceId: z.string(),
  amount: z.string(),
  currency: z.literal('USDC'),
  recipientAddress: z.string(),
  memo: z.string(),
  expiresAt: z.number(),
});

export type X402Invoice = z.infer<typeof X402InvoiceSchema>;

/**
 * x402 Micropayment Proof Receipt
 */
export const X402PaymentReceiptSchema = z.object({
  protocol: z.literal('x402'),
  txHash: z.string(),
  invoiceId: z.string(),
  amount: z.string(),
  currency: z.literal('USDC'),
  senderAddress: z.string(),
  recipientAddress: z.string(),
  timestamp: z.number(),
  status: z.literal('CONFIRMED'),
});

export type X402PaymentReceipt = z.infer<typeof X402PaymentReceiptSchema>;
