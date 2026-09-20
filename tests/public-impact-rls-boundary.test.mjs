import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guard: lib/domain/impact/public-impact.ts is called with the
// anon-key Supabase client that public visitors use (no session). Several
// tables it aggregates over have RLS policies that make a direct .from(...)
// query silently wrong for that client — not an error, just incomplete or
// empty data:
//   - donations: RLS "donations_owner_read" only allows user_id = auth.uid()
//     OR user_id IS NULL, so an anonymous caller only sees donations with no
//     owner. Every donation made by a logged-in member is invisible.
//   - production_batches / batch_inputs / social_allocations: admin-only RLS
//     ("FOR ALL TO authenticated USING (is_admin())") with no public SELECT
//     policy at all — a direct query from an anon client always returns 0
//     rows, indistinguishable in code from "no data yet".
// This was found and fixed during the Phase 8 audit by routing those five
// metrics through narrow SECURITY DEFINER RPCs that return only an already-
// aggregated number (supabase/migrations/017_public_impact_aggregation.sql).
// This test guards against silently reverting to a direct .from(...) query
// against those tables inside public-impact.ts.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const RLS_RESTRICTED_TABLES = [
  "donations",
  "production_batches",
  "batch_inputs",
  "social_allocations",
];

test("public-impact.ts does not query RLS-restricted tables directly with the public anon client", () => {
  const source = readSource("lib/domain/impact/public-impact.ts");

  for (const table of RLS_RESTRICTED_TABLES) {
    const directQueryPattern = new RegExp(`\\.from\\(\\s*["']${table}["']\\s*\\)`);
    assert.ok(
      !directQueryPattern.test(source),
      `public-impact.ts queries "${table}" directly via .from() — this table has admin-only or owner-scoped RLS, so an anonymous public visitor's client either sees an incomplete result (donations) or zero rows (production_batches/batch_inputs/social_allocations). Use one of the get_public_impact_* SECURITY DEFINER RPCs instead (017_public_impact_aggregation.sql).`
      );
  }
});

test("every RLS-boundary RPC referenced in public-impact.ts is defined in migration 017", () => {
  const source = readSource("lib/domain/impact/public-impact.ts");
  const migration = readSource("supabase/migrations/017_public_impact_aggregation.sql");

  const rpcCalls = [...source.matchAll(/\.rpc\(\s*["']([a-z_]+)["']/g)].map((m) => m[1]);
  const publicImpactRpcCalls = rpcCalls.filter((name) => name.startsWith("get_public_impact_"));

  assert.ok(
    publicImpactRpcCalls.length >= 5,
    `Expected at least 5 get_public_impact_* RPC calls in public-impact.ts, found ${publicImpactRpcCalls.length}: [${publicImpactRpcCalls.join(", ")}]`
  );

  for (const rpcName of publicImpactRpcCalls) {
    const definedPattern = new RegExp(`CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${rpcName}\\s*\\(`, "i");
    assert.ok(
      definedPattern.test(migration),
      `public-impact.ts calls supabase.rpc("${rpcName}") but no matching "CREATE OR REPLACE FUNCTION public.${rpcName}(" was found in 017_public_impact_aggregation.sql`
    );
  }
});

test("every get_public_impact_* RPC in migration 017 is granted to the anon role", () => {
  const migration = readSource("supabase/migrations/017_public_impact_aggregation.sql");

  const definedFunctions = [
    ...migration.matchAll(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.(get_public_impact_[a-z_]+)\s*\(/gi),
  ].map((m) => m[1]);

  assert.ok(definedFunctions.length > 0, "Expected to find get_public_impact_* function definitions in migration 017");

  for (const fnName of definedFunctions) {
    const grantPattern = new RegExp(
      `GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${fnName}\\s*\\([^)]*\\)\\s+TO\\s+[^;]*\\banon\\b`,
      "i"
    );
    assert.ok(
      grantPattern.test(migration),
      `Function public.${fnName} is defined but has no "GRANT EXECUTE ... TO anon" — a public visitor with no session (anon role) would be unable to call it, defeating the purpose of this migration.`
    );
  }
});
