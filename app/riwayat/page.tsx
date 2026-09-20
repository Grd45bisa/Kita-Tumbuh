import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MemberLayout } from "@/components/member/MemberLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DONATION_STATUS_LABELS,
  WASTE_TYPE_LABELS,
  type DonationStatus,
} from "@/types/donation";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Riwayat Donasi | KITA TUMBUH",
  description: "Daftar riwayat donasi limbah yang pernah Anda salurkan melalui KITA TUMBUH.",
  robots: {
    index: false,
    follow: false,
  },
};

interface RiwayatPageProps {
  searchParams: Promise<{
    status?: string;
    waste_type?: string;
    method?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function RiwayatPage({ searchParams }: RiwayatPageProps) {
  const user = await requireUser("/riwayat");
  const params = await searchParams;

  const currentStatus = params.status || "";
  const currentWasteType = params.waste_type || "";
  const currentMethod = params.method || "";
  const currentFrom = params.from || "";
  const currentTo = params.to || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  const supabase = await createClient();

  let query = supabase
    .from("donations")
    .select(
      "id, reference_number, waste_type, delivery_method, status, estimated_quantity, verified_quantity, unit, created_at",
      { count: "exact" }
    )
    .eq("user_id", user.id);

  if (currentStatus) {
    query = query.eq("status", currentStatus);
  }
  if (currentWasteType) {
    query = query.eq("waste_type", currentWasteType);
  }
  if (currentMethod) {
    query = query.eq("delivery_method", currentMethod);
  }
  if (currentFrom) {
    query = query.gte("created_at", `${currentFrom}T00:00:00.000Z`);
  }
  if (currentTo) {
    query = query.lte("created_at", `${currentTo}T23:59:59.999Z`);
  }

  const { data: donations, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const buildFilterUrl = (newParams: Record<string, string>) => {
    const p = new URLSearchParams();
    if (currentStatus) p.set("status", currentStatus);
    if (currentWasteType) p.set("waste_type", currentWasteType);
    if (currentMethod) p.set("method", currentMethod);
    if (currentFrom) p.set("from", currentFrom);
    if (currentTo) p.set("to", currentTo);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    return `/riwayat?${p.toString()}`;
  };

  const hasActiveFilter = Boolean(
    currentStatus || currentWasteType || currentMethod || currentFrom || currentTo
  );

  return (
    <MemberLayout activeKey="riwayat" user={user}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.greeting}>Riwayat Donasi</h1>
        <p className={styles.subgreeting}>
          Pantau seluruh jejak dan status penyaluran limbah yang telah kamu daftarkan.
        </p>
      </div>

      {/* Filter Bar (Search params driven) */}
      <form method="GET" action="/riwayat" className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="status" className={styles.filterLabel}>
            Status Donasi
          </label>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            className={styles.filterSelect}
          >
            <option value="">Semua Status</option>
            {Object.entries(DONATION_STATUS_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="waste_type" className={styles.filterLabel}>
            Jenis Limbah
          </label>
          <select
            id="waste_type"
            name="waste_type"
            defaultValue={currentWasteType}
            className={styles.filterSelect}
          >
            <option value="">Semua Jenis</option>
            {Object.entries(WASTE_TYPE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="method" className={styles.filterLabel}>
            Metode Penyerahan
          </label>
          <select
            id="method"
            name="method"
            defaultValue={currentMethod}
            className={styles.filterSelect}
          >
            <option value="">Semua Metode</option>
            <option value="PICKUP">Jemput (Pickup)</option>
            <option value="DROP_OFF">Antar Mandiri (Drop-off)</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="from" className={styles.filterLabel}>
            Dari Tanggal
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={currentFrom}
            max={currentTo || undefined}
            className={styles.filterSelect}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="to" className={styles.filterLabel}>
            Sampai Tanggal
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={currentTo}
            min={currentFrom || undefined}
            className={styles.filterSelect}
          />
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button type="submit" variant="primary" size="md">
            Terapkan
          </Button>
          {hasActiveFilter && (
            <Link href="/riwayat">
              <Button type="button" variant="tertiary" size="md">
                Reset
              </Button>
            </Link>
          )}
        </div>
      </form>

      {/* List / Empty State */}
      {!donations || donations.length === 0 ? (
        <EmptyState
          title={hasActiveFilter ? "Tidak Ada Donasi yang Cocok" : "Belum Ada Donasi Terdaftar"}
          description={
            hasActiveFilter
              ? "Coba ubah kriteria filter di atas untuk melihat donasi lainnya."
              : "Riwayat donasimu akan muncul di sini setelah kamu mendaftarkan penyerahan limbah."
          }
          action={hasActiveFilter ? undefined : { label: "Donasikan Sekarang", href: "/donasikan" }}
        />
      ) : (
        <>
          <div className={styles.donationList}>
            {donations.map((d) => (
              <Link key={d.id} href={`/donasi/${d.reference_number}`} className={styles.donationItem}>
                <div className={styles.donationMain}>
                  <div className={styles.donationRef}>#{d.reference_number}</div>
                  <div className={styles.donationMeta}>
                    <span>{WASTE_TYPE_LABELS[d.waste_type] || d.waste_type}</span>
                    <span>•</span>
                    <span>{d.delivery_method === "PICKUP" ? "Jemput (Pickup)" : "Antar Mandiri"}</span>
                    <span>•</span>
                    <span>
                      {new Date(d.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className={styles.donationStatusArea}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-ink-muted)" }}>
                    {d.verified_quantity != null
                      ? `${d.verified_quantity} ${d.unit}`
                      : `Est. ~${d.estimated_quantity} ${d.unit}`}
                  </span>
                  <Badge
                    variant={d.status === "IMPACTED" ? "success" : "neutral"}
                  >
                    {DONATION_STATUS_LABELS[d.status as DonationStatus] || d.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "var(--space-3)",
                marginTop: "var(--space-6)",
              }}
            >
              {currentPage > 1 && (
                <Link href={buildFilterUrl({ page: (currentPage - 1).toString() })}>
                  <Button variant="secondary" size="sm">
                    ← Sebelumnya
                  </Button>
                </Link>
              )}
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-ink-muted)" }}>
                Halaman {currentPage} dari {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link href={buildFilterUrl({ page: (currentPage + 1).toString() })}>
                  <Button variant="secondary" size="sm">
                    Selanjutnya →
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </MemberLayout>
  );
}
