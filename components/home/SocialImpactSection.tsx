import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const programs = [
  {
    title: "Program Pangan & Nutrisi Keluarga",
    beneficiaries: "Keluarga Lansia & Prasejahtera",
    desc: "Distribusi berkala sayuran hidroponik segar bebas pestisida (selada, pakcoy, kangkung) langsung dari greenhouse komunitas ke meja makan warga yang membutuhkan.",
  },
  {
    title: "Beasiswa Tunas Kampung",
    beneficiaries: "Anak-Anak Petani & Kader Lingkungan",
    desc: "Bantuan perlengkapan belajar, seragam, dan dana pembinaan pendidikan yang bersumber dari surplus penjualan produk sirkular dan pupuk olahan warga.",
  },
  {
    title: "Pelatihan Kemandirian Warga",
    beneficiaries: "Pemuda & Kelompok Wanita Tani",
    desc: "Pendidikan keterampilan budidaya smart farming terapan dan formulasi produk sabun/lilin agar warga memiliki kapasitas usaha mandiri yang berdaya tahan.",
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
          eyebrow="Dampak Sosial & Martabat"
          title="Nilai Ekonomi Limbah yang Mengalir Menjadi Kekuatan Komunitas"
          description="Kami tidak menjalankan pendekatan belas kasihan. Setiap bantuan sosial lahir dari kerja nyata ekosistem sirkular yang terhormat dan mandiri."
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
              src="/images/community-harvest-impact.jpg"
              alt="Warga kader komunitas dengan bangga memegang hasil panen sayuran segar dan pupuk bio-organik olahan limbah"
              width={1200}
              height={640}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "440px",
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
                Kemandirian, Bukan Ketergantungan
              </p>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                Dari limbah minyak dan sisa sayur dapur yang disetor donatur, warga menghasilkan sayuran segar berkualitas tinggi dan pupuk organik mandiri tanpa pupuk kimia sintetis.
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
