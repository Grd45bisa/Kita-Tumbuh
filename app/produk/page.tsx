import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { env } from "@/lib/env";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Produk Hasil Olahan — Kampung Setara Smart Farming",
  description:
    "Produk hasil olahan limbah dari Kampung Setara Smart Farming — katalog sedang kami siapkan.",
  alternates: {
    canonical: `${env.siteUrl}/produk`,
  },
};

const categories = [
  {
    title: "Dari minyak jelantah",
    text: "Diarahkan menjadi lilin aromaterapi dan sabun alami melalui proses yang dikerjakan bersama anak-anak difabel.",
  },
  {
    title: "Dari limbah organik",
    text: "Diolah menjadi kompos untuk mendukung kebun smart farming komunitas kami.",
  },
  {
    title: "Dari plastik terpilah",
    text: "Wadah plastik yang masih layak digunakan kembali untuk menampung minyak jelantah pada donasi berikutnya.",
  },
];

export default function ProdukPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Produk" },
  ];

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>KITA TUMBUH — KAMPUNG SETARA SMART FARMING</p>
            <h1 className={styles.title}>Produk Hasil Olahan</h1>
            <p className={styles.lead}>
              Limbah yang didonasikan diarahkan menjadi produk bernilai. Berikut jenis produk
              yang sedang kami kembangkan dari setiap kategori limbah.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Dari limbah menjadi produk</h2>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <article key={category.title} className={styles.categoryCard}>
                <h3 className={styles.categoryTitle}>{category.title}</h3>
                <p className={styles.categoryText}>{category.text}</p>
              </article>
            ))}
          </div>

          <ComingSoon
            title="Katalog produk sedang kami siapkan"
            description="Kami ingin memastikan setiap produk yang ditampilkan punya harga, stok, dan cerita asal bahan yang akurat sebelum dipublikasikan. Sementara itu, cara utama untuk berkontribusi adalah dengan mendonasikan limbahmu langsung."
            action={{ label: "Donasikan Limbah", href: "/donasikan" }}
          />
        </Container>
      </section>
    </main>
  );
}
