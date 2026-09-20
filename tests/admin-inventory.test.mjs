import assert from "node:assert/strict";
import test from "node:test";
import {
  InventoryAdjustmentSchema,
  CreateWasteLotSchema,
} from "../lib/validation/inventory-schema.ts";

test("InventoryAdjustmentSchema validates valid ADD and SUBTRACT inputs", () => {
  const validAdd = InventoryAdjustmentSchema.safeParse({
    waste_lot_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    adjustment_type: "ADD",
    quantity: 15.5,
    reason: "Penerimaan limbah susulan dari batch sortir A.",
  });

  assert.equal(validAdd.success, true);
  if (validAdd.success) {
    assert.equal(validAdd.data.adjustment_type, "ADD");
    assert.equal(validAdd.data.quantity, 15.5);
  }

  const validSubtract = InventoryAdjustmentSchema.safeParse({
    waste_lot_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    adjustment_type: "SUBTRACT",
    quantity: 4.25,
    reason: "Penyusutan alami akibat sedimentasi minyak.",
  });

  assert.equal(validSubtract.success, true);
});

test("InventoryAdjustmentSchema rejects invalid UUID, zero/negative quantity, or empty reason", () => {
  const invalidUuid = InventoryAdjustmentSchema.safeParse({
    waste_lot_id: "not-a-uuid",
    adjustment_type: "ADD",
    quantity: 5,
    reason: "Alasan yang cukup panjang",
  });
  assert.equal(invalidUuid.success, false);

  const zeroQty = InventoryAdjustmentSchema.safeParse({
    waste_lot_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    adjustment_type: "ADD",
    quantity: 0,
    reason: "Alasan yang cukup panjang",
  });
  assert.equal(zeroQty.success, false);

  const shortReason = InventoryAdjustmentSchema.safeParse({
    waste_lot_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    adjustment_type: "ADD",
    quantity: 5,
    reason: "test", // min 5 chars
  });
  assert.equal(shortReason.success, false);
});

test("CreateWasteLotSchema validates correct lot registration and defaults", () => {
  const valid = CreateWasteLotSchema.safeParse({
    waste_type_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    lot_code: "LOT-JELANTAH-001",
    initial_quantity: 50,
    unit: "Liter",
  });

  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.quality_grade, "STANDARD");
    assert.equal(valid.data.storage_location, "Gudang Utama Kampung Smart Farming");
  }
});

test("CreateWasteLotSchema rejects invalid lot_code characters or negative initial quantity", () => {
  const badCode = CreateWasteLotSchema.safeParse({
    waste_type_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    lot_code: "LOT #001!", // invalid chars
    initial_quantity: 50,
    unit: "Liter",
  });
  assert.equal(badCode.success, false);

  const negativeQty = CreateWasteLotSchema.safeParse({
    waste_type_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    lot_code: "LOT-001",
    initial_quantity: -10,
    unit: "Liter",
  });
  assert.equal(negativeQty.success, false);
});
