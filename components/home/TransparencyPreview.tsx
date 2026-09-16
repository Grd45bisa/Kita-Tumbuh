import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const stages = [
  {
    code: "01",
    label: "Donasi Masuk",
    detail: "Tercatat dengan ID donasi unik, waktu serah terima, dan nama/inisiatif donatur.",
  },
  {
    code: "02",
    label: "Timbangan Valid",
    detail: "Volume aktual diukur menggunakan timbangan digital terkalibrasi di pos pengumpulan.",
  },
  {
    code: "03",
    label: "Batch Produksi",
    detail: "Masuk ke buku besar pengolahan (komposting atau pemurnian minyak jelantah).",
  },
  {
    code: "04",
    label: "Panen & Produk",
    detail: "Keluaran sayur segar dan produk olahan dicatat volume fisik dan nilai jualnya.",
  },
  {
    code: "05",
    label: "Alokasi Sosial",
    detail: "Penyaluran bantuan pangan langsung dan beasiswa didokumentasikan dengan berita acara resmi.",
  },
];

export function TransparencyPreview() {
  return (
    <section
      id="transparansi"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-20)",
        backgroundColor: "var(--color-bg-canvas)",
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Prinsip Keterbukaan Penuh"
          title="Transparansi Bukan Sekadar Janji, Melainkan Sistem Jejak Data"
          description="Kami memisahkan perkiraan awal dari hasil timbangan riil, mencatat setiap konversi bahan, dan mempublikasikan alokasi manfaat secara terbuka."
        />

        {/* 5 Stages Flow */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-8)",
          }}
        >
          {stages.map((stage) => (
            <div
              key={stage.code}
              style={{
                padding: "var(--space-5)",
                backgroundColor: "var(--color-bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-default)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-green-700)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  TAHAP {stage.code}
                </span>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-green-600)",
                  }}
                />
              </div>

              <h3
                style={{
                  fontSize: "var(--font-size-body-m)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                }}
              >
                {stage.label}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-caption)",
                }}
              >
                {stage.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Audit Box */}
        <Card padded subtle style={{ borderLeft: "4px solid var(--color-brand-primary)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                <Badge variant="success">Buku Catatan Terbuka</Badge>
                <span style={{ fontSize: "var(--font-size-body-s)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                  Integritas Akuntansi Sosial
                </span>
              </div>
              <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", maxWidth: "760px" }}>
                Semua donasi limbah yang masuk tidak pernah diakui sebagai keuntungan pribadi. Seluruh penerimaan fisik dan pengeluaran manfaat dicatat ke dalam buku kas komunitas yang dapat diverifikasi publik.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}
