import React from "react";
import type { Metadata } from "next";
import { DonationWizard } from "@/components/donation/DonationWizard";
import { getWasteTypes } from "@/lib/domain/waste-types";
import { getCollectionPoints } from "@/lib/domain/collection-points";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Donasikan Limbah — Kampung Smart Farming",
  description:
    "Donasikan minyak jelantah, limbah organik, atau plastik dapur kamu. Limbahmu akan kami olah menjadi produk bernilai dan manfaat sosial nyata bagi komunitas.",
  alternates: {
    canonical: `${env.siteUrl}/donasikan`,
  },
  openGraph: {
    title: "Donasikan Limbah — Kampung Smart Farming",
    description:
      "Mulai donasi limbah dapur kamu. Gratis, mudah, dan langsung berdampak.",
    url: `${env.siteUrl}/donasikan`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function DonasikanPage() {
  // Fetch waste types and collection points on the server
  // These are static/public data — no user auth required
  const [wasteTypes, collectionPoints] = await Promise.all([
    getWasteTypes(),
    getCollectionPoints(),
  ]);

  return (
    <main id="main-content">
      {/* Page header */}
      <section
        style={{
          backgroundColor: "var(--color-bg-canvas)",
          borderBottom: "1px solid var(--color-border-subtle)",
          padding: "var(--space-8) var(--space-4)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-brand-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 var(--space-3)",
            }}
          >
            KITA TUMBUH — KAMPUNG SMART FARMING
          </p>
          <h1
            style={{
              fontSize: "var(--font-size-heading-l)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-primary)",
              lineHeight: "var(--line-height-heading-l)",
              margin: "0 0 var(--space-3)",
            }}
          >
            Donasikan Limbahmu
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-body-l)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-body-l)",
              margin: "0",
            }}
          >
            <strong>SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.</strong>{" "}
            Ikuti langkah-langkah berikut — gratis, tidak perlu akun, dan
            setiap kontribusi langsung berarti.
          </p>
        </div>
      </section>

      {/* Wizard — client component with server-fetched data as props */}
      <section
        style={{
          backgroundColor: "var(--color-bg-canvas)",
          minHeight: "60vh",
          padding: "var(--space-8) 0 var(--space-16)",
        }}
      >
        <DonationWizard
          wasteTypes={wasteTypes}
          collectionPoints={collectionPoints}
        />
      </section>
    </main>
  );
}
