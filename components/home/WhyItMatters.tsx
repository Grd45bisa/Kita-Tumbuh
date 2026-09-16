import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export function WhyItMatters() {
  return (
    <section
      id="mengapa-penting"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-16)",
        backgroundColor: "var(--color-bg-canvas)",
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Mengapa Ini Penting"
          title="Sesuatu yang tidak lagi kamu butuhkan, masih memiliki nilai besar bagi orang lain."
          description="Masalah sampah bukan semata soal kebersihan, melainkan potensi tersembunyi yang terbuang sia-sia dan merusak lingkungan."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-6)",
            marginTop: "var(--space-8)",
          }}
        >
          {/* Card 1: Jika Dibuang Begitu Saja */}
          <Card padded subtle style={{ borderLeft: "4px solid var(--color-danger-fg)" }}>
            <span
              style={{
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-semibold)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-danger-fg)",
                display: "block",
                marginBottom: "var(--space-2)",
              }}
            >
              Jika Dibuang Begitu Saja
            </span>
            <h3
              style={{
                fontSize: "var(--font-size-heading-s)",
                marginBottom: "var(--space-3)",
                color: "var(--color-text-primary)",
              }}
            >
              Beban Lingkungan & Biaya Sosial
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-body-m)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--line-height-body-m)",
                marginBottom: "var(--space-3)",
              }}
            >
              Satu liter minyak jelantah yang dituang ke saluran air dapat mencemari ribuan liter air tanah dan menyumbat pipa pemukiman. Sisa makanan yang membusuk tak terkelola di TPA melepas gas metana dan menciptakan bau tak sedap.
            </p>
            <p
              style={{
                fontSize: "var(--font-size-body-s)",
                color: "var(--color-text-muted)",
              }}
            >
              Dampaknya dirasakan bersama: saluran mampet, air sumur tercemar, dan timbulan sampah perkotaan yang kian menumpuk.
            </p>
          </Card>

          {/* Card 2: Jika Dialirkan ke Kampung Smart Farming */}
          <Card padded style={{ borderLeft: "4px solid var(--color-green-700)" }}>
            <span
              style={{
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-semibold)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-green-700)",
                display: "block",
                marginBottom: "var(--space-2)",
              }}
            >
              Di Kampung Smart Farming
            </span>
            <h3
              style={{
                fontSize: "var(--font-size-heading-s)",
                marginBottom: "var(--space-3)",
                color: "var(--color-text-primary)",
              }}
            >
              Bahan Baku Kesuburan & Dana Sosial
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-body-m)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--line-height-body-m)",
                marginBottom: "var(--space-3)",
              }}
            >
              Minyak jelantah difiltrasi menjadi lilin aromaterapi dan sabun ramah lingkungan. Sisa sayur dan kulit buah diurai menjadi bio-kompos padat dan cair yang menyuburkan sayuran hidroponik bebas pestisida di kebun warga.
            </p>
            <p
              style={{
                fontSize: "var(--font-size-body-s)",
                color: "var(--color-green-800)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Hasil penjualan dan panen langsung dialokasikan ke kas sosial untuk membantu pangan keluarga pra-sejahtera dan beasiswa anak warga.
            </p>
          </Card>
        </div>
      </Container>
    </section>
  );
}
