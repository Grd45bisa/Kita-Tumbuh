import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guard: every SECURITY DEFINER RPC that MUTATES sensitive data
// (money, orders, beneficiary distributions) must have an explicit
// REVOKE ... FROM PUBLIC somewhere in the migration set — Postgres grants
// EXECUTE on a new function to PUBLIC by default, which for a
// SECURITY DEFINER function means ANY authenticated session (not just
// staff — a plain MEMBER too) can call it directly via supabase.rpc(...),
// completely bypassing the requirePermission() checks that only guard the
// Server Action call path, not the RPC itself.
//
// This exact bug was found during the Phase 9 audit: execute_social_allocation
// (011), execute_order_payment_confirmation (013), execute_distribution (016),
// and update_revenue_reconciliation (013) had no REVOKE/GRANT at all —
// fixed in 020_rpc_grant_hardening.sql, which both revokes PUBLIC access
// and adds an in-function has_permission(...) guard.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const migrationsDir = resolve(repoRoot, "supabase/migrations");

function readAllMigrations() {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => ({ file: f, sql: readFileSync(resolve(migrationsDir, f), "utf8") }));
}

// Functions that mutate sensitive financial/beneficiary/order/inventory data
// and MUST never be reachable by an unauthorized session.
const CRITICAL_WRITE_RPCS = [
  "execute_social_allocation",
  "execute_order_payment_confirmation",
  "execute_distribution",
  "update_revenue_reconciliation",
  "execute_waste_lot_mutation",
];

test("every critical write RPC has an explicit REVOKE ... FROM PUBLIC somewhere in the migration set", () => {
  const migrations = readAllMigrations();
  const combined = migrations.map((m) => m.sql).join("\n");

  for (const fnName of CRITICAL_WRITE_RPCS) {
    const revokePattern = new RegExp(`REVOKE\\s+ALL\\s+ON\\s+FUNCTION\\s+public\\.${fnName}\\s*\\([^)]*\\)\\s+FROM\\s+PUBLIC`, "i");
    assert.ok(
      revokePattern.test(combined),
      `No "REVOKE ALL ON FUNCTION public.${fnName}(...) FROM PUBLIC" found in any migration — this SECURITY DEFINER function is callable by any authenticated session (Postgres default grant), bypassing all requirePermission() checks in the TypeScript call path.`
    );
  }
});

test("every critical write RPC's most recent definition includes an in-function has_permission(...) guard", () => {
  const migrations = readAllMigrations();

  for (const fnName of CRITICAL_WRITE_RPCS) {
    // Find the LAST (most recent) CREATE OR REPLACE FUNCTION for this name
    // across all migrations, in file order — that's the one that actually
    // runs in the database after all migrations apply.
    let lastDefinition = null;
    for (const { sql } of migrations) {
      const pattern = new RegExp(
        `CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${fnName}\\s*\\([\\s\\S]*?\\$\\$\\s+LANGUAGE\\s+plpgsql\\s+SECURITY\\s+DEFINER`,
        "gi"
      );
      const matches = [...sql.matchAll(pattern)];
      if (matches.length > 0) {
        lastDefinition = matches[matches.length - 1][0];
      }
    }

    assert.ok(lastDefinition, `Could not find any CREATE OR REPLACE FUNCTION public.${fnName}(...) ... SECURITY DEFINER definition in the migration set`);
    assert.match(
      lastDefinition,
      /has_permission\s*\(/,
      `The most recent definition of public.${fnName}(...) does not call has_permission(...) internally — a caller who is merely "authenticated" (any staff role, or even a role with the wrong module permission) could execute it once GRANT EXECUTE ... TO authenticated is in place.`
    );
  }
});

test("every critical write RPC is granted to authenticated (not left ungranted after REVOKE)", () => {
  const migrations = readAllMigrations();
  const combined = migrations.map((m) => m.sql).join("\n");

  for (const fnName of CRITICAL_WRITE_RPCS) {
    const grantPattern = new RegExp(
      `GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${fnName}\\s*\\([^)]*\\)\\s+TO\\s+[^;]*\\bauthenticated\\b`,
      "i"
    );
    assert.ok(
      grantPattern.test(combined),
      `public.${fnName}(...) has no "GRANT EXECUTE ... TO authenticated" — if it was revoked from PUBLIC without a replacement grant, legitimate staff calls via the Server Action path would also fail.`
    );
  }
});
