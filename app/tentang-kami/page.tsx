import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkButton } from "@/components/ui/LinkButton";
import { organizationContent } from "@/lib/content/organization";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tentang Kami — Kampung Setara Smart Farming",
  description:
    "KITA TUMBUH — Kampung Setara Smart Farming mengolah limbah rumah tangga menjadi produk bernilai dan ruang belajar bagi anak-anak difabel.",
  alternates: {
    canonical: `${env.siteUrl}/tentang-kami`,
  },
  openGraph: {
    title: "Tentang Kami — Kampung Setara Smart Farming",
    description:
      "Kenali misi, visi, dan nilai yang menggerakkan Kampung Setara Smart Farming.",
    url: `${env.siteUrl}/tentang-kami`,
    type: "website",
  },
};

export default function TentangKamiPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Tentang Kami" },
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
            <p className={styles.eyebrow}>KITA TUMBUH — KAMPUNG SETARA SMART FARMING</p>
            <h1 className={styles.title}>Tentang Kami</h1>
            <p className={styles.lead}>
              Sampah kalian sangat berarti bagi kami — karena yang tersisa di rumahmu masih
              bisa menjadi sesuatu yang berarti bagi orang lain.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <div className={styles.twoCol}>
            <div>
              <p className={styles.blockLabel}>Misi</p>
              <h2 className={styles.blockTitle}>Apa yang kami kerjakan</h2>
              <p className={styles.blockText}>{organizationContent.mission}</p>
            </div>
            <div>
              <p className={styles.blockLabel}>Visi</p>
              <h2 className={styles.blockTitle}>Yang kami percaya</h2>
              <p className={styles.blockText}>{organizationContent.vision}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <p className={styles.blockLabel}>Nilai</p>
          <h2 className={styles.blockTitle}>Yang memandu cara kami bekerja</h2>
          <div className={styles.valuesGrid}>
            {organizationContent.values.map((value) => (
              <article key={value.title} className={styles.valueCard}>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueText}>{value.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <p className={styles.blockLabel}>Pendekatan operasional</p>
          <h2 className={styles.blockTitle}>Bagaimana prosesnya berjalan</h2>
          <p className={styles.blockText}>{organizationContent.operationalApproach}</p>

          <div className={styles.ctaRow}>
            <LinkButton href="/cara-kerja" variant="secondary" size="lg">
              Lihat Cara Kerja Lengkap
            </LinkButton>
          </div>
        </Container>
      </section>
    </main>
  );
}
