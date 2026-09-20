import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guard (P0-1304, Phase 13 audit): waste_lots.current_quantity
// must only ever be mutated through the atomic execute_waste_lot_mutation
// RPC (021_waste_lot_mutation_hardening.sql), never a direct
// .from("waste_lots").update({ current_quantity: ... }) call from
// application code — that pattern was the exact TOCTOU race condition bug
// found in both adjustWasteLotAction and addBatchInputAction during this
// audit (the same class of bug already fixed three times before, for order
// stock/ADR-020, social allocation balance, and distribution balance/ADR-024).
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const FILES_THAT_MUTATE_WASTE_LOTS = [
  "lib/domain/admin/inventory.ts",
  "lib/domain/admin/production.ts",
];

test("waste_lots.current_quantity is never written via a direct .update() call from application code", () => {
  for (const file of FILES_THAT_MUTATE_WASTE_LOTS) {
    const source = readSource(file);
    // A direct update chain against the waste_lots table that sets
    // current_quantity is the exact anti-pattern being guarded against.
    const directUpdatePattern = /\.from\(\s*["']waste_lots["']\s*\)[\s\S]{0,200}?\.update\(\s*\{[\s\S]{0,200}?current_quantity/;
    assert.ok(
      !directUpdatePattern.test(source),
      `${file} appears to write waste_lots.current_quantity via a direct .update() call — this must go through the execute_waste_lot_mutation RPC instead, which locks the row and re-validates sufficiency atomically.`
    );
  }
});

test("both waste-lot-mutating domain functions call the execute_waste_lot_mutation RPC", () => {
  for (const file of FILES_THAT_MUTATE_WASTE_LOTS) {
    const source = readSource(file);
    assert.match(
      source,
      /\.rpc\(\s*["']execute_waste_lot_mutation["']/,
      `${file} should call supabase.rpc("execute_waste_lot_mutation", ...) to mutate waste_lots.current_quantity`
    );
  }
});

test("execute_waste_lot_mutation locks the waste_lots row before reading its quantity", () => {
  const sql = readSource("supabase/migrations/021_waste_lot_mutation_hardening.sql");
  assert.match(
    sql,
    /SELECT \* INTO v_lot\s+FROM public\.waste_lots\s+WHERE id = p_waste_lot_id\s+FOR UPDATE/,
    "Expected execute_waste_lot_mutation to SELECT ... FOR UPDATE the waste_lots row before computing the new quantity"
  );
});
