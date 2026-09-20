import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guard (P0-1303, Phase 13 audit): both app/auth/confirm/route.ts
// (?next=) and components/auth/LoginForm.tsx (?redirect=) took an
// attacker-controllable query parameter and interpolated it directly into a
// post-auth redirect target — an open redirect. A crafted link could
// complete a genuine PKCE code exchange or a genuine login against the real
// site, then send the user on to an attacker-controlled destination. Both
// were fixed by only allowing same-origin, relative paths.
//
// These tests re-implement the exact same sanitization logic inline (rather
// than importing the real functions, which live in files that either aren't
// plain exports (route.ts) or pull in "use client"/next/navigation, neither
// of which the plain Node test runner can load) and assert it rejects the
// standard open-redirect payload shapes.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function sanitizePath(raw, fallback) {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("\\") || raw.toLowerCase().includes(":")) return fallback;
  return raw;
}

const OPEN_REDIRECT_PAYLOADS = [
  "https://evil.example/phish",
  "http://evil.example",
  "//evil.example",
  "///evil.example",
  "/\\evil.example",
  "javascript:alert(1)",
  " https://evil.example", // leading space bypass attempt
];

test("sanitizePath rejects every standard open-redirect payload shape", () => {
  for (const payload of OPEN_REDIRECT_PAYLOADS) {
    const result = sanitizePath(payload, "/fallback");
    assert.equal(result, "/fallback", `Payload "${payload}" should have been rejected, got "${result}"`);
  }
});

test("sanitizePath allows genuine same-origin relative paths through unchanged", () => {
  assert.equal(sanitizePath("/dashboard", "/fallback"), "/dashboard");
  assert.equal(sanitizePath("/reset-password?type=recovery", "/fallback"), "/reset-password?type=recovery");
  assert.equal(sanitizePath(null, "/fallback"), "/fallback");
  assert.equal(sanitizePath("", "/fallback"), "/fallback");
});

test("app/auth/confirm/route.ts validates the next param before using it in a redirect", () => {
  const source = readSource("app/auth/confirm/route.ts");
  assert.match(source, /function sanitizeNextPath/, "Expected a sanitizeNextPath function");
  assert.match(source, /sanitizeNextPath\(searchParams\.get\("next"\)\)/, "Expected the route to sanitize next before use");
  // The redirect construction itself must use the sanitized variable, not
  // the raw searchParams value.
  assert.doesNotMatch(
    source,
    /NextResponse\.redirect\(`\$\{redirectBase\}\$\{searchParams\.get\("next"\)\}`\)/,
    "Redirect must not interpolate the raw, unsanitized next param"
  );
});

test("components/auth/LoginForm.tsx validates the redirect param before navigating", () => {
  const source = readSource("components/auth/LoginForm.tsx");
  assert.match(source, /function sanitizeRedirectPath/, "Expected a sanitizeRedirectPath function");
  assert.match(
    source,
    /sanitizeRedirectPath\(searchParams\.get\("redirect"\)\)/,
    "Expected the component to sanitize the redirect param before use"
  );
});
