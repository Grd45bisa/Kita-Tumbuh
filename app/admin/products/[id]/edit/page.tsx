import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductForm, type BatchOption, type InitialProductData } from "@/components/admin/ProductForm";
import type { ProductCategory } from "@/lib/validation/product-schema";

export const metadata: Metadata = {
  title: "Edit Produk Sirkular | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface RawBatchRow {
  id: string;
  batch_number: string;
  title: string;
  target_output_type: string;
  actual_output_quantity: number | string;
  output_unit: string;
}

export default async function EditProductPage({ params }: PageProps) {
  await requirePermission("product_catalog", "write");
  const { id } = await params;
  const supabase = await createClient();

  // Product lookup and the (unrelated) batches dropdown list are
  // independent queries — run them concurrently. Fetching batches even
  // when the product turns out not to exist is a small, acceptable cost
  // against the common case (product found) resolving faster.
  const [{ data: product, error: productError }, { data: rawBatches }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase
      .from("production_batches")
      .select("id, batch_number, title, target_output_type, actual_output_quantity, output_unit")
      .order("created_at", { ascending: false }),
  ]);

  if (productError || !product) {
    notFound();
  }

  const batches: BatchOption[] = ((rawBatches as unknown as RawBatchRow[]) || []).map((b) => ({
    id: b.id,
    batch_number: b.batch_number,
    title: b.title,
    target_output_type: b.target_output_type,
    actual_output_quantity: Number(b.actual_output_quantity),
    output_unit: b.output_unit,
  }));

  const initialData: InitialProductData = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    story: product.story,
    category: product.category as ProductCategory,
    production_batch_id: product.production_batch_id,
    price: Number(product.price),
    currency: product.currency,
    stock_quantity: Number(product.stock_quantity),
    unit: product.unit,
    image_url: product.image_url,
    is_public: product.is_public,
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "Produk Sirkular", href: "/admin/products" },
    { label: `Edit ${product.sku}` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "880px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginBottom: "var(--space-1)" }}>
          Edit Produk: {product.name}
        </h1>
        <p style={{ color: "var(--color-ink-600)", fontSize: "0.9375rem" }}>
          Perbarui informasi katalog, harga, stok, atau keterkaitan ke batch produksi.
        </p>
      </div>

      <ProductForm initialData={initialData} batches={batches} />
    </div>
  );
}
