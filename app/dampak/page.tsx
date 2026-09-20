import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { env } from "@/lib/env";
import {
  getPublicImpactSummary,
  formatMetricValue,
} from "@/lib/domain/impact/public-impact";
import { METRIC_DEFINITIONS } from "@/lib/domain/impact/definitions";
import type { PublicImpactSummary } from "@/lib/domain/impact/definitions";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dampak — Kampung Smart Farming | KITA TUMBUH",
  description:
    "Ringkasan dampak terverifikasi Kampung Smart Farming — limbah diterima, diolah, produk dihasilkan, dan alokasi sosial berdasarkan data operasional nyata.",
  alternates: {
    canonical: `${env.siteUrl}/dampak`,
  },
  openGraph: {
    title: "Dampak — Kampung Smart Farming",
    description:
      "Angka dampak yang kami tampilkan berasal dari data operasional terverifikasi, bukan perkiraan.",
    url: `${env.siteUrl}/dampak`,
    type: "website",
  },
};

// Server Component — data fetched at request time (no caching)
// Angka harus selalu live agar tidak menyesatkan.
export const dynamic = "force-dynamic";

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  unit,
  status,
  caveat,
}: {
  label: string;
  value: number | null;
  unit: string;
  status: "available" | "no_data" | "error";
  caveat?: string;
}) {
  const isAvailable = status === "available" && value !== null;

  return (
    <div
      className={`${styles.metricCard} ${!isAvailable ? styles.metricCardEmpty : ""}`}
    >
      <p className={styles.metricLabel}>{label}</p>
      {isAvailable ? (
        <p className={styles.metricValue}>{formatMetricValue(value!, unit)}</p>
      ) : (
        <p className={styles.metricValueEmpty}>
          {status === "error" ? "Tidak tersedia" : "Belum ada data"}
        </p>
      )}
      {caveat && isAvailable && (
        <p className={styles.metricCaveat}>{caveat}</p>
      )}
    </div>
  );
}

function DataFreshnessNotice({ computedAt }: { computedAt: string }) {
  const date = new Date(computedAt);
  const formatted = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);

  return (
    <p className={styles.freshnessNotice}>
      Data diperbarui secara langsung — dihitung saat halaman ini dimuat.
      Terakhir dihitung:{" "}
      <time dateTime={computedAt}>{formatted} WIB</time>.
    </p>
  );
}

function ImpactJourneyDiagram() {
  const steps = [
    { label: "Limbah Donasi", sub: "dari rumah tangga" },
    { label: "Penjemputan / Drop-off", sub: "terjadwal oleh operator" },
    { label: "Verifikasi Fisik", sub: "kuantitas aktual dicatat" },
    { label: "Inventaris & Sortir", sub: "lot disimpan di gudang" },
    { label: "Pengolahan", sub: "menjadi produk sirkular" },
    { label: "Penjualan", sub: "pendapatan tercatat" },
    { label: "Alokasi Sosial", sub: "dari pendapatan pooled" },
    { label: "Program & Distribusi", sub: "ke penerima manfaat" },
  ];

  return (
    <div className={styles.journeyWrapper} aria-label="Perjalanan limbah ke dampak">
      <ol className={styles.journeyList}>
        {steps.map((step, i) => (
          <li key={step.label} className={styles.journeyItem}>
            <div className={styles.journeyStep}>
              <span className={styles.journeyNumber} aria-hidden="true">
                {i + 1}
              </span>
              <div className={styles.journeyText}>
                <span className={styles.journeyLabel}>{step.label}</span>
                <span className={styles.journeySub}>{step.sub}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={styles.journeyArrow} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <p className={styles.journeyNote}>
        Akuntansi bersifat <strong>pooled</strong> — pendapatan dari semua
        penjualan diagabungkan sebelum sebagian dialokasikan ke program sosial.
        Tidak ada hubungan satu-ke-satu antara donasi spesifik dan program
        spesifik.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DampakPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Dampak" },
  ];

  let summary: PublicImpactSummary | null = null;
  let fetchError = false;

  try {
    summary = await getPublicImpactSummary();
  } catch (err) {
    console.error("[dampak] getPublicImpactSummary failed:", err);
    fetchError = true;
  }

  const m = summary?.metrics;

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>KITA TUMBUH — KAMPUNG SMART FARMING</p>
            <h1 className={styles.title}>Dampak</h1>
            <p className={styles.lead}>
              Setiap angka di halaman ini berasal dari data operasional yang
              telah diverifikasi secara fisik — bukan perkiraan, bukan target.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Metrik Utama ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ringkasan Dampak</h2>
            {summary && (
              <DataFreshnessNotice computedAt={summary.computedAt} />
            )}
          </div>

          {fetchError ? (
            <div className={styles.errorState} role="alert">
              <p>
                Data dampak tidak dapat dimuat saat ini. Silakan coba lagi
                dalam beberapa saat.
              </p>
            </div>
          ) : (
            <>
              {/* Baris 1: Limbah */}
              <div className={styles.metricGroupLabel}>Limbah</div>
              <div className={styles.metricGrid}>
                <MetricCard
                  label={METRIC_DEFINITIONS.donations_verified.label}
                  value={m?.donations_verified.value ?? null}
                  unit={METRIC_DEFINITIONS.donations_verified.unit}
                  status={m?.donations_verified.status ?? "no_data"}
                />
                <MetricCard
                  label={METRIC_DEFINITIONS.waste_collected_liters.label}
                  value={m?.waste_collected_liters.value ?? null}
                  unit={METRIC_DEFINITIONS.waste_collected_liters.unit}
                  status={m?.waste_collected_liters.status ?? "no_data"}
                  caveat="Jumlah aktual terverifikasi, bukan estimasi donatur"
                />
                <MetricCard
                  label={METRIC_DEFINITIONS.waste_collected_kg.label}
                  value={m?.waste_collected_kg.value ?? null}
                  unit={METRIC_DEFINITIONS.waste_collected_kg.unit}
                  status={m?.waste_collected_kg.status ?? "no_data"}
                  caveat="Jumlah aktual terverifikasi, bukan estimasi donatur"
                />
                <MetricCard
                  label={METRIC_DEFINITIONS.waste_processed.label}
                  value={m?.waste_processed.value ?? null}
                  unit={METRIC_DEFINITIONS.waste_processed.unit}
                  status={m?.waste_processed.status ?? "no_data"}
                />
              </div>

              {/* Baris 2: Produksi & Dampak Sosial */}
              <div className={styles.metricGroupLabel}>Produksi &amp; Sosial</div>
              <div className={styles.metricGrid}>
                <MetricCard
                  label={METRIC_DEFINITIONS.production_batches_completed.label}
                  value={m?.production_batches_completed.value ?? null}
                  unit={METRIC_DEFINITIONS.production_batches_completed.unit}
                  status={m?.production_batches_completed.status ?? "no_data"}
                />
                <MetricCard
                  label={METRIC_DEFINITIONS.social_allocation_total.label}
                  value={m?.social_allocation_total.value ?? null}
                  unit={METRIC_DEFINITIONS.social_allocation_total.unit}
                  status={m?.social_allocation_total.status ?? "no_data"}
                  caveat="Dari pendapatan penjualan produk sirkular (pooled)"
                />
                <MetricCard
                  label={METRIC_DEFINITIONS.social_programs_count.label}
                  value={m?.social_programs_count.value ?? null}
                  unit={METRIC_DEFINITIONS.social_programs_count.unit}
                  status={m?.social_programs_count.status ?? "no_data"}
                />
              </div>

              <p className={styles.noDataNote}>
                Metrik yang menampilkan &ldquo;Belum ada data&rdquo; berarti
                proses operasional untuk kategori tersebut belum menghasilkan
                catatan yang terverifikasi — bukan berarti angkanya nol.
              </p>
            </>
          )}
        </Container>
      </section>

      {/* ── Perjalanan Limbah ke Dampak (P1-804) ──────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <h2 className={styles.sectionTitle}>
            Perjalanan Limbah ke Dampak Sosial
          </h2>
          <p className={styles.sectionLead}>
            Berikut adalah alur lengkap bagaimana limbah rumah tangga
            bertransformasi menjadi produk dan akhirnya mendanai program
            pemberdayaan masyarakat.
          </p>
          <ImpactJourneyDiagram />
        </Container>
      </section>

      {/* ── Metodologi ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Cara Menghitung Angka Ini</h2>

          <div className={styles.methodologyGrid}>
            <div className={styles.methodologyItem}>
              <h3 className={styles.methodologyTitle}>Limbah Diterima</h3>
              <p className={styles.methodologyText}>
                Dihitung dari kolom <code>verified_quantity</code> pada tabel
                donasi — hanya donasi dengan status{" "}
                <strong>VERIFIED ke atas</strong> yang dimasukkan. Perkiraan
                jumlah dari donatur (<code>estimated_quantity</code>) tidak
                pernah digunakan sebagai angka publik.
              </p>
            </div>

            <div className={styles.methodologyItem}>
              <h3 className={styles.methodologyTitle}>Limbah Diproses</h3>
              <p className={styles.methodologyText}>
                Dihitung dari input aktual batch produksi yang berstatus{" "}
                <strong>COMPLETED atau RELEASED</strong>. Batch yang masih dalam
                proses atau QC belum dihitung.
              </p>
            </div>

            <div className={styles.methodologyItem}>
              <h3 className={styles.methodologyTitle}>Alokasi Dana Sosial</h3>
              <p className={styles.methodologyText}>
                Dihitung dari total alokasi dana yang berstatus{" "}
                <strong>APPROVED</strong> dalam catatan alokasi sosial.
                Akuntansi bersifat <em>pooled</em>: pendapatan dari semua
                penjualan digabung, lalu sebagian dialokasikan ke program sosial.
                Biaya operasional tidak termasuk dan tidak disamarkan sebagai
                dana sosial.
              </p>
            </div>

            <div className={styles.methodologyItem}>
              <h3 className={styles.methodologyTitle}>Program Sosial</h3>
              <p className={styles.methodologyText}>
                Hanya program yang memiliki status{" "}
                <strong>public_status = true</strong> dan berada dalam tahap
                aktif, didanai, atau selesai yang ditampilkan di sini.
                Program internal dalam draft atau review tidak dihitung.
              </p>
            </div>
          </div>

          <div className={styles.transparencyLink}>
            <p>
              Ingin melihat laporan periodik dan prinsip pencatatan kami secara
              lebih rinci?{" "}
              <a href="/transparansi" className={styles.inlineLink}>
                Baca halaman Transparansi
              </a>
              .
            </p>
          </div>
        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionCta}`}>
        <Container>
          <div className={styles.ctaBlock}>
            <h2 className={styles.ctaTitle}>Limbah kamu sangat berarti bagi kami</h2>
            <p className={styles.ctaText}>
              Setiap liter minyak jelantah dan setiap kilogram limbah organik
              yang kamu donasikan menjadi bagian dari siklus nyata ini.
            </p>
            <a href="/donasikan" className={styles.ctaButton}>
              Donasikan Limbahmu
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
