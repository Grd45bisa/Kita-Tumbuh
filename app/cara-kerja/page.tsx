import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkButton } from "@/components/ui/LinkButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { howItWorksSteps } from "@/lib/content/how-it-works";
import { getWasteTypes } from "@/lib/domain/waste-types";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cara Kerja — SEMAI · Room to Grow",
  description:
    "Pelajari alur donasi limbah dari rumah hingga menjadi produk bernilai dan dukungan bagi anak-anak difabel: donasikan, verifikasi, olah, jual, dan alokasikan ke program sosial.",
  alternates: {
    canonical: `${env.siteUrl}/cara-kerja`,
  },
  openGraph: {
    title: "Cara Kerja — SEMAI · Room to Grow",
    description:
      "Lihat bagaimana limbah dari rumahmu diproses menjadi produk bernilai dan manfaat sosial nyata.",
    url: `${env.siteUrl}/cara-kerja`,
    type: "website",
  },
};

export default async function CaraKerjaPage() {
  let wasteTypes: Awaited<ReturnType<typeof getWasteTypes>> = [];
  let fetchFailed = false;

  try {
    wasteTypes = await getWasteTypes();
  } catch (error) {
    console.error("[cara-kerja-page] fetch error:", error);
    fetchFailed = true;
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Cara Kerja" },
  ];

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
            <h1 className={styles.title}>Cara Kerja</h1>
            <p className={styles.lead}>
              Limbah yang kamu serahkan menempuh proses yang jelas dan dapat dilacak — dari
              donasi hingga menjadi produk bernilai dan dukungan bagi anak-anak difabel.
            </p>
            <div className={styles.flowDiagram} aria-hidden="true">
              <span className={styles.flowStep}>Limbah</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowStep}>Pengolahan</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowStep}>Produk</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowStep}>Penjualan</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowStep}>Dana sosial</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowStep}>Dampak</span>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Enam tahap perjalanan donasimu</h2>
          <ol className={styles.stepList}>
            {howItWorksSteps.map((step) => (
              <li key={step.number} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {step.number}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <h2 className={styles.sectionTitle}>Apa yang bisa kamu donasikan?</h2>

          {fetchFailed ? (
            <ErrorState
              title="Gagal memuat daftar jenis limbah."
              description="Coba muat ulang halaman ini dalam beberapa saat."
            />
          ) : (
            <div className={styles.wasteGrid}>
              {wasteTypes.map((waste) => (
                <article key={waste.id} className={styles.wasteCard}>
                  <h3 className={styles.wasteCardTitle}>{waste.name}</h3>
                  {waste.description && (
                    <p className={styles.wasteCardText}>{waste.description}</p>
                  )}
                  {waste.accepted_notes && (
                    <>
                      <p className={`${styles.wasteCardLabel} ${styles.acceptedLabel}`}>
                        Diterima jika
                      </p>
                      <p className={styles.wasteCardText}>{waste.accepted_notes}</p>
                    </>
                  )}
                  {waste.rejected_notes && (
                    <>
                      <p className={`${styles.wasteCardLabel} ${styles.rejectedLabel}`}>
                        Tidak diterima
                      </p>
                      <p className={styles.wasteCardText}>{waste.rejected_notes}</p>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}

          <div className={styles.ctaRow}>
            <LinkButton href="/donasikan" variant="primary" size="lg">
              Mulai Donasi
            </LinkButton>
          </div>
        </Container>
      </section>
    </main>
  );
}
