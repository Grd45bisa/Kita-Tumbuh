import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { faqItems } from "@/lib/content/faq";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pertanyaan Umum (FAQ) — SEMAI",
  description:
    "Jawaban atas pertanyaan umum seputar donasi limbah, jenis limbah yang diterima, pickup/drop-off, pengolahan, dan privasi data.",
  alternates: {
    canonical: `${env.siteUrl}/faq`,
  },
  openGraph: {
    title: "Pertanyaan Umum (FAQ) — SEMAI",
    description:
      "Jawaban atas pertanyaan umum seputar donasi limbah dan cara kerja SEMAI.",
    url: `${env.siteUrl}/faq`,
    type: "website",
  },
};

export default function FaqPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "FAQ" },
  ];

  // FAQPage structured data — safe to include because every question/answer
  // pair here is genuinely rendered as visible text via FaqAccordion, not
  // hidden behind a client-only fetch.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />

      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>SEMAI · INCLUSIVE CIRCULAR SMART FARMING</p>
            <h1 className={styles.title}>Pertanyaan Umum</h1>
            <p className={styles.lead}>
              Jawaban singkat untuk pertanyaan yang paling sering muncul seputar donasi,
              limbah, penjemputan, pengolahan, dan privasi data.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.main}>
        <Container>
          <div className={styles.list}>
            <FaqAccordion items={faqItems} />
          </div>
        </Container>
      </section>
    </main>
  );
}
