import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getPublicProgramBySlug } from "@/lib/domain/social-programs";
import { SOCIAL_PROGRAM_STATUS_LABELS } from "@/lib/validation/social-schema";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getPublicProgramBySlug(slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan — Kampung Smart Farming",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${env.siteUrl}/program/${encodeURIComponent(slug)}`;

  return {
    title: `${program.name} — Program Sosial KITA TUMBUH`,
    description: program.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${program.name} — Program Sosial KITA TUMBUH`,
      description: program.description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getPublicProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Program Sosial", href: "/program" },
    { label: program.name },
  ];

  const progressPercent = program.target_amount
    ? Math.min(100, Math.round((program.allocated_amount / program.target_amount) * 100))
    : null;

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      <section className={styles.section}>
        <Container>
          <Breadcrumb items={breadcrumbItems} />

          <div className={styles.header}>
            <span className={styles.status}>{SOCIAL_PROGRAM_STATUS_LABELS[program.status]}</span>
            <h1 className={styles.title}>{program.name}</h1>
            <p className={styles.goal}>{program.goal}</p>
          </div>

          <div className={styles.grid}>
            <article className={styles.descriptionCard}>
              <h2 className={styles.sectionTitle}>Tentang Program</h2>
              <p className={styles.description}>{program.description}</p>

              {(program.start_date || program.end_date) && (
                <p className={styles.dateRange}>
                  {program.start_date && (
                    <>Mulai {new Date(program.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</>
                  )}
                  {program.start_date && program.end_date && " — "}
                  {program.end_date && (
                    <>Berakhir {new Date(program.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</>
                  )}
                </p>
              )}
            </article>

            <aside className={styles.fundingCard}>
              <h2 className={styles.sectionTitle}>Pendanaan</h2>
              <p className={styles.fundingAmount}>
                Rp {program.allocated_amount.toLocaleString("id-ID")}
              </p>
              <p className={styles.fundingLabel}>
                {program.target_amount
                  ? `dari target Rp ${program.target_amount.toLocaleString("id-ID")}`
                  : "dialokasikan (program berkelanjutan tanpa target dana tetap)"}
              </p>

              {progressPercent !== null && (
                <div className={styles.progressTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>
              )}

              <p className={styles.fundingNote}>
                Dana ini bersumber dari alokasi pendapatan penjualan produk hasil olahan limbah sirkular KITA TUMBUH.
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
