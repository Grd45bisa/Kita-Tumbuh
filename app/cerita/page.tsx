import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cerita — SEMAI · Room to Grow",
  description:
    "Cerita dari perjalanan donasi limbah dan proses berkarya anak-anak difabel di SEMAI — sedang kami siapkan.",
  alternates: {
    canonical: `${env.siteUrl}/cerita`,
  },
  openGraph: {
    title: "Cerita — SEMAI · Room to Grow",
    description:
      "Cerita dari perjalanan donasi limbah dan proses berkarya anak-anak difabel di SEMAI.",
    url: `${env.siteUrl}/cerita`,
    type: "website",
  },
};

export default function CeritaPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Cerita" },
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
            <h1 className={styles.title}>Cerita</h1>
            <p className={styles.lead}>
              Kisah nyata di balik proses donasi limbah dan kegiatan berkarya anak-anak
              difabel bersama kami.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <ComingSoon
            title="Cerita sedang kami siapkan"
            description="Setiap cerita yang kami tampilkan memerlukan persetujuan (consent) dari orang yang terlibat sebelum dipublikasikan, agar privasi dan martabat mereka tetap terjaga. Kamu bisa melihat gambaran kegiatan kami di galeri pada halaman utama."
            action={{ label: "Lihat Galeri di Beranda", href: "/#galeri" }}
          />
        </Container>
      </section>
    </main>
  );
}
