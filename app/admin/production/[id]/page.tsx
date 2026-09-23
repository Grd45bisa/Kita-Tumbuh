import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { BatchStatusWorkflow } from "@/components/admin/BatchStatusWorkflow";
import { AddBatchInputForm, type AvailableLotOption } from "@/components/admin/AddBatchInputForm";
import type { ProductionBatchStatus } from "@/lib/validation/production-batch-schema";

export const metadata: Metadata = {
  title: "Detail Batch Produksi | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface RawInputRow {
  id: string;
  quantity_used: number | string;
  unit: string;
  notes: string | null;
  added_at: string;
  waste_lots?: {
    id: string;
    lot_code: string;
    waste_types?: {
      name: string;
    } | null;
  } | null;
}

interface BatchInputItem {
  id: string;
  lot_code: string;
  waste_type_name: string;
  quantity_used: number;
  unit: string;
  notes: string | null;
  added_at: string;
}

interface RawAvailableLot {
  id: string;
  lot_code: string;
  current_quantity: number | string;
  unit: string;
  quality_grade: string;
  waste_types?: {
    name: string;
  } | null;
}

export default async function ProductionBatchDetailPage({ params }: PageProps) {
  await requirePermission("production", "read");
  const { id } = await params;
  const supabase = await createClient();

  // Batch details, allocated inputs, and the available-lots dropdown are
  // three independent queries (inputs/available-lots don't depend on the
  // batch row itself, only on `id` from params, already available) — run
  // them concurrently instead of sequentially.
  const [
    { data: batch, error: batchError },
    { data: rawInputs },
    { data: rawAvailableLots },
  ] = await Promise.all([
    supabase.from("production_batches").select("*").eq("id", id).single(),
    supabase
      .from("batch_inputs")
      .select("*, waste_lots ( id, lot_code, waste_types ( name ) )")
      .eq("batch_id", id)
      .order("added_at", { ascending: true }),
    supabase
      .from("waste_lots")
      .select("id, lot_code, current_quantity, unit, quality_grade, waste_types ( name )")
      .eq("status", "AVAILABLE")
      .gt("current_quantity", 0)
      .order("created_at", { ascending: false }),
  ]);

  if (batchError || !batch) {
    notFound();
  }

  const inputs: BatchInputItem[] = ((rawInputs as unknown as RawInputRow[]) || []).map((inp) => ({
    id: inp.id,
    lot_code: inp.waste_lots?.lot_code || "LOT-???",
    waste_type_name: inp.waste_lots?.waste_types?.name || "Limbah",
    quantity_used: Number(inp.quantity_used),
    unit: inp.unit,
    notes: inp.notes,
    added_at: inp.added_at,
  }));

  const availableLots: AvailableLotOption[] = ((rawAvailableLots as unknown as RawAvailableLot[]) || []).map((l) => ({
    id: l.id,
    lot_code: l.lot_code,
    waste_type_name: l.waste_types?.name || "Limbah",
    current_quantity: Number(l.current_quantity),
    unit: l.unit,
    quality_grade: l.quality_grade,
  }));

  const isClosed = batch.status === "COMPLETED" || batch.status === "RELEASED";

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "Batch Produksi", href: "/admin/production" },
    { label: batch.batch_number },
  ];

  const inputColumns: Column<BatchInputItem>[] = [
    {
      key: "lot_code",
      header: "Kode Lot Sumber",
      render: (item) => (
        <span style={{ fontWeight: 600, color: "var(--color-brand-primary)" }}>
          {item.lot_code}
        </span>
      ),
    },
    {
      key: "waste_type_name",
      header: "Jenis Limbah",
      render: (item) => item.waste_type_name,
    },
    {
      key: "quantity_used",
      header: "Kuantitas Digunakan",
      render: (item) => (
        <span style={{ fontWeight: 600 }}>
          {item.quantity_used} {item.unit}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Catatan",
      render: (item) => item.notes || "—",
    },
    {
      key: "added_at",
      header: "Waktu Alokasi",
      render: (item) =>
        new Date(item.added_at).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-brand-primary)" }}>
            {batch.batch_number}
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-ink-900)", marginTop: "2px", marginBottom: "var(--space-1)" }}>
            {batch.title}
          </h1>
          <p style={{ color: "var(--color-ink-600)", fontSize: "0.9375rem" }}>
            Target Luaran: <strong>{batch.target_output_type}</strong> ({Number(batch.target_quantity)} {batch.output_unit})
          </p>
        </div>
        <Link href="/admin/production">
          <button
            type="button"
            style={{
              padding: "var(--space-2) var(--space-4)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-subtle)",
              backgroundColor: "white",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            &larr; Kembali ke Daftar
          </button>
        </Link>
      </div>

      {/* State Machine Workflow Component */}
      <BatchStatusWorkflow
        batchId={batch.id}
        currentStatus={batch.status as ProductionBatchStatus}
        targetQuantity={Number(batch.target_quantity)}
        outputUnit={batch.output_unit}
        initialActualOutput={Number(batch.actual_output_quantity)}
        initialLoss={Number(batch.loss_quantity)}
        initialLossReason={batch.loss_reason || ""}
      />

      {/* Inputs (M:N Lot Linkage) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-brand-primary)" }}>
              Bahan Baku Limbah yang Digunakan (Batch Inputs)
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-ink-600)" }}>
              Silsilah lot limbah yang dialokasikan ke proses ini (ARSITEKTUR.md §6).
            </p>
          </div>
        </div>

        <Card>
          <DataTable
            columns={inputColumns}
            data={inputs}
            keyExtractor={(item) => item.id}
            emptyMessage="Belum ada bahan baku dialokasikan. Gunakan form di bawah untuk mengalokasikan lot limbah aktif dari inventaris."
          />
        </Card>

        {/* Add Input Form */}
        <AddBatchInputForm
          batchId={batch.id}
          availableLots={availableLots}
          disabled={isClosed}
        />
      </div>
    </div>
  );
}
