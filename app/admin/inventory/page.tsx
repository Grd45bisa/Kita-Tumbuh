import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WasteLotsTable, type WasteLotItem } from "@/components/admin/WasteLotsTable";

export const metadata: Metadata = {
  title: "Inventaris Limbah | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface TransactionItem {
  id: string;
  transaction_type: string;
  waste_type_name: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  unit: string;
  reason: string;
  created_at: string;
}

interface RawLotRow {
  id: string;
  lot_code: string;
  waste_types?: { name: string } | null;
  current_quantity: number | string;
  initial_quantity: number | string;
  unit: string;
  quality_grade: "GRADE_A" | "STANDARD" | "GRADE_C";
  status: "AVAILABLE" | "RESERVED" | "DEPLETED" | "DISCARDED";
  storage_location: string;
  created_at: string;
}

interface RawTxRow {
  id: string;
  transaction_type: string;
  waste_types?: { name: string } | null;
  quantity_change: number | string;
  previous_quantity: number | string;
  new_quantity: number | string;
  unit: string;
  reason: string;
  created_at: string;
}

export default async function AdminInventoryPage() {
  await requirePermission("waste_inventory", "read");
  const supabase = await createClient();

  // Fetch waste lots and recent ledger transactions in parallel — they're
  // independent queries against different tables, no reason to wait on one
  // before starting the other.
  const [{ data: rawLots }, { data: rawTx }] = await Promise.all([
    supabase
      .from("waste_lots")
      .select("*, waste_types ( name )")
      .order("created_at", { ascending: false }),
    supabase
      .from("inventory_transactions")
      .select("*, waste_types ( name )")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const lots: WasteLotItem[] = ((rawLots as unknown as RawLotRow[]) || []).map((l) => ({
    id: l.id,
    lot_code: l.lot_code,
    waste_type_name: l.waste_types?.name || "Limbah",
    current_quantity: Number(l.current_quantity),
    initial_quantity: Number(l.initial_quantity),
    unit: l.unit,
    quality_grade: l.quality_grade,
    status: l.status,
    storage_location: l.storage_location,
    created_at: l.created_at,
  }));

  // 2. Derive stock summaries per waste type (verifiable, non-fabricated)
  const stockSummary: Record<string, { name: string; total: number; unit: string }> = {};
  lots.forEach((lot) => {
    if (lot.status !== "DISCARDED") {
      if (!stockSummary[lot.waste_type_name]) {
        stockSummary[lot.waste_type_name] = {
          name: lot.waste_type_name,
          total: 0,
          unit: lot.unit,
        };
      }
      stockSummary[lot.waste_type_name].total += lot.current_quantity;
    }
  });

  const transactions: TransactionItem[] = ((rawTx as unknown as RawTxRow[]) || []).map((t) => ({
    id: t.id,
    transaction_type: t.transaction_type,
    waste_type_name: t.waste_types?.name || "Limbah",
    quantity_change: Number(t.quantity_change),
    previous_quantity: Number(t.previous_quantity),
    new_quantity: Number(t.new_quantity),
    unit: t.unit,
    reason: t.reason,
    created_at: t.created_at,
  }));

  const ledgerColumns: Column<TransactionItem>[] = [
    {
      key: "created_at",
      header: "Waktu Mutasi",
      width: "160px",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
          {new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
        </span>
      ),
    },
    {
      key: "transaction_type",
      header: "Tipe Transaksi",
      width: "140px",
      align: "center",
      render: (item) => {
        const variant =
          item.transaction_type === "INTAKE"
            ? "success"
            : item.transaction_type === "PRODUCTION_CONSUMPTION"
            ? "info"
            : "warning";
        return <Badge variant={variant}>{item.transaction_type}</Badge>;
      },
    },
    {
      key: "waste_type_name",
      header: "Material",
      render: (item) => <span style={{ fontWeight: 500 }}>{item.waste_type_name}</span>,
    },
    {
      key: "mutation",
      header: "Perubahan",
      align: "right",
      render: (item) => {
        const isPos = item.quantity_change > 0;
        return (
          <span style={{ fontWeight: 700, color: isPos ? "var(--color-brand-primary-hover, #166534)" : "var(--color-danger-fg, #b91c1c)" }}>
            {isPos ? `+${item.quantity_change}` : item.quantity_change} {item.unit}
          </span>
        );
      },
    },
    {
      key: "balance",
      header: "Saldo (Sebelum → Sesudah)",
      align: "center",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
          {item.previous_quantity} → {item.new_quantity} {item.unit}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Alasan Audit",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-caption)", fontStyle: "italic", color: "var(--color-text-primary)" }}>
          {item.reason}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Inventaris & Gudang Limbah
        </h1>
        <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Saldo stok fisik dihitung secara transparan dari lot bahan baku dan buku besar mutasi (append-only ledger).
        </p>
      </div>

      {/* Derived Stock Aggregates */}
      <h2 style={{ fontSize: "var(--font-size-body-m)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
        Saldo Stok Fisik Tersedia (Derivable Stock)
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        {Object.keys(stockSummary).length === 0 ? (
          <Card style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--color-text-muted)" }}>
            Belum ada saldo inventaris fisik yang tercatat.
          </Card>
        ) : (
          Object.values(stockSummary).map((stock) => (
            <Card key={stock.name}>
              <div style={{ fontSize: "var(--font-size-caption)", fontWeight: 600, textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                {stock.name}
              </div>
              <div style={{ fontSize: "var(--font-size-heading-m)", fontWeight: 700, color: "var(--color-text-primary)", margin: "var(--space-2) 0" }}>
                {stock.total.toFixed(2)} {stock.unit}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-brand-primary-hover, #166534)", fontWeight: 500 }}>
                Siap dialokasikan ke batch produksi
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Waste Lots Listing */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
          <div>
            <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              Daftar Lot Fisik Inventaris
            </h2>
            <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
              Unit lot fisik bahan baku yang tersimpan di gudang penyimpanan terpadu.
            </p>
          </div>
        </div>

        <WasteLotsTable lots={lots} />
      </div>

      {/* Immutable Ledger Section */}
      <div>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            Buku Besar Mutasi Stok (Immutable Ledger)
          </h2>
          <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
            Catatan permanen penambahan, pemakaian produksi, dan koreksi fisik beserta alasan pertanggungjawaban.
          </p>
        </div>

        <DataTable
          columns={ledgerColumns}
          data={transactions}
          keyExtractor={(item) => item.id}
          emptyMessage="Belum ada transaksi mutasi di buku besar inventaris."
        />
      </div>
    </div>
  );
}
