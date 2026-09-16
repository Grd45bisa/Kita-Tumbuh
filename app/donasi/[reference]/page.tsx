import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDonationByReference } from "@/lib/domain/donations";
import { DonationTimeline } from "@/components/donation/DonationTimeline";
import { env } from "@/lib/env";

interface Props {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Donasi ${reference} — Kampung Smart Farming`,
    description: `Lacak status donasi limbahmu dengan referensi ${reference}.`,
    alternates: {
      canonical: `${env.siteUrl}/donasi/${reference}`,
    },
    robots: {
      // Tracking pages should not be indexed
      index: false,
      follow: false,
    },
  };
}

export default async function DonationTrackingPage({ params }: Props) {
  const { reference } = await params;

  const result = await getDonationByReference(reference);

  if (!result.success) {
    notFound();
  }

  const donation = result.data;

  const methodLabel =
    donation.method === "DROP_OFF" ? "Antar ke Collection Point" : "Dijemput";

  function formatDate(ts: string): string {
    try {
      return new Date(ts).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return ts;
    }
  }

  return (
    <main id="main-content" style={{ backgroundColor: "var(--color-bg-canvas)", minHeight: "80vh" }}>
      {/* Header */}
      <section
        style={{
          backgroundColor: "var(--color-bg-canvas)",
          borderBottom: "1px solid var(--color-border-subtle)",
          padding: "var(--space-8) var(--space-4)",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <Link
            href="/donasikan"
            style={{
              fontSize: "var(--font-size-body-s)",
              color: "var(--color-brand-primary)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-1)",
              marginBottom: "var(--space-4)",
            }}
          >
            ← Donasikan lagi
          </Link>
          <p
            style={{
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 var(--space-2)",
            }}
          >
            STATUS DONASI
          </p>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--font-size-heading-m)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-brand-primary)",
              letterSpacing: "0.04em",
              margin: "0 0 var(--space-2)",
            }}
          >
            {donation.reference}
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-body-s)",
              color: "var(--color-text-secondary)",
              margin: "0",
            }}
          >
            {donation.waste_type_name} · Perkiraan{" "}
            {donation.estimated_quantity} {donation.unit} ·{" "}
            {methodLabel} · Didaftarkan {formatDate(donation.created_at)}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "var(--space-8) var(--space-4) var(--space-16)" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>

          {/* Status timeline */}
          <div>
            <h2
              style={{
                fontSize: "var(--font-size-title)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-4)",
              }}
            >
              Perjalanan Donasimu
            </h2>
            <DonationTimeline
              currentStatus={donation.status}
              statusHistory={donation.status_history}
            />
          </div>

          {/* Donation details */}
          <div
            style={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "var(--space-4) var(--space-5)",
                borderBottom: "1px solid var(--color-border-subtle)",
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-body-s)",
                color: "var(--color-text-primary)",
              }}
            >
              Detail Donasi
            </div>
            {[
              { label: "Jenis Limbah", value: donation.waste_type_name },
              {
                label: "Perkiraan Jumlah",
                value: `${donation.estimated_quantity} ${donation.unit}`,
              },
              ...(donation.verified_quantity != null
                ? [
                    {
                      label: "Jumlah Terverifikasi",
                      value: `${donation.verified_quantity} ${donation.unit}`,
                    },
                  ]
                : []),
              { label: "Metode", value: methodLabel },
              ...(donation.collection_point
                ? [{ label: "Lokasi", value: donation.collection_point.name }]
                : []),
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  padding: "var(--space-3) var(--space-5)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  fontSize: "var(--font-size-body-s)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
                <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", textAlign: "right" }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Verified quantity note if not yet verified */}
            {donation.verified_quantity == null && (
              <div
                style={{
                  padding: "var(--space-4) var(--space-5)",
                  fontSize: "var(--font-size-caption)",
                  color: "var(--color-text-muted)",
                  backgroundColor: "var(--color-bg-subtle)",
                }}
              >
                ℹ️ Jumlah terverifikasi akan muncul setelah tim kami melakukan
                penimbangan fisik.
              </div>
            )}
          </div>

          {/* Pickup address is intentionally NOT shown here */}
          {donation.method === "PICKUP" && (
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-caption)",
                color: "var(--color-text-muted)",
              }}
            >
              🔒 Alamat penjemputanmu bersifat privat dan hanya diketahui oleh
              tim operasional kami.
            </div>
          )}

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Link
              href="/donasikan"
              style={{
                display: "block",
                width: "100%",
                padding: "var(--space-4)",
                backgroundColor: "var(--color-brand-primary)",
                color: "white",
                fontWeight: "var(--font-weight-semibold)",
                textAlign: "center",
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-body-m)",
              }}
            >
              Donasikan Limbah Lagi
            </Link>
            <Link
              href="/"
              style={{
                display: "block",
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: "var(--font-size-body-s)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Kembali ke Beranda
            </Link>
          </div>

          {/* Contact note */}
          <p
            style={{
              fontSize: "var(--font-size-caption)",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            Ada pertanyaan tentang donasimu?{" "}
            <a
              href="mailto:kampungsmartfarming@gmail.com"
              style={{ color: "var(--color-brand-primary)", textDecoration: "underline" }}
            >
              Hubungi kami
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
