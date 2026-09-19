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
          eyebrow="Dari Tersisih Menjadi Istimewa"
          title="Menjadi Bernilai di Tangan yang Spesial"
          description="Sesuatu yang sering dipandang sebelah mata dapat melahirkan karya luar biasa saat bertemu dengan ketelatenan dan cinta kawan-kawan istimewa."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-6)",
            marginTop: "var(--space-8)",
          }}
        >
          {/* Card 1: Sudut Pandang Biasa */}
          <Card padded subtle style={{ borderLeft: "4px solid var(--color-earth-400)" }}>
            <span
              style={{
                fontSize: "var(--font-size-caption)",
                fontWeight: "var(--font-weight-semibold)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-earth-600)",
                display: "block",
                marginBottom: "var(--space-2)",
              }}
            >
              Sudut Pandang Biasa
            </span>
            <h3
              style={{
                fontSize: "var(--font-size-heading-s)",
                marginBottom: "var(--space-3)",
                color: "var(--color-text-primary)",
              }}
            >
              Dianggap Sisa Tanpa Makna
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-body-m)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--line-height-body-m)",
                marginBottom: "var(--space-3)",
              }}
            >
              Di banyak rumah, minyak jelantah dan potongan sayur kerap dibuang begitu saja ke saluran pembuangan karena dianggap sudah tidak memiliki kegunaan dan hanya merepotkan.
            </p>
            <p
              style={{
                fontSize: "var(--font-size-body-s)",
                color: "var(--color-text-muted)",
              }}
            >
              Padahal, di balik bahan yang tersisa tersebut, tersimpan potensi besar yang menunggu untuk dihidupkan kembali.
            </p>
          </Card>

          {/* Card 2: Di Tangan yang Spesial */}
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
              Di Kampung Setara Smart Farming
            </span>
            <h3
              style={{
                fontSize: "var(--font-size-heading-s)",
                marginBottom: "var(--space-3)",
                color: "var(--color-text-primary)",
              }}
            >
              Mahakarya di Tangan yang Spesial
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-body-m)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--line-height-body-m)",
                marginBottom: "var(--space-3)",
              }}
            >
              Di tangan kawan-kawan disabilitas dan kader komunitas, jelantah disaring dengan telaten menjadi lilin aromaterapi dan sabun ramah lingkungan premium. Sisa organik difermentasi menjadi pupuk bio-nutrisi yang menumbuhkan sayuran segar kebun cerdas.
            </p>
            <p
              style={{
                fontSize: "var(--font-size-body-s)",
                color: "var(--color-green-800)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Bukan sekadar daur ulang—ini adalah ruang ekspresi martabat, kebanggaan berkarya, dan kemandirian nyata bagi teman-teman istimewa kita.
            </p>
          </Card>
        </div>
      </Container>
    </section>
  );
}
