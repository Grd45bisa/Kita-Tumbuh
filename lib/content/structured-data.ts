import { env } from "@/lib/env";

export interface BreadcrumbListItem {
  label: string;
  href?: string;
}

/**
 * Builds schema.org BreadcrumbList JSON-LD from the exact same items array
 * passed to the visual <Breadcrumb> component, so the structured data can
 * never drift from what is genuinely rendered on the page (P0-1004 — only
 * emit structured data that matches visible content).
 *
 * `href` is resolved against `env.siteUrl` for absolute URLs. The final
 * item (the current page) does not require an `href` — schema.org allows a
 * ListItem without an `item` URL for the current/last entry.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbListItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${env.siteUrl}${item.href}` } : {}),
    })),
  };
}
