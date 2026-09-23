import React from "react";
import type { Metadata } from "next";
import { DonationWizard } from "@/components/donation/DonationWizard";
import { getWasteTypes } from "@/lib/domain/waste-types";
import { getCollectionPoints } from "@/lib/domain/collection-points";
import { env } from "@/lib/env";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Donasikan Limbah — SEMAI · Room to Grow",
  description:
    "Donasikan minyak jelantah, limbah organik, atau plastik dapur kamu. Sisa yang kamu sisihkan hari ini kembali ke siklus dan membuka ruang belajar serta karya nyata di SEMAI.",
  alternates: {
    canonical: `${env.siteUrl}/donasikan`,
  },
  openGraph: {
    title: "Donasikan Limbah — SEMAI · Room to Grow",
    description:
      "Beri ruang. Lihat apa yang bisa tumbuh. Mulai donasi limbah dapurmu — gratis, mudah, dan langsung membuka ruang untuk tumbuh.",
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
    <div className={styles.page}>
      <DonationWizard
        wasteTypes={wasteTypes}
        collectionPoints={collectionPoints}
      />
    </div>
  );
}
