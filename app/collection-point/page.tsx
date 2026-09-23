import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CollectionPointCard } from "@/components/collection-point/CollectionPointCard";
import { CollectionPointFilter } from "@/components/collection-point/CollectionPointFilter";
import { getCollectionPoints } from "@/lib/domain/collection-points";
import { getWasteTypes } from "@/lib/domain/waste-types";
import { env } from "@/lib/env";
import { buildBreadcrumbJsonLd } from "@/lib/content/structured-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Titik Penyerahan Limbah — SEMAI · Room to Grow",
  description:
    "Temukan titik penyerahan (collection point) untuk mengantarkan minyak jelantah, limbah organik, dan plastik terpilah secara langsung.",
  alternates: {
    canonical: `${env.siteUrl}/collection-point`,
  },
  openGraph: {
    title: "Titik Penyerahan Limbah — SEMAI · Room to Grow",
    description:
      "Temukan lokasi terdekat untuk mengantarkan limbah rumah tanggamu secara langsung.",
    url: `${env.siteUrl}/collection-point`,
    type: "website",
  },
};

interface Props {
  searchParams: Promise<{ jenis?: string }>;
}

export default async function CollectionPointPage({ searchParams }: Props) {
  const { jenis } = await searchParams;

  let points: Awaited<ReturnType<typeof getCollectionPoints>> = [];
  let wasteTypes: Awaited<ReturnType<typeof getWasteTypes>> = [];
  let fetchFailed = false;

  try {
    [points, wasteTypes] = await Promise.all([getCollectionPoints(), getWasteTypes()]);
  } catch (error) {
    console.error("[collection-point-page] fetch error:", error);
    fetchFailed = true;
  }

  const wasteTypesBySlug = new Map(wasteTypes.map((w) => [w.slug, w]));

  const filteredPoints = jenis
    ? points.filter((point) => point.accepted_waste_slugs?.includes(jenis))
    : points;

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Titik Penyerahan" },
  ];

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>SEMAI · INCLUSIVE CIRCULAR SMART FARMING</p>
            <h1 className={styles.title}>Titik Penyerahan Limbah</h1>
            <p className={styles.lead}>
              Tidak sempat menunggu jadwal pickup? Antarkan langsung limbahmu ke salah satu
              titik penyerahan berikut sesuai jam operasional dan jenis limbah yang diterima.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.main}>
        <Container>
          {fetchFailed ? (
            <ErrorState
              title="Gagal memuat daftar titik penyerahan."
              description="Coba muat ulang halaman ini dalam beberapa saat. Kamu juga tetap bisa mendonasikan limbah lewat pickup."
              action={{ label: "Donasikan Limbah", href: "/donasikan" }}
            />
          ) : (
            <>
              {wasteTypes.length > 0 && (
                <CollectionPointFilter wasteTypes={wasteTypes} selectedWasteSlug={jenis} />
              )}

              {filteredPoints.length === 0 ? (
                <EmptyState
                  title={
                    jenis
                      ? "Belum ada titik penyerahan untuk jenis limbah ini."
                      : "Belum ada titik penyerahan yang tersedia."
                  }
                  description="Kamu tetap bisa mendonasikan limbah lewat jadwal pickup dari rumah."
                  action={{ label: "Donasikan Limbah", href: "/donasikan" }}
                />
              ) : (
                <>
                  <p className={styles.resultCount}>
                    Menampilkan {filteredPoints.length} titik penyerahan.
                  </p>
                  <div className={styles.grid}>
                    {filteredPoints.map((point) => (
                      <CollectionPointCard
                        key={point.id}
                        point={point}
                        wasteTypesBySlug={wasteTypesBySlug}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
