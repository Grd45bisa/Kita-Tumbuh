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
  title: "Transparansi — SEMAI · Room to Grow",
  description:
    "Prinsip pencatatan dan ringkasan operasional SEMAI — setiap angka dapat ditelusuri ke sumbernya.",
  alternates: {
    canonical: `${env.siteUrl}/transparansi`,
  },
  openGraph: {
    title: "Transparansi — SEMAI",
    description:
      "Kami memisahkan estimasi dari verifikasi, operasional dari sosial, dan mempublikasikan hanya angka yang dapat diverifikasi.",
    url: `${env.siteUrl}/transparansi`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

// ─── Data definisi ──────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    title: "Estimasi dan verifikasi selalu terpisah",
    body: "Perkiraan jumlah yang diisi donatur saat mengajukan donasi dan jumlah aktual yang diukur saat penerimaan fisik selalu dicatat sebagai dua angka berbeda. Tidak ada percampuran keduanya.",
  },
  {
    title: "Angka publik hanya dari data terverifikasi",
    body: "Ringkasan dampak yang ditampilkan di halaman Dampak hanya berasal dari catatan operasional yang telah melewati verifikasi fisik oleh operator — bukan perkiraan, bukan target, bukan asumsi.",
  },
  {
    title: "Biaya operasional tidak disamarkan sebagai dana sosial",
    body: "Pengeluaran operasional (transportasi, bahan baku, utilitas) dicatat dalam kategori terpisah. Alokasi sosial hanya mencakup dana yang secara eksplisit dialokasikan untuk program pemberdayaan masyarakat.",
  },
  {
    title: "Akuntansi bersifat pooled, bukan satu-ke-satu",
    body: "Pendapatan dari penjualan seluruh produk sirkular digabung sebelum sebagian dialokasikan ke program sosial. Kami tidak mengklaim bahwa donasi spesifik kamu menghasilkan produk spesifik atau mengbiayai program spesifik.",
  },
  {
    title: "Jejak status donasi dapat ditelusuri",
    body: "Setiap perubahan status donasi — dari pengajuan hingga diverifikasi, disortir, diproses — tercatat dalam riwayat audit yang menyimpan kapan perubahan terjadi.",
  },
  {
    title: "Penerima manfaat dilindungi privasinya",
    body: "Data sensitif penerima manfaat (nama lengkap, alamat, identitas) tidak dipublikasikan. Ringkasan distribusi hanya menampilkan program dan jumlah, bukan identitas individu.",
  },
];

const METRIC_METHODOLOGY = [
  {
    metric: "Donasi Terverifikasi",
    source: "Tabel donations",
    filter:
      "status IN (VERIFIED, SORTED, PROCESSED, CONVERTED, IMPACTED)",
    column: "COUNT(id)",
    note: "Hanya donasi yang sudah diverifikasi secara fisik oleh operator.",
  },
  {
    metric: "Minyak Jelantah Diterima",
    source: "Tabel donations",
    filter:
      "status ≥ VERIFIED, waste_type_slug = minyak-jelantah, verified_quantity NOT NULL",
    column: "SUM(verified_quantity)",
    note: "Menggunakan verified_quantity — bukan estimated_quantity dari donatur.",
  },
  {
    metric: "Limbah Organik Diterima",
    source: "Tabel donations",
    filter:
      "status ≥ VERIFIED, waste_type_slug = limbah-organik, verified_quantity NOT NULL",
    column: "SUM(verified_quantity)",
    note: "Menggunakan verified_quantity — bukan estimated_quantity dari donatur.",
  },
  {
    metric: "Limbah Diproses",
    source: "Tabel batch_inputs → production_batches",
    filter: "production_batches.status IN (COMPLETED, RELEASED)",
    column: "SUM(quantity_used)",
    note: "Batch yang masih IN_PROGRESS atau QC_REVIEW belum dihitung.",
  },
  {
    metric: "Batch Produksi Selesai",
    source: "Tabel production_batches",
    filter: "status IN (COMPLETED, RELEASED)",
    column: "COUNT(id)",
    note: "—",
  },
  {
    metric: "Alokasi Dana Sosial",
    source: "Tabel social_allocations",
    filter: "approval_status = APPROVED",
    column: "SUM(amount)",
    note: "Nilai dalam Rupiah. Biaya operasional tidak termasuk. Akuntansi pooled.",
  },
  {
    metric: "Program Sosial",
    source: "Tabel social_programs",
    filter: "public_status = TRUE, status IN (ACTIVE, FUNDED, ...)",
    column: "COUNT(id)",
    note: "Program internal/draft tidak dihitung.",
  },
];

const DOMAIN_CHAIN = [
  "Donasi",
  "Penerimaan & Verifikasi",
  "Lot Inventaris",
  "Batch Produksi",
  "Produk Sirkular",
  "Penjualan",
  "Pendapatan",
  "Alokasi Sosial",
  "Program Sosial",
  "Distribusi ke Penerima Manfaat",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function PrincipleList() {
  return (
    <ul className={styles.principleList}>
      {PRINCIPLES.map((p) => (
        <li key={p.title} className={styles.principleItem}>
          <span className={styles.principleCheck} aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="8" fill="var(--color-green-100)" />
              <path
                d="M4.5 8L7 10.5L11.5 6"
                stroke="var(--color-green-700)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className={styles.principleTitle}>{p.title}</p>
            <p className={styles.principleBody}>{p.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DomainChain() {
  return (
    <div className={styles.chainWrapper} aria-label="Rantai domain sistem">
      <ol className={styles.chainList}>
        {DOMAIN_CHAIN.map((step, i) => (
          <li key={step} className={styles.chainItem}>
            <span className={styles.chainStep}>{step}</span>
            {i < DOMAIN_CHAIN.length - 1 && (
              <span className={styles.chainArrow} aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function MethodologyTable() {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>
          Definisi dan sumber setiap metrik publik
        </caption>
        <thead>
          <tr>
            <th className={styles.th}>Metrik</th>
            <th className={styles.th}>Tabel Sumber</th>
            <th className={styles.th}>Filter</th>
            <th className={styles.th}>Kolom / Rumus</th>
            <th className={styles.th}>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {METRIC_METHODOLOGY.map((row) => (
            <tr key={row.metric} className={styles.tr}>
              <td className={`${styles.td} ${styles.tdMetric}`}>
                {row.metric}
              </td>
              <td className={styles.td}>
                <code className={styles.code}>{row.source}</code>
              </td>
              <td className={styles.td}>
                <code className={styles.code}>{row.filter}</code>
              </td>
              <td className={styles.td}>
                <code className={styles.code}>{row.column}</code>
              </td>
              <td className={styles.td}>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OperationalSummary({
  summary,
}: {
  summary: PublicImpactSummary | null;
}) {
  if (!summary) {
    return (
      <p className={styles.summaryEmpty}>
        Ringkasan operasional tidak dapat dimuat saat ini.
      </p>
    );
  }

  const m = summary.metrics;
  const date = new Date(summary.computedAt);
  const formatted = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);

  const rows = [
    {
      label: METRIC_DEFINITIONS.donations_verified.label,
      metric: m.donations_verified,
      unit: METRIC_DEFINITIONS.donations_verified.unit,
    },
    {
      label: METRIC_DEFINITIONS.waste_collected_liters.label,
      metric: m.waste_collected_liters,
      unit: METRIC_DEFINITIONS.waste_collected_liters.unit,
    },
    {
      label: METRIC_DEFINITIONS.waste_collected_kg.label,
      metric: m.waste_collected_kg,
      unit: METRIC_DEFINITIONS.waste_collected_kg.unit,
    },
    {
      label: METRIC_DEFINITIONS.waste_processed.label,
      metric: m.waste_processed,
      unit: METRIC_DEFINITIONS.waste_processed.unit,
    },
    {
      label: METRIC_DEFINITIONS.production_batches_completed.label,
      metric: m.production_batches_completed,
      unit: METRIC_DEFINITIONS.production_batches_completed.unit,
    },
    {
      label: METRIC_DEFINITIONS.social_allocation_total.label,
      metric: m.social_allocation_total,
      unit: METRIC_DEFINITIONS.social_allocation_total.unit,
    },
    {
      label: METRIC_DEFINITIONS.social_programs_count.label,
      metric: m.social_programs_count,
      unit: METRIC_DEFINITIONS.social_programs_count.unit,
    },
  ] as const;

  return (
    <div className={styles.summaryBlock}>
      <p className={styles.summaryMeta}>
        Dihitung langsung dari database saat halaman dimuat.{" "}
        <time dateTime={summary.computedAt}>
          Terakhir dihitung: {formatted} WIB
        </time>
        .
      </p>
      <div className={styles.summaryTable}>
        {rows.map(({ label, metric, unit }) => (
          <div key={label} className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{label}</span>
            <span
              className={`${styles.summaryValue} ${metric.status !== "available" ? styles.summaryValueEmpty : ""}`}
            >
              {metric.status === "available" && metric.value !== null
                ? formatMetricValue(metric.value, unit)
                : metric.status === "error"
                  ? "Tidak tersedia"
                  : "Belum ada data"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TransparansiPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Transparansi" },
  ];

  let summary: PublicImpactSummary | null = null;
  try {
    summary = await getPublicImpactSummary();
  } catch (err) {
    console.error("[transparansi] getPublicImpactSummary failed:", err);
  }

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
            <p className={styles.eyebrow}>SEMAI · INCLUSIVE CIRCULAR SMART FARMING</p>
            <h1 className={styles.title}>Transparansi</h1>
            <p className={styles.lead}>
              Kami berkomitmen mempublikasikan hanya angka yang dapat
              ditelusuri ke sumber operasionalnya — memisahkan estimasi dari
              verifikasi, dan operasional dari sosial.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Prinsip Pencatatan ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Prinsip Pencatatan</h2>
          <PrincipleList />
        </Container>
      </section>

      {/* ── Ringkasan Operasional ─────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <h2 className={styles.sectionTitle}>Ringkasan Operasional</h2>
          <p className={styles.sectionLead}>
            Data berikut diambil langsung dari database operasional. Setiap
            angka memiliki definisi yang dapat diverifikasi — tidak ada
            estimasi yang disamarkan sebagai angka nyata.
          </p>
          <OperationalSummary summary={summary} />
          <p className={styles.dampakLink}>
            Lihat visualisasi lengkap beserta metodologi di{" "}
            <a href="/dampak" className={styles.inlineLink}>
              halaman Dampak
            </a>
            .
          </p>
        </Container>
      </section>

      {/* ── Rantai Domain ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Rantai Keterlacakan</h2>
          <p className={styles.sectionLead}>
            Sistem kami menjaga keterlacakan sepanjang rantai berikut. Setiap
            tahap memiliki catatan yang dapat diverifikasi — tidak ada
            &ldquo;lompatan&rdquo; dalam jalur dari donasi ke dampak.
          </p>
          <DomainChain />
        </Container>
      </section>

      {/* ── Metodologi ────────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <h2 className={styles.sectionTitle}>Metodologi Perhitungan Metrik</h2>
          <p className={styles.sectionLead}>
            Tabel berikut mendokumentasikan sumber data, filter, dan rumus
            untuk setiap metrik yang dipublikasikan. Tidak ada metrik yang
            dipublikasikan tanpa definisi yang tercatat di sini.
          </p>
          <MethodologyTable />
        </Container>
      </section>

      {/* ── Keterbatasan & Catatan ────────────────────────────────────────── */}
      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Keterbatasan &amp; Catatan Operasional</h2>
          <div className={styles.caveatsGrid}>
            <div className={styles.caveatItem}>
              <h3 className={styles.caveatTitle}>
                Data bersifat kumulatif (all-time)
              </h3>
              <p className={styles.caveatText}>
                Saat ini metrik ditampilkan sebagai total kumulatif sejak awal
                operasi. Filter per periode (bulan/tahun) akan tersedia pada
                iterasi berikutnya.
              </p>
            </div>
            <div className={styles.caveatItem}>
              <h3 className={styles.caveatTitle}>
                Metrik &ldquo;Belum ada data&rdquo; bukan angka nol
              </h3>
              <p className={styles.caveatText}>
                Ketika sebuah metrik menampilkan &ldquo;Belum ada data&rdquo;,
                artinya proses operasional untuk kategori tersebut belum
                menghasilkan catatan terverifikasi — bukan bahwa nilainya nol.
                Kami tidak mengisi nol untuk menghindari kesan palsu.
              </p>
            </div>
            <div className={styles.caveatItem}>
              <h3 className={styles.caveatTitle}>
                Akuntansi pooled — tidak ada 1:1
              </h3>
              <p className={styles.caveatText}>
                Pendapatan dari penjualan produk sirkular digabungkan sebelum
                alokasi sosial dihitung. Kami tidak mengklaim bahwa donasi
                spesifik menghasilkan produk spesifik atau mendanai program
                spesifik.
              </p>
            </div>
            <div className={styles.caveatItem}>
              <h3 className={styles.caveatTitle}>Laporan periodik</h3>
              <p className={styles.caveatText}>
                Laporan periodik (bulanan/triwulan) yang mencakup rangkuman
                operasional dan alokasi sosial sedang dalam perencanaan dan
                akan dipublikasikan setelah sistem pelaporan selesai.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionCta}`}>
        <Container>
          <div className={styles.ctaBlock}>
            <p className={styles.ctaTagline}>
              Dari Limbah, Tumbuh Manfaat.
            </p>
            <p className={styles.ctaText}>
              Kontribusi kamu dapat dilacak — dari saat diterima hingga
              menjadi produk dan program sosial.
            </p>
            <div className={styles.ctaActions}>
              <a href="/donasikan" className={styles.ctaButtonPrimary}>
                Donasikan Limbahmu
              </a>
              <a href="/dampak" className={styles.ctaButtonSecondary}>
                Lihat Dampak
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
