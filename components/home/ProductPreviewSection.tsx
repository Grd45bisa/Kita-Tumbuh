import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const products = [
  {
    name: "Pupuk Bio-Organik Super",
    category: "Sumber Daya Kompos",
    origin: "Dari biomassa sisa sayur, buah, dan dedaunan dapur terpilah",
    benefit: "Kaya mikroba tanah pelarut fosfat dan penambat nitrogen alami. Memperbaiki struktur tanah dan menyuburkan tanaman.",
    impactShare: "Menyuburkan kebun warga & mendukung operasional rumah kompos komunitas",
  },
  {
    name: "Sayuran Segar Hidroponik",
    category: "Hasil Pangan Kebun",
    origin: "Ditanam di greenhouse pintar berbantuan sensor kelembapan",
    benefit: "Bebas residu pestisida beracun, panen harian segar, kaya antioksidan dan serat bernutrisi tinggi.",
    impactShare: "Didistribusikan untuk program nutrisi lansia & keluarga warga sekitar",
  },
  {
    name: "Lilin Aromaterapi & Sabun Alami",
    category: "Karya Tangan Spesial",
    origin: "Minyak jelantah terfiltrasi karbon aktif & minyak atsiri aromatik",
    benefit: "Dibuat dengan ketelitian dan ketelatenan istimewa oleh kawan-kawan disabilitas. Lilin wangi menenangkan dan sabun lembut yang ramah lingkungan.",
    impactShare: "100% pendapatan mendukung ruang karya kawan istimewa & kemandirian komunitas",
  },
];

export function ProductPreviewSection() {
  return (
    <section
      id="produk"
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
          eyebrow="Keluaran Nyata Sirkular"
          title="Produk Bernilai & Hasil Pangan Kampung"
          description="Limbah yang disetorkan berubah wujud menjadi produk fisik berkualitas tinggi yang mendukung keberlanjutan ekonomi komunitas."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {products.map((prod) => (
            <Card key={prod.name} padded style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "var(--space-2)" }}>
                <Badge variant="brand">{prod.category}</Badge>
              </div>

              <h3
                style={{
                  fontSize: "var(--font-size-title)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {prod.name}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-earth-600)",
                  fontWeight: "var(--font-weight-medium)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Asal Bahan: {prod.origin}
              </p>

              <p
                style={{
                  fontSize: "var(--font-size-body-s)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-body-s)",
                  marginBottom: "var(--space-4)",
                }}
              >
                {prod.benefit}
              </p>

              <div
                style={{
                  marginTop: "auto",
                  padding: "var(--space-3)",
                  backgroundColor: "var(--color-success-bg)",
                  border: "1px solid var(--color-success-border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-success-fg)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Alokasi Dampak: {prod.impactShare}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
