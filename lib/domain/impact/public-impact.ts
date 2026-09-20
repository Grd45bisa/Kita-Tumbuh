/**
 * P0-802 — Public Impact Aggregation
 *
 * Fungsi ini hanya boleh dipanggil dari Server Components atau Server Actions.
 * TIDAK boleh diekspos ke client bundle.
 *
 * Prinsip:
 * - Hanya data terverifikasi yang diagregasi (bukan estimasi donatur).
 * - Akuntansi pooled: tidak ada 1:1 antara donasi ↔ produk ↔ alokasi.
 * - Boundary data publik dijaga: tidak ada query ke tabel sensitif
 *   (beneficiaries, pickup_requests, donor_email, dsb).
 * - Jika data belum ada, kembalikan status "no_data" bukan angka 0 palsu.
 *
 * PENTING — mengapa sebagian metrik lewat RPC, bukan query tabel langsung:
 * Halaman ini dipanggil dengan Supabase client anon-key milik pengunjung
 * publik (lib/supabase/server.ts createClient() selalu memakai sesi
 * pengunjung, bukan service role). Di bawah RLS itu:
 *   - `donations_owner_read` hanya mengizinkan baris user_id = auth.uid()
 *     ATAU user_id IS NULL — untuk pengunjung anonim (auth.uid() = NULL),
 *     ini berarti HANYA donasi anonim yang terlihat, sehingga query
 *     langsung akan meng-undercount donasi dari member yang login.
 *   - `production_batches`, `batch_inputs`, `social_allocations` memakai
 *     policy admin-only (FOR ALL TO authenticated USING (is_admin())) tanpa
 *     policy SELECT publik sama sekali — query langsung dari klien anon
 *     SELALU mengembalikan 0 baris, bukan karena data kosong.
 * Ditemukan saat audit Phase 8 dan diperbaiki dengan RPC SECURITY DEFINER
 * yang HANYA mengembalikan angka agregat (SUM/COUNT), tidak pernah baris
 * mentah — lihat supabase/migrations/017_public_impact_aggregation.sql.
 * `social_programs_count` TETAP query tabel langsung karena
 * `social_programs` sudah punya policy SELECT publik yang benar
 * (`social_programs_public_read`, scoped ke public_status = true).
 */

import { createClient } from "@/lib/supabase/server";
import {
  METRIC_DEFINITIONS,
  type MetricSlug,
  type PublicMetricValue,
  type PublicImpactSummary,
  type MetricStatus,
} from "./definitions";

// Catatan: daftar status donasi "terverifikasi" (VERIFIED, SORTED, PROCESSED,
// CONVERTED, IMPACTED) kini didefinisikan di dalam RPC SECURITY DEFINER
// (017_public_impact_aggregation.sql), bukan di sini — lihat catatan
// boundary RLS di header file ini untuk alasannya.

/**
 * Agregat tunggal: total verified_quantity minyak jelantah.
 * Lewat RPC SECURITY DEFINER — lihat catatan boundary RLS di header file ini.
 */
async function aggregateWasteCollectedLiters(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { data, error } = await supabase.rpc("get_public_impact_waste_collected", {
    p_waste_type_slug: "minyak-jelantah",
  });

  if (error) {
    console.error("[impact] waste_collected_liters error:", error.message);
    return { value: null, status: "error" };
  }

  if (data === null || data === undefined) {
    return { value: null, status: "no_data" };
  }

  return { value: Math.round(Number(data) * 100) / 100, status: "available" };
}

/**
 * Agregat tunggal: total verified_quantity limbah organik.
 * Lewat RPC SECURITY DEFINER — lihat catatan boundary RLS di header file ini.
 */
async function aggregateWasteCollectedKg(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { data, error } = await supabase.rpc("get_public_impact_waste_collected", {
    p_waste_type_slug: "limbah-organik",
  });

  if (error) {
    console.error("[impact] waste_collected_kg error:", error.message);
    return { value: null, status: "error" };
  }

  if (data === null || data === undefined) {
    return { value: null, status: "no_data" };
  }

  return { value: Math.round(Number(data) * 100) / 100, status: "available" };
}

/**
 * Agregat tunggal: total quantity_used dari batch yang COMPLETED/RELEASED.
 * Lewat RPC SECURITY DEFINER — batch_inputs/production_batches admin-only
 * RLS akan mengembalikan 0 baris untuk klien anon jika diquery langsung.
 */
async function aggregateWasteProcessed(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { data, error } = await supabase.rpc("get_public_impact_waste_processed");

  if (error) {
    console.error("[impact] waste_processed error:", error.message);
    return { value: null, status: "error" };
  }

  if (data === null || data === undefined) {
    return { value: null, status: "no_data" };
  }

  return { value: Math.round(Number(data) * 100) / 100, status: "available" };
}

/**
 * Agregat tunggal: COUNT batch produksi COMPLETED atau RELEASED.
 * Lewat RPC SECURITY DEFINER — production_batches admin-only RLS akan
 * mengembalikan 0 baris untuk klien anon jika diquery langsung.
 */
async function aggregateProductionBatchesCompleted(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { data, error } = await supabase.rpc("get_public_impact_batches_completed_count");

  if (error) {
    console.error(
      "[impact] production_batches_completed error:",
      error.message
    );
    return { value: null, status: "error" };
  }

  const count = data === null || data === undefined ? null : Number(data);

  if (count === null || count === 0) {
    return { value: null, status: "no_data" };
  }

  return { value: count, status: "available" };
}

/**
 * Agregat tunggal: SUM amount dari social_allocations APPROVED.
 * Nilai dalam integer Rupiah (minor units).
 * Lewat RPC SECURITY DEFINER — social_allocations admin-only RLS akan
 * mengembalikan 0 baris untuk klien anon jika diquery langsung.
 */
async function aggregateSocialAllocationTotal(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { data, error } = await supabase.rpc("get_public_impact_social_allocation_total");

  if (error) {
    console.error("[impact] social_allocation_total error:", error.message);
    return { value: null, status: "error" };
  }

  if (data === null || data === undefined) {
    return { value: null, status: "no_data" };
  }

  return { value: Number(data), status: "available" };
}

/**
 * Agregat tunggal: COUNT program sosial yang dipublikasikan dan aktif/selesai.
 */
async function aggregateSocialProgramsCount(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { count, error } = await supabase
    .from("social_programs")
    .select("id", { count: "exact", head: true })
    .eq("public_status", true)
    .in("status", [
      "ACTIVE",
      "FUNDED",
      "PARTIALLY_FUNDED",
      "DISTRIBUTED",
      "COMPLETED",
    ]);

  if (error) {
    console.error("[impact] social_programs_count error:", error.message);
    return { value: null, status: "error" };
  }

  if (count === null || count === 0) {
    return { value: null, status: "no_data" };
  }

  return { value: count, status: "available" };
}

/**
 * Agregat tunggal: COUNT donasi yang status ≥ VERIFIED.
 * Lewat RPC SECURITY DEFINER — query langsung ke `donations` dari klien anon
 * hanya melihat baris user_id IS NULL (donasi anonim) karena RLS
 * `donations_owner_read`, sehingga akan meng-undercount donasi member yang
 * login. Lihat catatan boundary RLS di header file ini.
 */
async function aggregateDonationsVerified(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ value: number | null; status: MetricStatus }> {
  const { data, error } = await supabase.rpc("get_public_impact_donations_verified_count");

  if (error) {
    console.error("[impact] donations_verified error:", error.message);
    return { value: null, status: "error" };
  }

  const count = data === null || data === undefined ? null : Number(data);

  if (count === null || count === 0) {
    return { value: null, status: "no_data" };
  }

  return { value: count, status: "available" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fungsi utama publik
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mengambil semua metrik publik dari database dan mengembalikan ringkasan
 * impact yang dapat langsung ditampilkan di halaman /dampak dan /transparansi.
 *
 * Dipanggil HANYA dari Server Components — tidak pernah diekspos ke client.
 *
 * @returns PublicImpactSummary dengan nilai setiap metrik dan statusnya.
 */
export async function getPublicImpactSummary(): Promise<PublicImpactSummary> {
  const supabase = await createClient();
  const computedAt = new Date().toISOString();

  // Jalankan semua agregasi secara paralel untuk efisiensi
  const [
    wasteOilResult,
    wasteOrganicResult,
    wasteProcessedResult,
    batchesResult,
    allocationResult,
    programsResult,
    donationsResult,
  ] = await Promise.all([
    aggregateWasteCollectedLiters(supabase),
    aggregateWasteCollectedKg(supabase),
    aggregateWasteProcessed(supabase),
    aggregateProductionBatchesCompleted(supabase),
    aggregateSocialAllocationTotal(supabase),
    aggregateSocialProgramsCount(supabase),
    aggregateDonationsVerified(supabase),
  ]);

  const makeMetric = (
    slug: MetricSlug,
    result: { value: number | null; status: MetricStatus }
  ): PublicMetricValue => ({
    slug,
    definition: METRIC_DEFINITIONS[slug],
    value: result.value,
    status: result.status,
    computedAt,
    period: { from: null, to: null },
  });

  const metrics: Record<MetricSlug, PublicMetricValue> = {
    waste_collected_liters: makeMetric(
      "waste_collected_liters",
      wasteOilResult
    ),
    waste_collected_kg: makeMetric("waste_collected_kg", wasteOrganicResult),
    waste_processed: makeMetric("waste_processed", wasteProcessedResult),
    production_batches_completed: makeMetric(
      "production_batches_completed",
      batchesResult
    ),
    social_allocation_total: makeMetric(
      "social_allocation_total",
      allocationResult
    ),
    social_programs_count: makeMetric("social_programs_count", programsResult),
    donations_verified: makeMetric("donations_verified", donationsResult),
  };

  return {
    metrics,
    computedAt,
    dataFreshness: "live",
    period: { from: null, to: null },
  };
}

// formatMetricValue moved to ./format.ts (Phase 14 audit) — it's a pure,
// dependency-free formatting helper with no reason to live in the same
// module as server-only Supabase data fetching. Re-exported here so
// existing imports (app/dampak/page.tsx, app/transparansi/page.tsx) keep
// working without change.
export { formatMetricValue } from "./format";
