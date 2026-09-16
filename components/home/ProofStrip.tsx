import React from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

const metrics = [
  {
    value: "3.420 L",
    label: "Minyak Jelantah Terkumpul",
    note: "Disaring & diolah menjadi bahan lilin aromaterapi dan sabun ramah lingkungan",
  },
  {
    value: "12,8 Ton",
    label: "Limbah Organik Terolah",
    note: "Dikonversi menjadi pupuk bio-kompos dan pakan maggot berprotein tinggi",
  },
  {
    value: "148 Paket",
    label: "Pangan & Sayur Didistribusikan",
    note: "Dibagikan langsung kepada keluarga lansia dan prasejahtera sekitar kampung",
  },
  {
    value: "100%",
    label: "Jejak Tervalidasi Terbuka",
    note: "Setiap timbangan limbah dan alokasi dana dapat ditelusuri secara berkala",
  },
];

export function ProofStrip() {
  return (
    <section
      style={{
        paddingTop: "var(--space-10)",
        paddingBottom: "var(--space-10)",
        backgroundColor: "var(--color-bg-surface)",
        borderBottom: "1px solid var(--color-border-default)",
      }}
      aria-label="Ringkasan Bukti & Metrik"
    >
      <Container>
        {/* Transparency note badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-2)",
            marginBottom: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Badge variant="success">Jejak Dampak Nyata</Badge>
            <span
              style={{
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-muted)",
              }}
            >
              Rekapitulasi penimbangan limbah terverifikasi dan distribusi hasil panen kebun komunitas penggerak.
            </span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {metrics.map((item) => (
            <div
              key={item.label}
              style={{
                padding: "var(--space-5)",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--font-size-heading-l)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-green-800)",
                  lineHeight: "1.1",
                  marginBottom: "var(--space-2)",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-body-m)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-1)",
                }}
              >
                {item.label}
              </div>
              <p
                style={{
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-caption)",
                }}
              >
                {item.note}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
