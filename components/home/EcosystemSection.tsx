import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

const pillars = [
  {
    tag: "Teknologi Ramah Warga",
    title: "Smart Farming Tepat Guna",
    desc: "Irigasi mikro berbasis sensor sederhana yang memantau kelembapan media tanam secara otomatis. Mudah dioperasikan oleh petani warga tanpa ketergantungan rumit.",
  },
  {
    tag: "Siklus Tertutup",
    title: "Daur Hara Alami (Zero-Waste)",
    desc: "Biomassa sisa pangkas kebun masuk kembali ke reaktor vermikompos. Hasilnya adalah pupuk cair bio-fermentasi dan pupuk kasgot yang kaya mikroorganisme penyubur.",
  },
  {
    tag: "Ekonomi Warga",
    title: "Produksi Lokal Kelompok Tani",
    desc: "Kader ibu rumah tangga dan pemuda kampung memproses minyak jelantah tersaring menjadi sabun alami dan mengemas pupuk siap pakai bernilai jual.",
  },
  {
    tag: "Martabat Komunitas",
    title: "Kemandirian Pangan & Sosial",
    desc: "Kebun menjadi lumbung hidup warga. Sebagian panen disalurkan ke dapur keluarga yang membutuhkan, memangkas beban biaya hidup harian masyarakat.",
  },
];

export function EcosystemSection() {
  return (
    <section
      id="smart-farming"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-20)",
        backgroundColor: "var(--color-bg-canvas)",
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Ekosistem Komunitas"
          title="Bukan Sekadar Pertanian Canggih, Melainkan Ekosistem Gotong Royong"
          description="Memadukan teknik budidaya ramah lingkungan dengan pemberdayaan sosial agar setiap jengkal lahan dan tetes limbah menghasilkan kebaikan nyata."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {pillars.map((item) => (
            <Card key={item.title} padded hoverable>
              <span
                style={{
                  fontSize: "var(--font-size-caption)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-earth-600)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: "var(--space-2)",
                }}
              >
                {item.tag}
              </span>
              <h3
                style={{
                  fontSize: "var(--font-size-title)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--font-size-body-m)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-body-m)",
                }}
              >
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
