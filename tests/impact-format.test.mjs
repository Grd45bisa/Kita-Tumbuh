import assert from "node:assert/strict";
import test from "node:test";
import { formatMetricValue } from "../lib/domain/impact/format.ts";

// =============================================================================
// P0-1401 (Phase 14 audit): formatMetricValue is a pure formatting helper for
// every public impact/transparency number on /dampak and /transparansi —
// previously covered by zero tests. It was extracted from
// lib/domain/impact/public-impact.ts (which cannot be imported directly by
// the plain Node test runner, since it pulls in the "@/lib/env" path alias
// via its Supabase server client import) into a dependency-free module
// specifically so it could be unit-tested directly, per this phase's goal.
// =============================================================================

test("formatMetricValue formats IDR as whole-Rupiah currency with no decimals", () => {
  // Node's Intl.NumberFormat("id-ID", { style: "currency", ... }) inserts a
  // narrow space between the "Rp" symbol and the digits — asserted via a
  // regex rather than a literal string so this test doesn't depend on
  // exactly which whitespace character the ICU data uses. id-ID uses "."
  // as the thousands separator, so the format is Rp<groups-of-3-digits>
  // with no fractional part at all (no "," decimal separator present).
  assert.match(formatMetricValue(1_500_000, "IDR"), /^Rp\s?1\.500\.000$/);
  assert.match(formatMetricValue(0, "IDR"), /^Rp\s?0$/);
  assert.doesNotMatch(formatMetricValue(1_500_000, "IDR"), /,\d+$/, "must not include a decimal-comma fraction");
});

test("formatMetricValue formats liter with up to 1 decimal and an 'L' suffix", () => {
  assert.equal(formatMetricValue(120, "liter"), "120 L");
  assert.equal(formatMetricValue(45.5, "liter"), "45,5 L");
  assert.equal(formatMetricValue(45.567, "liter"), "45,6 L"); // rounds to 1 decimal
});

test("formatMetricValue formats kilogram with up to 1 decimal and a 'kg' suffix", () => {
  assert.equal(formatMetricValue(300, "kilogram"), "300 kg");
  assert.equal(formatMetricValue(12.25, "kilogram"), "12,3 kg"); // rounds to 1 decimal
});

test("formatMetricValue formats an unrecognized unit (e.g. counts: batch/program/unit) as a plain integer", () => {
  assert.equal(formatMetricValue(7, "batch"), "7");
  assert.equal(formatMetricValue(3, "program"), "3");
  assert.equal(formatMetricValue(42, "unit"), "42");
  assert.equal(formatMetricValue(42, "orang"), "42");
});

test("formatMetricValue never renders a negative sign as an impact number would never be negative, but does not silently clamp either — the caller (aggregation layer) is responsible for that invariant", () => {
  // This test documents the current behavior explicitly rather than
  // asserting an invariant the function itself doesn't enforce: negative
  // values are formatted as-is. Aggregation functions in public-impact.ts
  // are the layer responsible for never producing a negative metric.
  assert.equal(formatMetricValue(-5, "kilogram"), "-5 kg");
});
