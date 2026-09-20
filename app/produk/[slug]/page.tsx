import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/lib/validation/product-schema";
import { ProductOrderForm } from "@/components/order/ProductOrderForm";
import { env } from "@/lib/env";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan — Kampung Smart Farming",
    };
  }

  return {
    title: `${product.name} — Produk Hasil Olahan KITA TUMBUH`,
    description: product.description || "Pesan produk hasil daur ulang limbah dari Kampung Smart Farming.",
    alternates: {
      canonical: `${env.siteUrl}/produk/${encodeURIComponent(slug)}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, sku, name, slug, description, story, category, price, currency, stock_quantity, unit, is_public")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const user = await getCurrentUser();
  const initialUser = user
    ? {
        name: user.profile?.full_name || "",
        email: user.email,
        phone: user.profile?.phone || "",
      }
    : null;

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Produk", href: "/produk" },
    { label: product.name },
  ];

  return (
    <main id="main-content">
      <section className={styles.section}>
        <Container>
          <Breadcrumb items={breadcrumbItems} />

          <div className={styles.grid}>
            <article className={styles.detailCard}>
              <span className={styles.categoryTag}>
                {PRODUCT_CATEGORY_LABELS[product.category as ProductCategory] || product.category}
              </span>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <div className={styles.priceTag}>
                Rp {Number(product.price).toLocaleString("id-ID")}
              </div>

              <p className={styles.description}>{product.description}</p>

              {product.story && (
                <div className={styles.storyBox}>
                  <div className={styles.storyTitle}>Cerita Asal Usul Bahan & Karya</div>
                  <p className={styles.storyText}>&ldquo;{product.story}&rdquo;</p>
                </div>
              )}

              <div className={styles.metaInfo}>
                <div>
                  <div className={styles.metaItemTitle}>SKU Produk</div>
                  <div className={styles.metaItemValue}>{product.sku}</div>
                </div>
                <div>
                  <div className={styles.metaItemTitle}>Ketersediaan Stok</div>
                  <div className={styles.metaItemValue}>
                    {Number(product.stock_quantity) > 0
                      ? `${product.stock_quantity} ${product.unit}`
                      : "Habis"}
                  </div>
                </div>
              </div>
            </article>

            <div>
              <ProductOrderForm
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  stock: Number(product.stock_quantity),
                  unit: product.unit,
                }}
                initialUser={initialUser}
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
