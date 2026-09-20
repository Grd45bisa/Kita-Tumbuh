import test from "node:test";
import assert from "node:assert/strict";
import { manualConfirmationProvider } from "../lib/payments/manual-provider.ts";

test("ManualConfirmationProvider: has correct provider identifier", () => {
  assert.equal(manualConfirmationProvider.name, "MANUAL_TRANSFER");
});

test("ManualConfirmationProvider: creates manual transfer payment intent", async () => {
  const intent = await manualConfirmationProvider.createPaymentIntent({
    orderId: "order-123",
    orderReference: "ORD-2026-99999",
    amount: 75000,
    currency: "IDR",
    customerName: "Budi Santoso",
    customerEmail: "budi@example.com",
    customerPhone: "081234567890",
  });

  assert.equal(intent.providerId, "MANUAL_TRANSFER");
  assert.equal(intent.paymentMethod, "MANUAL_BANK_TRANSFER");
  assert.equal(intent.orderReference, "ORD-2026-99999");
  assert.equal(intent.amount, 75000);
  assert.equal(intent.currency, "IDR");
  assert.equal(intent.status, "PENDING");
  assert.match(intent.instructions || "", /ORD-2026-99999/);
});

test("ManualConfirmationProvider: verifies valid internal callback payload", async () => {
  const result = await manualConfirmationProvider.verifyCallback({
    reference: "ORD-2026-99999",
    isPaid: true,
    transactionId: "TRX-MANUAL-001",
  });

  assert.equal(result.success, true);
  assert.equal(result.orderReference, "ORD-2026-99999");
  assert.equal(result.isPaid, true);
  assert.equal(result.providerTransactionId, "TRX-MANUAL-001");
});

test("ManualConfirmationProvider: rejects invalid callback payload", async () => {
  const result = await manualConfirmationProvider.verifyCallback("invalid-string");
  assert.equal(result.success, false);
});
