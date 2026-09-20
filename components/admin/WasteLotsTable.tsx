"use client";

import React, { useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InventoryAdjustmentModal } from "./InventoryAdjustmentModal";

export interface WasteLotItem {
  id: string;
  lot_code: string;
  waste_type_name: string;
  current_quantity: number;
  initial_quantity: number;
  unit: string;
  quality_grade: string;
  status: string;
  storage_location: string;
  created_at: string;
}

interface WasteLotsTableProps {
  lots: WasteLotItem[];
}

export function WasteLotsTable({ lots }: WasteLotsTableProps) {
  const [selectedLot, setSelectedLot] = useState<WasteLotItem | null>(null);

  const columns: Column<WasteLotItem>[] = [
    {
      key: "lot_code",
      header: "Kode Lot",
      render: (item) => (
        <div>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "var(--color-brand-primary)" }}>
            {item.lot_code}
          </span>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "waste_type_name",
      header: "Kategori Limbah",
      render: (item) => <span style={{ fontWeight: 600 }}>{item.waste_type_name}</span>,
    },
    {
      key: "stock",
      header: "Saldo Stok",
      render: (item) => (
        <div>
          <strong style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-primary)" }}>
            {item.current_quantity} {item.unit}
          </strong>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            Awal: {item.initial_quantity} {item.unit}
          </div>
        </div>
      ),
    },
    {
      key: "quality_grade",
      header: "Grade",
      width: "110px",
      align: "center",
      render: (item) => <Badge variant="neutral">{item.quality_grade}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      align: "center",
      render: (item) => (
        <Badge variant={item.status === "AVAILABLE" ? "success" : item.status === "DEPLETED" ? "neutral" : "warning"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "storage_location",
      header: "Lokasi Gudang",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
          {item.storage_location}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      width: "140px",
      align: "right",
      render: (item) => (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setSelectedLot(item)}
          disabled={item.status === "DEPLETED"}
        >
          Sesuaikan
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={lots}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada lot limbah yang tercatat di inventaris."
      />

      {selectedLot && (
        <InventoryAdjustmentModal
          lotId={selectedLot.id}
          lotCode={selectedLot.lot_code}
          currentQuantity={selectedLot.current_quantity}
          unit={selectedLot.unit}
          onClose={() => setSelectedLot(null)}
        />
      )}
    </>
  );
}
