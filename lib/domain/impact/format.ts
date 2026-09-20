/**
 * Pure formatting helpers for public impact metrics.
 *
 * Deliberately kept dependency-free (no "@/lib/env", no Supabase client, no
 * "use server") so it can be:
 * 1. Unit-tested directly by the plain Node test runner without needing a
 *    "@/" path-alias resolver (see tests/impact-format.test.mjs).
 * 2. Imported from either a Server Component or a Client Component, since
 *    it has no server-only dependency forcing it into one side.
 */

export function formatMetricValue(
  value: number,
  unit: string,
  locale = "id-ID"
): string {
  if (unit === "IDR") {
    // Nilai dalam integer Rupiah langsung (bukan sen)
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === "liter") {
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value)} L`;
  }

  if (unit === "kilogram") {
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value)} kg`;
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
