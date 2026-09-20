import type {
  PaymentProvider,
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentCallbackResult,
} from "./types";

/**
 * ManualConfirmationProvider
 *
 * First concrete implementation of PaymentProvider.
 * Handles manual bank transfers where payment confirmation is performed
 * by an authorized admin after verifying bank statements / receipts.
 */
export class ManualConfirmationProvider implements PaymentProvider {
  readonly name = "MANUAL_TRANSFER";

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      providerId: this.name,
      paymentMethod: "MANUAL_BANK_TRANSFER",
      orderReference: input.orderReference,
      amount: input.amount,
      currency: input.currency,
      status: "PENDING",
      instructions: `Transfer nominal tepat Rp ${input.amount.toLocaleString("id-ID")} dengan berita transfer "${input.orderReference}".`,
    };
  }

  async verifyCallback(
    payload: string | Record<string, unknown>,
    _signature?: string
  ): Promise<PaymentCallbackResult> {
    // For manual confirmation, callbacks are verified internally via authenticated admin action
    if (typeof payload === "object" && payload !== null && "reference" in payload) {
      return {
        success: true,
        orderReference: String(payload.reference),
        isPaid: Boolean(payload.isPaid),
        providerTransactionId: (payload.transactionId as string) || undefined,
        rawPayload: payload,
      };
    }

    return {
      success: false,
      orderReference: "",
      isPaid: false,
      error: "Payload verifikasi manual tidak valid.",
    };
  }
}

/**
 * Singleton instance of ManualConfirmationProvider
 */
export const manualConfirmationProvider = new ManualConfirmationProvider();
