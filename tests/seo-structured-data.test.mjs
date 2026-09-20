import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guard: every public page that renders the visual <Breadcrumb>
// component should also emit matching BreadcrumbList JSON-LD, built from the
// exact same breadcrumbItems array via buildBreadcrumbJsonLd() — never a
// hand-rolled duplicate that can drift from what's visually rendered
// (P0-1004, and the warning already written into components/ui/Breadcrumb.tsx
// itself). Found during the Phase 10 audit: 11 public pages used <Breadcrumb>
// but not one of them had BreadcrumbList structured data.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const PUBLIC_PAGES_WITH_BREADCRUMB = [
  "app/cara-kerja/page.tsx",
  "app/cerita/page.tsx",
  "app/collection-point/page.tsx",
  "app/dampak/page.tsx",
  "app/faq/page.tsx",
  "app/produk/page.tsx",
  "app/produk/[slug]/page.tsx",
  "app/program/page.tsx",
  "app/program/[slug]/page.tsx",
  "app/tentang-kami/page.tsx",
  "app/transparansi/page.tsx",
];

test("every public page using <Breadcrumb> also emits BreadcrumbList JSON-LD via buildBreadcrumbJsonLd", () => {
  for (const page of PUBLIC_PAGES_WITH_BREADCRUMB) {
    const source = readSource(page);
    assert.match(
      source,
      /<Breadcrumb\s+items=\{breadcrumbItems\}/,
      `${page}: expected to find <Breadcrumb items={breadcrumbItems} /> (page list may be stale)`
    );
    assert.match(
      source,
      /buildBreadcrumbJsonLd\(breadcrumbItems\)/,
      `${page}: renders <Breadcrumb> but does not call buildBreadcrumbJsonLd(breadcrumbItems) — BreadcrumbList structured data is missing or was hand-rolled instead of using the shared helper (risk of drift from what's visually rendered).`
    );
  }
});

test("buildBreadcrumbJsonLd produces valid schema.org BreadcrumbList shape", () => {
  // lib/content/structured-data.ts imports lib/env.ts via the "@/" path
  // alias, which only Next.js's own bundler resolves — the plain Node test
  // runner used by `npm test` cannot import it directly. Re-implement the
  // same pure logic here (kept in sync by inspection; the function is a
  // small, stable, side-effect-free mapping) rather than pulling in a
  // TypeScript loader/path-alias resolver just for this one test.
  function buildBreadcrumbJsonLd(items) {
    const siteUrl = "https://example.test";
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
      })),
    };
  }

  const result = buildBreadcrumbJsonLd([
    { label: "Beranda", href: "/" },
    { label: "Produk", href: "/produk" },
    { label: "Lilin Aromaterapi" },
  ]);

  assert.equal(result["@context"], "https://schema.org");
  assert.equal(result["@type"], "BreadcrumbList");
  assert.equal(result.itemListElement.length, 3);
  assert.equal(result.itemListElement[0].position, 1);
  assert.equal(result.itemListElement[0].name, "Beranda");
  assert.ok(result.itemListElement[0].item.endsWith("/"));
  assert.equal(result.itemListElement[2].position, 3);
  assert.equal(result.itemListElement[2].name, "Lilin Aromaterapi");
  // The last (current-page) item has no href in the source data, so it must
  // not receive a fabricated `item` URL.
  assert.equal("item" in result.itemListElement[2], false);
});

test("lib/content/structured-data.ts's real implementation matches the same shape", () => {
  const source = readSource("lib/content/structured-data.ts");
  assert.match(source, /"@context":\s*"https:\/\/schema\.org"/);
  assert.match(source, /"@type":\s*"BreadcrumbList"/);
  assert.match(source, /position:\s*index \+ 1/);
  assert.match(source, /name:\s*item\.label/);
  // The conditional spread must only attach `item` (the URL) when href
  // exists — the last/current page entry must never get a fabricated URL.
  assert.match(source, /\.\.\.\(item\.href \? \{ item: /);
});

test("robots.ts disallow list matches the actual protected routes in middleware", () => {
  const robotsSource = readSource("app/robots.ts");
  const middlewareSource = readSource("lib/supabase/middleware.ts");

  const protectedPrefixes = [...middlewareSource.matchAll(/pathname\.startsWith\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(protectedPrefixes.length > 0, "Expected to find pathname.startsWith(...) checks in middleware.ts");

  for (const prefix of protectedPrefixes) {
    if (prefix === "/admin") continue; // covered by "/admin/" in robots disallow
    const disallowed = robotsSource.includes(`"${prefix}"`) || robotsSource.includes(`"${prefix}/"`) || robotsSource.includes(`"${prefix}",`);
    assert.ok(
      disallowed,
      `Middleware protects "${prefix}" (redirects unauthenticated visitors to /login) but app/robots.ts does not disallow it — crawlers will keep hitting a route that always just redirects.`
    );
  }
});
