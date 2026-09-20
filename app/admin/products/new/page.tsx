import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductForm, type BatchOption } from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Tambah Produk Sirkular | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

interface RawBatchRow {
  id: string;
  batch_number: string;
  title: string;
  target_output_type: string;
  actual_output_quantity: number | string;
  output_unit: string;
}

export default async function NewProductPage() {
  await requirePermission("product_catalog", "write");
  const supabase = await createClient();

  // Fetch production batches that are completed or released
  const { data: rawBatches } = await supabase
    .from("production_batches")
    .select("id, batch_number, title, target_output_type, actual_output_quantity, output_unit")
    .order("created_at", { ascending: false });

  const batches: BatchOption[] = ((rawBatches as unknown as RawBatchRow[]) || []).map((b) => ({
    id: b.id,
    batch_number: b.batch_number,
    title: b.title,
    target_output_type: b.target_output_type,
    actual_output_quantity: Number(b.actual_output_quantity),
    output_unit: b.output_unit,
  }));

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "Produk Sirkular", href: "/admin/products" },
    { label: "Tambah Produk" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "880px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginBottom: "var(--space-1)" }}>
          Tambah Produk Hasil Olahan Sirkular
        </h1>
        <p style={{ color: "var(--color-ink-600)", fontSize: "0.9375rem" }}>
          Daftarkan produk baru lengkap dengan SKU, harga integer Rupiah, dan tautan batch produksi (P0-506).
        </p>
      </div>

      <ProductForm batches={batches} />
    </div>
  );
}
