import React from "react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export function FinalCtaSection() {
  return (
    <section
      id="kontak-pos"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-20)",
        backgroundColor: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      <Container>
        <div
          style={{
            backgroundColor: "var(--color-paper-100)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-10) var(--space-6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "960px",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-caption)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-brand-secondary)",
              marginBottom: "var(--space-2)",
            }}
          >
            Aksi Gotong Royong Hari Ini
          </span>

          <h2
            style={{
              fontSize: "var(--font-size-heading-l)",
              lineHeight: "var(--line-height-heading-l)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-4)",
              maxWidth: "680px",
            }}
          >
            Limbah Anda Hari Ini, Mahakarya dan Harapan Nyata Esok Hari
          </h2>

          <blockquote
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--font-size-body-l)",
              color: "var(--color-green-800)",
              fontWeight: "var(--font-weight-medium)",
              padding: "var(--space-2) var(--space-4)",
              marginBottom: "var(--space-6)",
            }}
          >
            &ldquo;SAMPAH KALIAN SANGAT BERARTI BAGI KAMI&rdquo;
          </blockquote>

          <p
            style={{
              fontSize: "var(--font-size-body-m)",
              color: "var(--color-text-secondary)",
              maxWidth: "580px",
              lineHeight: "var(--line-height-body-m)",
              marginBottom: "var(--space-8)",
            }}
          >
            Mulai pisahkan minyak jelantah dan sisa dapur di rumah. Percayakan bahan-bahan tersebut ke tangan kawan-kawan istimewa untuk bertransformasi menjadi karya penuh manfaat bagi sesama.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4)",
              justifyContent: "center",
            }}
          >
            <LinkButton href="/donasikan" variant="primary" size="lg">
              Donasikan Limbah Sekarang
            </LinkButton>
            <LinkButton href="#smart-farming" variant="secondary" size="lg">
              Kenali Lebih Lanjut
            </LinkButton>
          </div>

          <p
            style={{
              fontSize: "var(--font-size-caption)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-6)",
            }}
          >
            Pos Pengumpulan Komunitas: Buka Senin – Sabtu, pukul 08.00 – 16.00 WIB.
          </p>
        </div>
      </Container>
    </section>
  );
}
