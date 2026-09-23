import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { getPublicPrograms } from "@/lib/domain/social-programs";
import { SOCIAL_PROGRAM_STATUS_LABELS } from "@/lib/validation/social-schema";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Program Sosial — SEMAI",
  description:
    "Program pemberdayaan sosial yang didukung oleh hasil ekonomi SEMAI.",
  alternates: {
    canonical: `${env.siteUrl}/program`,
  },
  openGraph: {
    title: "Program Sosial — SEMAI",
    description:
      "Program pemberdayaan sosial yang didukung oleh hasil ekonomi SEMAI.",
    url: `${env.siteUrl}/program`,
    type: "website",
  },
};

export default async function ProgramPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Program Sosial" },
  ];

  const programs = await getPublicPrograms();
  const hasPrograms = programs.length > 0;

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>SEMAI · INCLUSIVE CIRCULAR SMART FARMING</p>
            <h1 className={styles.title}>Program Sosial</h1>
            <p className={styles.lead}>
              Hasil ekonomi dari pengolahan limbah dan kebun smart farming kami arahkan untuk
              mendukung ruang belajar, berkarya, dan kemandirian anak-anak difabel.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          {hasPrograms ? (
            <div className={styles.programGrid}>
              {programs.map((p) => (
                <article key={p.id} className={styles.programCard}>
                  <span className={styles.programStatus}>{SOCIAL_PROGRAM_STATUS_LABELS[p.status]}</span>
                  <h2 className={styles.programName}>{p.name}</h2>
                  <p className={styles.programGoal}>{p.goal}</p>
                  <p className={styles.programDescription}>{p.description}</p>
                  <div className={styles.programFooter}>
                    <span className={styles.programAllocated}>
                      Dana teralokasi: Rp {p.allocated_amount.toLocaleString("id-ID")}
                      {p.target_amount ? ` / Rp ${p.target_amount.toLocaleString("id-ID")}` : ""}
                    </span>
                    <Link href={`/program/${p.slug}`} className={styles.programLink}>
                      Lihat Detail →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <>
              <p className={styles.blockText}>
                Kami sedang menyusun daftar program secara terstruktur — lengkap dengan tujuan,
                status, dan sumber pendanaan masing-masing — agar setiap program yang ditampilkan
                benar-benar dapat dipertanggungjawabkan datanya.
              </p>

              <ComingSoon
                title="Daftar program sedang kami siapkan"
                description="Kami ingin setiap program yang ditampilkan di sini punya tujuan, status, dan sumber dana yang jelas dan dapat diverifikasi. Untuk memahami bagaimana hasil donasimu dialokasikan, lihat penjelasan alur di halaman Cara Kerja."
                action={{ label: "Lihat Cara Kerja", href: "/cara-kerja" }}
              />
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
