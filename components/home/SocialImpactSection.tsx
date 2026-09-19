import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const programs = [
  {
    title: "Ruang Karya Teman Istimewa",
    beneficiaries: "Kawan-Kawan Disabilitas",
    desc: "Pusat kreasi pembuatan lilin aromaterapi dan sabun alami ramah lingkungan yang dikelola dengan dedikasi dan ketelatenan tinggi oleh teman-teman disabilitas.",
  },
  {
    title: "Program Pangan Sehat & Nutrisi",
    beneficiaries: "Lansia & Keluarga Warga Sekitar",
    desc: "Distribusi berkala sayuran hidroponik segar bebas pestisida (selada, pakcoy, kangkung) langsung dari greenhouse komunitas untuk menunjang gizi harian warga.",
  },
  {
    title: "Tunas Mandiri & Beasiswa Belajar",
    beneficiaries: "Generasi Muda & Kader Lingkungan",
    desc: "Dukungan sarana belajar, pembinaan bakat, dan pendidikan keterampilan sirkular yang didanai dari surplus karya olahan bernilai tinggi.",
  },
];

export function SocialImpactSection() {
  return (
    <section
      id="dampak-sosial"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-20)",
        backgroundColor: "var(--color-bg-canvas)",
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Dampak Positif & Ruang Inklusif"
          title="Menjadi Bernilai di Tangan yang Spesial"
          description="Bukan belas kasihan yang kami tawarkan, melainkan panggung bagi setiap potensi. Kawan-kawan disabilitas dan warga membuktikan bahwa ketelatenan istimewa mampu melahirkan karya berkualitas tinggi dan manfaat yang membanggakan."
        />

        {/* Impact Photo & Narrative Banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
            alignItems: "center",
            marginBottom: "var(--space-10)",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--color-border-default)",
              boxShadow: "var(--elevation-2)",
            }}
          >
            <Image
              src="/images/impact-difabel-komunitas.jpg"
              alt="Anak-anak difabel bersama penggerak komunitas tersenyum bangga di kebun hidroponik cerdas Kampung Setara Smart Farming memegang hasil panen segar"
              width={1200}
              height={640}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "480px",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                padding: "var(--space-4) var(--space-6)",
                backgroundColor: "var(--color-bg-surface)",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--font-size-body-m)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                }}
              >
                Karya Bermartabat, Menginspirasi Sesama
              </p>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                Dari minyak jelantah dan sisa dapur yang Anda donasikan, anak-anak dan kawan difabel bersama komunitas kami merajut karya bernilai tinggi dan menghadirkan panen pangan segar bagi lingkungan sekitar.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Programs Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {programs.map((prog) => (
            <Card key={prog.title} padded hoverable>
              <Badge variant="brand" style={{ marginBottom: "var(--space-2)" }}>
                {prog.beneficiaries}
              </Badge>
              <h3
                style={{
                  fontSize: "var(--font-size-title)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-primary)",
                  marginTop: "var(--space-1)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {prog.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--font-size-body-s)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-body-s)",
                }}
              >
                {prog.desc}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
