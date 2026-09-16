import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

const steps = [
  {
    step: "01",
    title: "Donasi Diterima",
    desc: "Warga menyetorkan minyak jelantah atau limbah organik terpilah ke Pos Komunitas atau melalui jadwal penjemputan berkala.",
  },
  {
    step: "02",
    title: "Verifikasi & Apresiasi",
    desc: "Tim memeriksa kondisi bahan, mencatat timbangan riil tervalidasi ke dalam sistem terbuka, dan memberikan tanda terima bagi donatur.",
  },
  {
    step: "03",
    title: "Pemilahan & Preparasi",
    desc: "Minyak disaring bertahap dari residu kasar; biomassa organik dicacah rapi untuk menyongsong proses bio-konversi alami.",
  },
  {
    step: "04",
    title: "Karya di Tangan Spesial",
    desc: "Dengan ketelitian dan ketelatenan kawan-kawan disabilitas, jelantah diracik menjadi lilin aromaterapi dan sabun ramah lingkungan, sementara organik menjadi bio-kompos kaya nutrisi.",
  },
  {
    step: "05",
    title: "Kebun Smart Farming",
    desc: "Bio-kompos menyuburkan instalasi sayuran hidroponik komunitas yang dipantau dengan teknologi sensor kelembapan cerdas ramah warga.",
  },
  {
    step: "06",
    title: "Kemandirian & Kebahagiaan",
    desc: "Sayuran segar dibagikan untuk nutrisi keluarga dan lansia sekitar, serta membuka ruang kemandirian ekonomi bagi kawan-kawan istimewa.",
  },
];

export function TransformationStory() {
  return (
    <section
      id="cara-kerja"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-20)",
        backgroundColor: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Alur Sirkular Komprehensif"
          title="Transformasi Nyata: Dari Yang Tersisa, Tumbuh Menjadi Berdaya"
          description="Rantai proses tertutup yang menghubungkan kepedulian rumah tangga dengan kesuburan pangan dan martabat warga."
        />

        {/* Feature Image Banner */}
        <div
          style={{
            position: "relative",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--color-border-default)",
            boxShadow: "var(--elevation-1)",
            marginBottom: "var(--space-12)",
          }}
        >
          <Image
            src="/images/waste-transformation-process.jpg"
            alt="Fasilitas pemilahan limbah jelantah dan rumah kompos bio-organik warga Kampung Smart Farming"
            width={1200}
            height={600}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "440px",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              padding: "var(--space-3) var(--space-5)",
              backgroundColor: "var(--color-bg-surface)",
              borderTop: "1px solid var(--color-border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Badge variant="brand">Pusat Pengolahan Komunitas</Badge>
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)" }}>
                Area pemilahan jelantah dalam jeriken tervalidasi dan bedengan kompos organik aktif.
              </span>
            </div>
            <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
              Dikelola Swadaya oleh Kader Warga
            </span>
          </div>
        </div>

        {/* 6 Step Sequential Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {steps.map((item) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "var(--space-6)",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-subtle)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-3)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--font-size-title)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--color-green-700)",
                  }}
                >
                  {item.step}
                </span>
                <span
                  style={{
                    width: "24px",
                    height: "2px",
                    backgroundColor: "var(--color-green-300)",
                  }}
                  aria-hidden="true"
                />
              </div>

              <h3
                style={{
                  fontSize: "var(--font-size-body-l)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-body-s)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-body-s)",
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
