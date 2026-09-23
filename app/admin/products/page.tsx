import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import {
  type ProductCategory,
  PRODUCT_CATEGORY_LABELS,
} from "@/lib/validation/product-schema";

export const metadata: Metadata = {
  title: "Produk Sirkular | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface RawProductRow {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number | string;
  currency: string;
  stock_quantity: number | string;
  unit: string;
  is_public: boolean;
  production_batches?: {
    batch_number: string;
  } | null;
  created_at: string;
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  currency: string;
  stock_quantity: number;
  unit: string;
  is_public: boolean;
  batch_number: string | null;
  created_at: string;
}

interface PageProps {
  searchParams: Promise<{
    category?: string;
    visibility?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requirePermission("product_catalog", "read");
  const { category: categoryFilter, visibility: visibilityFilter, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const pageSize = 10;

  const supabase = await createClient();

  // Metric numbers and the filtered/paginated product list are independent
  // queries against the same table with different projections — run them
  // concurrently instead of one after the other.
  let query = supabase
    .from("products")
    .select("*, production_batches ( batch_number )", { count: "exact" })
    .order("created_at", { ascending: false });

  if (categoryFilter && categoryFilter !== "ALL") {
    query = query.eq("category", categoryFilter);
  }

  if (visibilityFilter === "PUBLIC") {
    query = query.eq("is_public", true);
  } else if (visibilityFilter === "PRIVATE") {
    query = query.eq("is_public", false);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const [{ data: allProducts }, { data: rawProducts, count: filteredCount }] = await Promise.all([
    supabase.from("products").select("is_public, stock_quantity"),
    query.range(from, to),
  ]);

  const totalCount = allProducts?.length || 0;
  const publicCount = allProducts?.filter((p) => p.is_public).length || 0;
  const totalStock = allProducts?.reduce((acc, p) => acc + Number(p.stock_quantity), 0) || 0;

  const products: ProductItem[] = ((rawProducts as unknown as RawProductRow[]) || []).map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: Number(p.price),
    currency: p.currency,
    stock_quantity: Number(p.stock_quantity),
    unit: p.unit,
    is_public: p.is_public,
    batch_number: p.production_batches?.batch_number || null,
    created_at: p.created_at,
  }));

  const totalItems = filteredCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const columns: Column<ProductItem>[] = [
    {
      key: "sku",
      header: "SKU / Nama Produk",
      render: (item) => (
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-ink-600)" }}>
            {item.sku}
          </span>
          <p style={{ fontWeight: 600, color: "var(--color-brand-primary)", marginTop: "2px" }}>
            {item.name}
          </p>
          <span style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
            {PRODUCT_CATEGORY_LABELS[item.category] || item.category}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Harga Jual",
      render: (item) => (
        <span style={{ fontWeight: 600 }}>
          Rp {item.price.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stok Tersedia",
      render: (item) => (
        <span style={{ fontWeight: 600, color: item.stock_quantity > 0 ? "var(--color-ink-800)" : "var(--color-earth-700)" }}>
          {item.stock_quantity} {item.unit}
        </span>
      ),
    },
    {
      key: "batch",
      header: "Batch Asal",
      render: (item) =>
        item.batch_number ? (
          <span style={{ fontSize: "0.8125rem", color: "var(--color-brand-primary)" }}>
            {item.batch_number}
          </span>
        ) : (
          <span style={{ fontSize: "0.75rem", color: "var(--color-ink-400)" }}>—</span>
        ),
    },
    {
      key: "visibility",
      header: "Katalog Publik",
      render: (item) =>
        item.is_public ? (
          <Badge variant="success">PUBLIK</Badge>
        ) : (
          <Badge variant="neutral">DRAFT / INTERNAL</Badge>
        ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (item) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link href={`/admin/products/${item.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          {item.is_public && (
            <a
              href={`/produk/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.75rem",
                color: "var(--color-brand-primary)",
                textDecoration: "underline",
                alignSelf: "center",
              }}
            >
              Lihat ↗
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginBottom: "var(--space-1)" }}>
            Produk Hasil Olahan Sirkular
          </h1>
          <p style={{ color: "var(--color-ink-600)", fontSize: "0.9375rem" }}>
            Kelola katalog produk turunan bernilai ekonomi dari limbah yang diolah (P0-506).
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary" size="md">
            + Tambah Produk Baru
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Total SKU Produk</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginTop: "4px" }}>
            {totalCount}
          </p>
        </Card>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Tampil di Web Publik</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginTop: "4px" }}>
            {publicCount}
          </p>
        </Card>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Total Akumulasi Stok</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-earth-700)", marginTop: "4px" }}>
            {totalStock} Pcs
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ padding: "var(--space-4)" }}>
        <form method="get" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink-700)" }}>
            Filter:
          </span>
          <select
            name="category"
            defaultValue={categoryFilter || "ALL"}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-subtle)",
              fontSize: "0.875rem",
              backgroundColor: "white",
            }}
          >
            <option value="ALL">Semua Kategori</option>
            <option value="MINYAK_JELANTAH">Minyak Jelantah</option>
            <option value="ORGANIK">Limbah Organik</option>
            <option value="ANORGANIK">Daur Ulang Anorganik</option>
          </select>

          <select
            name="visibility"
            defaultValue={visibilityFilter || "ALL"}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-subtle)",
              fontSize: "0.875rem",
              backgroundColor: "white",
            }}
          >
            <option value="ALL">Semua Visibilitas</option>
            <option value="PUBLIC">Hanya Publik</option>
            <option value="PRIVATE">Hanya Draft / Internal</option>
          </select>

          <Button type="submit" variant="secondary" size="sm">
            Terapkan Filter
          </Button>

          {(categoryFilter || visibilityFilter) && (
            <Link href="/admin/products" style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", textDecoration: "underline" }}>
              Reset Filter
            </Link>
          )}
        </form>
      </Card>

      {/* Products Table */}
      <Card>
        <DataTable
          columns={columns}
          data={products}
          keyExtractor={(item) => item.id}
          emptyMessage="Belum ada produk sirkular yang terdaftar. Klik tombol Tambah Produk Baru untuk memulai."
        />
        {totalPages > 1 && (
          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border-subtle)" }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalItems}
              pageSize={pageSize}
              buildPageUrl={(p) =>
                `/admin/products?${new URLSearchParams({
                  ...(categoryFilter && categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
                  ...(visibilityFilter && visibilityFilter !== "ALL" ? { visibility: visibilityFilter } : {}),
                  page: String(p),
                }).toString()}`
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
