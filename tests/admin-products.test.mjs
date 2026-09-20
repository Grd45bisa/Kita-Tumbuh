import assert from "node:assert/strict";
import test from "node:test";
import {
  ProductSchema,
  PRODUCT_CATEGORIES,
} from "../lib/validation/product-schema.ts";

test("ProductSchema accepts valid circular product payload", () => {
  const valid = ProductSchema.safeParse({
    sku: "PROD-SBN-001",
    name: "Sabun Cuci Serbaguna Minyak Jelantah",
    slug: "sabun-cuci-serbaguna-minyak-jelantah",
    description: "Sabun alami ramah lingkungan dari minyak jelantah terfiltrasi.",
    story: "Dibuat bersama anak-anak difabel di workshop Kampung Smart Farming.",
    category: "MINYAK_JELANTAH",
    price: 15000,
    currency: "IDR",
    stock_quantity: 45,
    unit: "Batang",
    is_public: true,
  });

  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.price, 15000);
    assert.equal(valid.data.currency, "IDR");
    assert.equal(valid.data.is_public, true);
  }
});

test("ProductSchema requires integer price and rejects float or negative money", () => {
  const floatPrice = ProductSchema.safeParse({
    sku: "PROD-001",
    name: "Sabun Cuci",
    slug: "sabun-cuci",
    description: "Deskripsi cukup panjang.",
    category: "MINYAK_JELANTAH",
    price: 15000.75, // float rejected per DATABASE.md Money rule
    stock_quantity: 10,
    unit: "Pcs",
  });
  assert.equal(floatPrice.success, false);

  const negativePrice = ProductSchema.safeParse({
    sku: "PROD-001",
    name: "Sabun Cuci",
    slug: "sabun-cuci",
    description: "Deskripsi cukup panjang.",
    category: "MINYAK_JELANTAH",
    price: -5000,
    stock_quantity: 10,
    unit: "Pcs",
  });
  assert.equal(negativePrice.success, false);
});

test("ProductSchema rejects invalid slug characters or invalid category", () => {
  const badSlug = ProductSchema.safeParse({
    sku: "PROD-001",
    name: "Sabun Cuci",
    slug: "Sabun Cuci Spasi & Huruf Besar!",
    description: "Deskripsi cukup panjang.",
    category: "MINYAK_JELANTAH",
    price: 10000,
    stock_quantity: 5,
    unit: "Pcs",
  });
  assert.equal(badSlug.success, false);

  const badCategory = ProductSchema.safeParse({
    sku: "PROD-001",
    name: "Sabun Cuci",
    slug: "sabun-cuci",
    description: "Deskripsi cukup panjang.",
    category: "UNKNOWN_CATEGORY",
    price: 10000,
    stock_quantity: 5,
    unit: "Pcs",
  });
  assert.equal(badCategory.success, false);
});

test("PRODUCT_CATEGORIES matches expected 3 categories", () => {
  assert.deepEqual(PRODUCT_CATEGORIES, [
    "MINYAK_JELANTAH",
    "ORGANIK",
    "ANORGANIK",
  ]);
});
