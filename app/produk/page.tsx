import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  type ProductCategory,
  PRODUCT_CATEGORY_LABELS,
} from "@/lib/validation/product-schema";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Produk Hasil Olahan — Kampung Setara Smart Farming",
  description:
    "Produk hasil olahan limbah sirkular dari Kampung Smart Farming — lilin aromaterapi, sabun alami, dan kompos.",
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

interface PublicProductRow {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  story: string | null;
  category: ProductCategory;
  price: number | string;
  currency: string;
  stock_quantity: number | string;
  unit: string;
}

export default async function ProdukPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Produk" },
  ];

  const supabase = await createClient();
  const { data: rawProducts } = await supabase
    .from("products")
    .select("id, sku, name, slug, description, story, category, price, currency, stock_quantity, unit")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const products = (rawProducts as unknown as PublicProductRow[]) || [];
  const hasProducts = products.length > 0;

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
              yang kami kembangkan dari setiap kategori limbah.
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

          {hasProducts ? (
            <div style={{ marginTop: "var(--space-10)" }}>
              <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
                <h2 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
                  Katalog Produk Sirkular Tersedia
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-m)", maxWidth: "36rem", margin: "0 auto" }}>
                  Seluruh hasil penjualan produk dialokasikan untuk pembiayaan operasional pengolahan limbah dan program pemberdayaan difabel.
                </p>
              </div>

              <div className={styles.productGrid}>
                {products.map((p) => (
                  <article key={p.id} className={styles.productCard}>
                    <div>
                      <span className={styles.productCategory}>
                        {PRODUCT_CATEGORY_LABELS[p.category] || p.category}
                      </span>
                      <h3 className={styles.productName}>{p.name}</h3>
                      <p className={styles.productDescription}>{p.description}</p>
                      {p.story && (
                        <p className={styles.productStory}>
                          &ldquo;{p.story}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>
                        Rp {Number(p.price).toLocaleString("id-ID")}
                      </span>
                      <span className={styles.productStock}>
                        Stok: {Number(p.stock_quantity)} {p.unit}
                      </span>
                    </div>
                    <Link href={`/produk/${p.slug}`} className={styles.orderButton}>
                      Lihat Detail & Pesan
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <ComingSoon
              title="Katalog produk sedang kami siapkan"
              description="Kami ingin memastikan setiap produk yang ditampilkan punya harga, stok, dan cerita asal bahan yang akurat sebelum dipublikasikan. Sementara itu, cara utama untuk berkontribusi adalah dengan mendonasikan limbahmu langsung."
              action={{ label: "Donasikan Limbah", href: "/donasikan" }}
            />
          )}
        </Container>
      </section>
    </main>
  );
}
