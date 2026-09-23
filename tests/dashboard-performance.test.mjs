import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guards for the admin/dashboard navigation performance audit
// (2026-09-21): getCurrentUser() previously made 2 uncached Supabase round
// trips (auth.getUser() + a profiles query) on EVERY call, and
// requirePermission() (which calls it) was invoked repeatedly per page load
// — once in app/admin/layout.tsx, then again inside almost every domain
// function a page called (up to 5x per load = 10 round trips just for
// auth). This was the single biggest contributor to admin navigation
// feeling slow. Fixed by wrapping getCurrentUser() in React's cache().
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

test("getCurrentUser() is wrapped in React's cache() to dedupe repeated calls within one request", () => {
  const source = readSource("lib/auth/session.ts");
  assert.match(source, /import\s*\{\s*cache\s*\}\s*from\s*"react"/, "Expected an import of cache from 'react'");
  assert.match(
    source,
    /export const getCurrentUser = cache\(async \(\)/,
    "getCurrentUser must be defined as `export const getCurrentUser = cache(async () => {...})` — a plain `export async function getCurrentUser()` would not be deduplicated across the multiple requirePermission()/requireUser() calls a single admin page load makes."
  );
});

test("app/admin/loading.tsx exists so admin navigation shows an instant loading state", () => {
  // Just confirms the file is present and renders something recognizable —
  // the actual visual behavior (replacing only {children}, not the
  // AdminNav sidebar in app/admin/layout.tsx) is inherent to Next.js's
  // loading.tsx convention once the file exists at this exact path.
  const source = readSource("app/admin/loading.tsx");
  assert.match(source, /export default function/, "Expected a default-exported component");
});

test("components/ui/Skeleton.tsx exports reusable skeleton primitives", () => {
  const source = readSource("components/ui/Skeleton.tsx");
  assert.match(source, /export function Skeleton\(/);
  assert.match(source, /export function SkeletonTable\(/);
  assert.match(source, /export function SkeletonCards\(/);
});

test("Skeleton's shimmer animation respects prefers-reduced-motion", () => {
  const source = readSource("components/ui/Skeleton.module.css");
  assert.match(source, /animation:\s*skeleton-shimmer/);
  assert.match(
    source,
    /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.skeleton\s*\{[\s\S]*?animation:\s*none/,
    "Expected a prefers-reduced-motion block disabling the shimmer animation"
  );
});

// Spot-check a representative sample of the pages fixed to use Promise.all
// instead of sequential independent awaits — not exhaustive, but guards
// the clearest wins against a naive future edit reverting them back to
// sequential awaits.
const PAGES_EXPECTED_TO_USE_PROMISE_ALL = [
  "app/admin/inventory/page.tsx",
  "app/admin/donations/page.tsx",
  "app/admin/production/page.tsx",
  "app/admin/products/page.tsx",
  "app/riwayat/page.tsx",
  "app/admin/production/[id]/page.tsx",
  "app/admin/donations/[reference]/page.tsx",
  "app/admin/social/programs/[id]/page.tsx",
];

test("pages with independent Supabase queries use Promise.all instead of sequential awaits", () => {
  for (const page of PAGES_EXPECTED_TO_USE_PROMISE_ALL) {
    const source = readSource(page);
    assert.match(source, /Promise\.all\(/, `${page}: expected Promise.all(...) for its independent queries`);
  }
});

test("getAdminPrograms fetches allocated_amount with one batched query, not one per program row", () => {
  const source = readSource("lib/domain/admin/social-programs.ts");
  // The old N+1 pattern issued a separate .from("social_allocations")...
  // query inside a .map() callback per row. The fix uses a single .in(...)
  // filter covering every program_id on the page.
  assert.doesNotMatch(
    source,
    /\(data as unknown as RawProgram\[\]\)\.map\(async \(row\) => \{[\s\S]*?\.from\("social_allocations"\)/,
    "getAdminPrograms appears to have regressed to fetching social_allocations once per row inside a .map() — this was an N+1 query bug (up to 15 extra round trips per page load)."
  );
  assert.match(source, /\.in\("program_id",\s*programIds\)/, "Expected a single batched .in('program_id', ...) query");
});
