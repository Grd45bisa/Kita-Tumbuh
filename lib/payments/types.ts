/**
 * Payment Integration Boundary
 *
 * Defines abstract interfaces for payment providers.
 * Designed so that future providers (e.g. Midtrans, Xendit) can be plugged in
 * without modifying domain logic in orders, revenue ledger, or social allocations.
 */

export interface PaymentIntentInput {
  orderId: string;
  orderReference: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentIntentResult {
  providerId: string;
  paymentMethod: string;
  orderReference: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  instructions?: string;
  redirectUrl?: string;
  rawPayload?: Record<string, unknown>;
}

export interface PaymentCallbackResult {
  success: boolean;
  orderReference: string;
  isPaid: boolean;
  providerTransactionId?: string;
  error?: string;
  rawPayload?: unknown;
}

export interface ManualConfirmationInput {
  orderId: string;
  adminUserId: string;
  adminName: string;
  notes?: string;
}

export interface PaymentProvider {
  /**
   * Unique identifier of the provider (e.g., 'MANUAL_TRANSFER', 'MIDTRANS', 'XENDIT')
   */
  readonly name: string;

  /**
   * Initialize a payment intent for a newly placed order.
   */
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;

  /**
   * Verify an asynchronous webhook or callback payload from the payment gateway.
   */
  verifyCallback(
    payload: string | Record<string, unknown>,
    signature?: string
  ): Promise<PaymentCallbackResult>;
}
