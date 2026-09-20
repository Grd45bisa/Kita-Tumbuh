import assert from "node:assert/strict";
import test from "node:test";
import {
  CreateProductionBatchSchema,
  AddBatchInputSchema,
  UpdateBatchStatusSchema,
  PRODUCTION_STATUS_STEPS,
} from "../lib/validation/production-batch-schema.ts";

test("CreateProductionBatchSchema accepts valid batch payload", () => {
  const valid = CreateProductionBatchSchema.safeParse({
    batch_number: "BATCH-2026-001",
    title: "Pembuatan Sabun Cuci Piring Ekstrak Daun Mint",
    target_output_type: "Sabun Cuci Piring",
    target_quantity: 100,
    output_unit: "Botol 500ml",
    notes: "Rasio KOH 1:4 dengan pemanasan 65C",
  });

  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.batch_number, "BATCH-2026-001");
    assert.equal(valid.data.target_quantity, 100);
  }
});

test("CreateProductionBatchSchema rejects invalid batch number format or negative target quantity", () => {
  const badNumber = CreateProductionBatchSchema.safeParse({
    batch_number: "BATCH #001!", // invalid chars
    title: "Pembuatan Sabun",
    target_output_type: "Sabun",
    target_quantity: 100,
    output_unit: "Botol",
  });
  assert.equal(badNumber.success, false);

  const negativeQty = CreateProductionBatchSchema.safeParse({
    batch_number: "BATCH-001",
    title: "Pembuatan Sabun",
    target_output_type: "Sabun",
    target_quantity: -50,
    output_unit: "Botol",
  });
  assert.equal(negativeQty.success, false);
});

test("AddBatchInputSchema validates waste lot allocation", () => {
  const valid = AddBatchInputSchema.safeParse({
    batch_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    waste_lot_id: "e5f6a1b2-c3d4-4a7b-8c9d-0e1f2a3b4c5d",
    quantity_used: 25.5,
    unit: "Liter",
    notes: "Pengambilan tahap 1 untuk proses saponifikasi",
  });

  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.quantity_used, 25.5);
    assert.equal(valid.data.unit, "Liter");
  }
});

test("AddBatchInputSchema rejects non-uuid or non-positive quantity", () => {
  const badUuid = AddBatchInputSchema.safeParse({
    batch_id: "not-uuid",
    waste_lot_id: "e5f6a1b2-c3d4-4a7b-8c9d-0e1f2a3b4c5d",
    quantity_used: 10,
    unit: "Liter",
  });
  assert.equal(badUuid.success, false);

  const zeroQty = AddBatchInputSchema.safeParse({
    batch_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    waste_lot_id: "e5f6a1b2-c3d4-4a7b-8c9d-0e1f2a3b4c5d",
    quantity_used: 0,
    unit: "Liter",
  });
  assert.equal(zeroQty.success, false);
});

test("UpdateBatchStatusSchema validates all 5 production state machine steps", () => {
  const steps = ["PLANNED", "IN_PROGRESS", "QC_REVIEW", "COMPLETED", "RELEASED"];
  assert.deepEqual(PRODUCTION_STATUS_STEPS, steps);

  for (const s of steps) {
    const res = UpdateBatchStatusSchema.safeParse({
      batch_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      status: s,
      actual_output_quantity: s === "COMPLETED" ? 95 : undefined,
      loss_quantity: s === "COMPLETED" ? 5 : undefined,
      loss_reason: s === "COMPLETED" ? "Endapan sisa proses" : "",
    });
    assert.equal(res.success, true, `Step ${s} should be valid`);
  }

  const badStatus = UpdateBatchStatusSchema.safeParse({
    batch_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    status: "INVALID_STATUS",
  });
  assert.equal(badStatus.success, false);
});
