/**
 * P0-801 — Impact Calculation Definitions
 *
 * Setiap metrik publik WAJIB memiliki definisi lengkap di sini sebelum
 * dapat ditampilkan. Tidak ada angka yang dipublikasikan tanpa sumber
 * yang dapat diverifikasi.
 *
 * Aturan:
 * - Angka publik hanya boleh berasal dari data terverifikasi (verified_quantity
 *   untuk donasi ≥ VERIFIED, atau hasil produksi COMPLETED/RELEASED, dsb).
 * - Estimasi donor (estimated_quantity) TIDAK pernah digunakan sebagai
 *   angka publik.
 * - Akuntansi bersifat pooled: tidak ada hubungan 1:1 antara donasi spesifik
 *   dengan produk atau alokasi sosial spesifik.
 * - Biaya operasional tidak pernah disamarkan sebagai dana sosial.
 */

export type MetricUnit =
  | "liter"
  | "kilogram"
  | "unit"
  | "IDR"
  | "program"
  | "orang"
  | "batch";

export type MetricPeriod = "all_time" | "year" | "month" | "quarter";

/**
 * Definisi satu metrik publik — menjelaskan sumber, rumus, dan batasan.
 */
export interface MetricDefinition {
  /** Slug unik, dipakai sebagai key dan URL anchor */
  slug: string;
  /** Label pendek untuk ditampilkan di UI */
  label: string;
  /** Penjelasan apa yang dihitung */
  description: string;
  /** Rumus / sumber data */
  formula: string;
  /** Tabel sumber utama */
  sourceTable: string;
  /** Kondisi filter wajib sebelum data dimasukkan */
  filter: string;
  /** Kolom yang diagregasi */
  aggregatedColumn: string;
  /** Satuan nilai */
  unit: MetricUnit;
  /** Apakah metrik ini menggunakan pooled accounting */
  isPooled: boolean;
  /** Catatan penting untuk ditampilkan bersama angka */
  caveat?: string;
}

/**
 * Registri definisi metrik publik resmi.
 * Setiap metrik di halaman /dampak dan /transparansi harus ada di sini.
 */
export const METRIC_DEFINITIONS = {
  /**
   * Total limbah yang telah diverifikasi secara fisik oleh operator.
   * BUKAN perkiraan dari donatur.
   */
  waste_collected_liters: {
    slug: "waste_collected_liters",
    label: "Minyak Jelantah Diterima",
    description:
      "Total volume minyak jelantah yang telah diverifikasi saat penerimaan fisik oleh operator.",
    formula:
      "SUM(donations.verified_quantity) WHERE waste_type_slug = 'minyak-jelantah' AND status IN ('VERIFIED','SORTED','PROCESSED','CONVERTED','IMPACTED')",
    sourceTable: "donations",
    filter:
      "status IN ('VERIFIED','SORTED','PROCESSED','CONVERTED','IMPACTED') AND waste_type_slug = 'minyak-jelantah' AND verified_quantity IS NOT NULL",
    aggregatedColumn: "verified_quantity",
    unit: "liter",
    isPooled: false,
    caveat:
      "Angka ini adalah jumlah aktual hasil verifikasi fisik, bukan perkiraan yang diajukan donatur.",
  } satisfies MetricDefinition,

  waste_collected_kg: {
    slug: "waste_collected_kg",
    label: "Limbah Organik Diterima",
    description:
      "Total berat limbah organik dapur yang telah diverifikasi saat penerimaan fisik.",
    formula:
      "SUM(donations.verified_quantity) WHERE waste_type_slug = 'limbah-organik' AND status IN ('VERIFIED','SORTED','PROCESSED','CONVERTED','IMPACTED')",
    sourceTable: "donations",
    filter:
      "status IN ('VERIFIED','SORTED','PROCESSED','CONVERTED','IMPACTED') AND waste_type_slug = 'limbah-organik' AND verified_quantity IS NOT NULL",
    aggregatedColumn: "verified_quantity",
    unit: "kilogram",
    isPooled: false,
    caveat:
      "Angka ini adalah jumlah aktual hasil verifikasi fisik, bukan perkiraan yang diajukan donatur.",
  } satisfies MetricDefinition,

  /**
   * Total limbah yang masuk ke batch produksi (dipakai dari lot inventaris).
   * Berasal dari batch_inputs, bukan dari donations langsung.
   */
  waste_processed: {
    slug: "waste_processed",
    label: "Limbah Diproses",
    description:
      "Total volume atau berat limbah yang benar-benar telah masuk ke proses produksi.",
    formula:
      "SUM(batch_inputs.quantity_used) WHERE production_batches.status IN ('COMPLETED','RELEASED')",
    sourceTable: "batch_inputs",
    filter:
      "JOIN production_batches pb ON pb.id = batch_id WHERE pb.status IN ('COMPLETED','RELEASED')",
    aggregatedColumn: "quantity_used",
    unit: "kilogram",
    isPooled: false,
    caveat:
      "Dihitung dari batch produksi yang sudah selesai. Limbah masih dalam proses atau QC belum termasuk.",
  } satisfies MetricDefinition,

  /**
   * Jumlah batch produksi yang telah selesai dan dirilis.
   */
  production_batches_completed: {
    slug: "production_batches_completed",
    label: "Batch Produksi Selesai",
    description:
      "Jumlah batch pengolahan limbah yang telah selesai dan produknya dirilis.",
    formula:
      "COUNT(production_batches) WHERE status IN ('COMPLETED','RELEASED')",
    sourceTable: "production_batches",
    filter: "status IN ('COMPLETED','RELEASED')",
    aggregatedColumn: "id",
    unit: "batch",
    isPooled: false,
  } satisfies MetricDefinition,

  /**
   * Total alokasi dana sosial yang sudah disetujui.
   * Bersumber dari revenue_entries (pendapatan penjualan produk sirkular).
   * BUKAN termasuk biaya operasional.
   */
  social_allocation_total: {
    slug: "social_allocation_total",
    label: "Alokasi Dana Sosial",
    description:
      "Total dana yang dialokasikan untuk program pemberdayaan sosial, disetujui dari pendapatan penjualan produk sirkular.",
    formula:
      "SUM(social_allocations.amount) WHERE approval_status = 'APPROVED'",
    sourceTable: "social_allocations",
    filter: "approval_status = 'APPROVED'",
    aggregatedColumn: "amount",
    unit: "IDR",
    isPooled: true,
    caveat:
      "Dihitung secara pooled dari total pendapatan penjualan — bukan berarti setiap donasi menghasilkan jumlah ini secara langsung.",
  } satisfies MetricDefinition,

  /**
   * Jumlah program sosial aktif atau sudah selesai yang dapat dilihat publik.
   */
  social_programs_count: {
    slug: "social_programs_count",
    label: "Program Sosial",
    description:
      "Jumlah program pemberdayaan sosial yang aktif atau sudah selesai dan dipublikasikan.",
    formula:
      "COUNT(social_programs) WHERE public_status = true AND status IN ('ACTIVE','FUNDED','PARTIALLY_FUNDED','DISTRIBUTED','COMPLETED')",
    sourceTable: "social_programs",
    filter:
      "public_status = true AND status IN ('ACTIVE','FUNDED','PARTIALLY_FUNDED','DISTRIBUTED','COMPLETED')",
    aggregatedColumn: "id",
    unit: "program",
    isPooled: false,
  } satisfies MetricDefinition,

  /**
   * Jumlah donasi yang telah melalui proses verifikasi fisik (status ≥ VERIFIED).
   */
  donations_verified: {
    slug: "donations_verified",
    label: "Donasi Terverifikasi",
    description:
      "Jumlah catatan donasi yang telah melalui pemeriksaan fisik oleh operator.",
    formula:
      "COUNT(donations) WHERE status IN ('VERIFIED','SORTED','PROCESSED','CONVERTED','IMPACTED')",
    sourceTable: "donations",
    filter:
      "status IN ('VERIFIED','SORTED','PROCESSED','CONVERTED','IMPACTED')",
    aggregatedColumn: "id",
    unit: "unit",
    isPooled: false,
  } satisfies MetricDefinition,
} as const;

export type MetricSlug = keyof typeof METRIC_DEFINITIONS;

/**
 * Status ketika data untuk suatu metrik belum tersedia di database.
 * Digunakan untuk membedakan "nol sungguhan" dengan "belum ada data".
 */
export type MetricStatus = "available" | "no_data" | "error";

export interface PublicMetricValue {
  slug: MetricSlug;
  definition: MetricDefinition;
  value: number | null;
  status: MetricStatus;
  /** Waktu komputasi (server time) */
  computedAt: string;
  /** Periode yang dicakup (null = all_time) */
  period: { from: string | null; to: string | null };
}

/**
 * Ringkasan agregat semua metrik publik dalam satu objek.
 */
export interface PublicImpactSummary {
  metrics: Record<MetricSlug, PublicMetricValue>;
  computedAt: string;
  dataFreshness: "live" | "cached";
  period: { from: string | null; to: string | null };
}
