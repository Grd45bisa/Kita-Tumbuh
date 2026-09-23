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
import type { ProductionBatchStatus } from "@/lib/validation/production-batch-schema";

export const metadata: Metadata = {
  title: "Batch Produksi | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface BatchRow {
  id: string;
  batch_number: string;
  title: string;
  status: ProductionBatchStatus;
  target_output_type: string;
  target_quantity: number | string;
  actual_output_quantity: number | string;
  loss_quantity: number | string;
  output_unit: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function AdminProductionPage({ searchParams }: PageProps) {
  await requirePermission("production", "read");
  const { status: statusFilter, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const pageSize = 10;

  const supabase = await createClient();

  // Metric counts and the filtered/paginated batch list are independent
  // queries against the same table with different projections — run them
  // concurrently instead of one after the other.
  let query = supabase
    .from("production_batches")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const [{ data: allBatches }, { data: rawBatches, count: filteredCount }] = await Promise.all([
    supabase.from("production_batches").select("status, target_quantity, actual_output_quantity"),
    query.range(from, to),
  ]);

  const totalCount = allBatches?.length || 0;
  const inProgressCount = allBatches?.filter((b) => b.status === "IN_PROGRESS" || b.status === "QC_REVIEW").length || 0;
  const completedCount = allBatches?.filter((b) => b.status === "COMPLETED" || b.status === "RELEASED").length || 0;
  const plannedCount = allBatches?.filter((b) => b.status === "PLANNED").length || 0;

  const batches = (rawBatches as unknown as BatchRow[]) || [];
  const totalItems = filteredCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const getStatusBadge = (s: ProductionBatchStatus) => {
    switch (s) {
      case "RELEASED":
        return <Badge variant="success">RELEASED</Badge>;
      case "COMPLETED":
        return <Badge variant="info">COMPLETED</Badge>;
      case "QC_REVIEW":
        return <Badge variant="warning">QC_REVIEW</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="brand">IN_PROGRESS</Badge>;
      default:
        return <Badge variant="neutral">PLANNED</Badge>;
    }
  };

  const columns: Column<BatchRow>[] = [
    {
      key: "batch_number",
      header: "Nomor Batch",
      render: (item) => (
        <div>
          <Link
            href={`/admin/production/${item.id}`}
            style={{ fontWeight: 600, color: "var(--color-brand-primary)", textDecoration: "underline" }}
          >
            {item.batch_number}
          </Link>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)", marginTop: "2px" }}>
            {item.title}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "target_output_type",
      header: "Produk Target",
      render: (item) => (
        <div>
          <p style={{ fontWeight: 500 }}>{item.target_output_type}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-ink-500)" }}>
            Target: {Number(item.target_quantity)} {item.output_unit}
          </p>
        </div>
      ),
    },
    {
      key: "actual_output_quantity",
      header: "Hasil Riil / Loss",
      render: (item) => (
        <div>
          <p style={{ fontWeight: 600 }}>
            {Number(item.actual_output_quantity) > 0 ? (
              `${Number(item.actual_output_quantity)} ${item.output_unit}`
            ) : (
              <span style={{ color: "var(--color-ink-500)", fontWeight: 400 }}>—</span>
            )}
          </p>
          {Number(item.loss_quantity) > 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-earth-700)" }}>
              Loss: {Number(item.loss_quantity)} {item.output_unit}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Dibuat Pada",
      render: (item) => (
        <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>
          {new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (item) => (
        <Link href={`/admin/production/${item.id}`}>
          <Button variant="secondary" size="sm">
            Detail &rarr;
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginBottom: "var(--space-1)" }}>
            Batch Produksi Sirkular
          </h1>
          <p style={{ color: "var(--color-ink-600)", fontSize: "0.9375rem" }}>
            Pelacakan siklus pengolahan limbah menjadi produk bernilai ekonomi (ARSITEKTUR.md §6 & §7.2).
          </p>
        </div>
        <Link href="/admin/production/new">
          <Button variant="primary" size="md">
            + Buat Batch Baru
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Total Batch Terdaftar</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginTop: "4px" }}>
            {totalCount}
          </p>
        </Card>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Batch Sedang Aktif / QC</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-earth-700)", marginTop: "4px" }}>
            {inProgressCount}
          </p>
        </Card>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Selesai / Siap Rilis</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginTop: "4px" }}>
            {completedCount}
          </p>
        </Card>
        <Card style={{ padding: "var(--space-4)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>Direncanakan (PLANNED)</span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-ink-700)", marginTop: "4px" }}>
            {plannedCount}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ padding: "var(--space-4)" }}>
        <form method="get" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-ink-700)" }}>
            Filter Status:
          </span>
          <select
            name="status"
            defaultValue={statusFilter || "ALL"}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-subtle)",
              fontSize: "0.875rem",
              backgroundColor: "white",
            }}
          >
            <option value="ALL">Semua Status</option>
            <option value="PLANNED">Direncanakan (PLANNED)</option>
            <option value="IN_PROGRESS">Sedang Diproses (IN_PROGRESS)</option>
            <option value="QC_REVIEW">Uji Mutu (QC_REVIEW)</option>
            <option value="COMPLETED">Selesai (COMPLETED)</option>
            <option value="RELEASED">Siap Rilis (RELEASED)</option>
          </select>

          <Button type="submit" variant="secondary" size="sm">
            Terapkan Filter
          </Button>

          {statusFilter && statusFilter !== "ALL" && (
            <Link href="/admin/production" style={{ fontSize: "0.8125rem", color: "var(--color-ink-500)", textDecoration: "underline" }}>
              Reset Filter
            </Link>
          )}
        </form>
      </Card>

      {/* Batches Table */}
      <Card>
        <DataTable
          columns={columns}
          data={batches}
          keyExtractor={(item) => item.id}
          emptyMessage={
            statusFilter && statusFilter !== "ALL"
              ? "Tidak ada batch produksi dengan status yang dipilih."
              : "Belum ada batch produksi terdaftar. Mulai buat batch baru."
          }
        />
        {totalPages > 1 && (
          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border-subtle)" }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalItems}
              pageSize={pageSize}
              buildPageUrl={(p) =>
                `/admin/production?${new URLSearchParams({
                  ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}),
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
