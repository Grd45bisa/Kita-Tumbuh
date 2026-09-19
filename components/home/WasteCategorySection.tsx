import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";

const categories = [
  {
    name: "Minyak Jelantah",
    unit: "Liter",
    status: "Prioritas Utama",
    desc: "Minyak sisa penggorengan dapur rumah tangga maupun warung makanan.",
    condition: "Saring kotoran kasar, simpan dalam jeriken/botol plastik tertutup rapat, jangan dicampur air atau sabun.",
    rejected: "Minyak pelumas/oli kendaraan, minyak bercampur detergen atau bahan kimia pembersih.",
  },
  {
    name: "Sisa Organik Dapur",
    unit: "Kilogram",
    status: "Diterima Rutin",
    desc: "Sisa sayuran mentah, kulit buah, ampas kopi, dedaunan, dan potongan tangkai.",
    condition: "Disimpan dalam wadah kering bertutup, terpisah dari plastik, belum berbelatung liar/busuk ekstrem.",
    rejected: "Sisa makanan berkuah santan kental, tulang sapi/kambing keras berukuran besar, kotoran hewan peliharaan.",
  },
  {
    name: "Plastik Wadah Tertentu",
    unit: "Buah / KG",
    status: "Sesuai Kebutuhan",
    desc: "Jeriken plastik bersih (HDPE) dan botol PET transparan ukuran 1–5 liter.",
    condition: "Telah dibilas bersih dan dikeringkan untuk dialihfungsikan sebagai wadah penampungan jelantah warga.",
    rejected: "Plastik kresek tipis robek, kemasan sachet metalik multilapis, botol pestisida/B3.",
  },
];

export function WasteCategorySection() {
  return (
    <section
      id="kategori-limbah"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-20)",
        backgroundColor: "var(--color-bg-surface)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Panduan Penerimaan Bahan Baku"
          title="Kategori Limbah yang Diterima di Kampung Setara Smart Farming"
          description="Demi menjaga kemurnian nutrisi pupuk dan keamanan para kader pengolah, kami menerapkan standardisasi pemilahan yang ketat."
        />

        {/* 3 Categories Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-6)",
            marginBottom: "var(--space-8)",
          }}
        >
          {categories.map((cat) => (
            <Card key={cat.name} padded style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-3)",
                }}
              >
                <Badge variant="brand">{cat.status}</Badge>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
                  Satuan: {cat.unit}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "var(--font-size-title)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {cat.name}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-body-s)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-body-s)",
                  marginBottom: "var(--space-4)",
                }}
              >
                {cat.desc}
              </p>

              <div
                style={{
                  padding: "var(--space-3)",
                  backgroundColor: "var(--color-bg-subtle)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--space-3)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-green-800)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  ✓ Syarat Penyerahan:
                </p>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)" }}>
                  {cat.condition}
                </p>
              </div>

              <div
                style={{
                  padding: "var(--space-3)",
                  backgroundColor: "var(--color-danger-bg)",
                  borderRadius: "var(--radius-sm)",
                  marginTop: "auto",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-danger-fg)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  ✕ Tidak Diterima:
                </p>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-danger-fg)" }}>
                  {cat.rejected}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            backgroundColor: "var(--color-paper-100)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <p
              style={{
                fontSize: "var(--font-size-body-s)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-primary)",
              }}
            >
              Komitmen Kualitas & Keamanan Pengolahan
            </p>
            <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
              Kami tidak menerima sampah campur basah umum, limbah medis, ataupun limbah bahan berbahaya dan beracun (B3). Pastikan donasi Anda telah dipilah sebelum diserahkan ke pos pengumpulan.
            </p>
          </div>

          <LinkButton href="/donasikan" variant="primary" size="md">
            Mulai Donasikan Limbah
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
