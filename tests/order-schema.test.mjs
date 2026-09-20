import test from "node:test";
import assert from "node:assert/strict";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  ORDER_STATUS_STEPS,
  ORDER_PAYMENT_STATUS_STEPS,
} from "../lib/validation/order-schema.ts";

test("CreateOrderSchema: accepts valid order payload", () => {
  const valid = {
    customer_name: "Budi Santoso",
    customer_email: "budi@example.com",
    customer_phone: "081234567890",
    shipping_address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    customer_notes: "Kirim saat jam kerja",
    items: [
      {
        product_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        quantity: 2,
      },
    ],
  };

  const result = CreateOrderSchema.safeParse(valid);
  assert.equal(result.success, true);
});

test("CreateOrderSchema: rejects empty items array", () => {
  const invalid = {
    customer_name: "Budi Santoso",
    customer_email: "budi@example.com",
    customer_phone: "081234567890",
    shipping_address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    items: [],
  };

  const result = CreateOrderSchema.safeParse(invalid);
  assert.equal(result.success, false);
});

test("CreateOrderSchema: rejects invalid email and short phone", () => {
  const invalid = {
    customer_name: "Budi Santoso",
    customer_email: "not-an-email",
    customer_phone: "123",
    shipping_address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    items: [
      {
        product_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        quantity: 1,
      },
    ],
  };

  const result = CreateOrderSchema.safeParse(invalid);
  assert.equal(result.success, false);
});

test("CreateOrderSchema: rejects negative or zero quantity", () => {
  const invalid = {
    customer_name: "Budi Santoso",
    customer_email: "budi@example.com",
    customer_phone: "081234567890",
    shipping_address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
    items: [
      {
        product_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        quantity: 0,
      },
    ],
  };

  const result = CreateOrderSchema.safeParse(invalid);
  assert.equal(result.success, false);
});

test("UpdateOrderStatusSchema: accepts valid status", () => {
  const valid = {
    order_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    status: "PAID",
    notes: "Pembayaran terverifikasi via mutasi BCA",
  };

  const result = UpdateOrderStatusSchema.safeParse(valid);
  assert.equal(result.success, true);
});

test("UpdateOrderStatusSchema: rejects invalid status", () => {
  const invalid = {
    order_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    status: "UNKNOWN_STATUS",
  };

  const result = UpdateOrderStatusSchema.safeParse(invalid);
  assert.equal(result.success, false);
});
