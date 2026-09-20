import assert from "node:assert/strict";
import test from "node:test";
import { WasteTypeSchema } from "../lib/validation/waste-type-schema.ts";

test("WasteTypeSchema accepts valid waste type payload", () => {
  const result = WasteTypeSchema.safeParse({
    name: "Minyak Jelantah Super",
    slug: "minyak-jelantah-super",
    unit: "L",
    min_quantity: 0.5,
    max_quantity: 100,
    sort_order: 2,
    is_active: true,
    description: "Minyak jelantah kualitas baik",
    accepted_notes: "Gunakan wadah tertutup rapat",
    rejected_notes: "Tidak boleh bercampur air",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Minyak Jelantah Super");
    assert.equal(result.data.slug, "minyak-jelantah-super");
    assert.equal(result.data.max_quantity, 100);
  }
});

test("WasteTypeSchema rejects invalid slug characters", () => {
  const badSlug = WasteTypeSchema.safeParse({
    name: "Minyak Jelantah",
    slug: "Minyak Jelantah!", // Spaces and uppercase/exclamation
    unit: "L",
    min_quantity: 0.5,
  });

  assert.equal(badSlug.success, false);
});

test("WasteTypeSchema allows null or empty string for max_quantity (unlimited)", () => {
  const unlimited = WasteTypeSchema.safeParse({
    name: "Kompos Daun Kering",
    slug: "kompos-daun-kering",
    unit: "kg",
    min_quantity: 1,
    max_quantity: "",
  });

  assert.equal(unlimited.success, true);
  if (unlimited.success) {
    assert.equal(unlimited.data.max_quantity, null);
  }
});

test("WasteTypeSchema rejects negative min_quantity", () => {
  const negativeMin = WasteTypeSchema.safeParse({
    name: "Sampah Kertas",
    slug: "sampah-kertas",
    unit: "kg",
    min_quantity: -5,
  });

  assert.equal(negativeMin.success, false);
});
