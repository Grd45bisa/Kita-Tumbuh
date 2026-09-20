import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { WasteType } from "@/types/donation";

interface WasteTypeRow extends WasteType {
  is_active: boolean;
}

export default async function AdminWasteTypesPage() {
  const supabase = await createClient();

  const { data: rawWasteTypes } = await supabase
    .from("waste_types")
    .select("*")
    .order("sort_order", { ascending: true });

  const wasteTypes = (rawWasteTypes || []) as WasteTypeRow[];

  const columns: Column<WasteTypeRow>[] = [
    {
      key: "sort_order",
      header: "Urutan",
      width: "80px",
      align: "center",
      render: (item) => <span style={{ fontWeight: 600 }}>{item.sort_order}</span>,
    },
    {
      key: "name",
      header: "Nama Kategori",
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{item.name}</div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
            {item.slug}
          </div>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Satuan",
      width: "90px",
      align: "center",
      render: (item) => <Badge variant="neutral">{item.unit}</Badge>,
    },
    {
      key: "quantity_range",
      header: "Batasan Donasi",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-caption)" }}>
          Min: {item.min_quantity} {item.unit}
          {item.max_quantity != null ? ` • Maks: ${item.max_quantity} ${item.unit}` : " • Tanpa batas"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      width: "110px",
      align: "center",
      render: (item) => (
        <Badge variant={item.is_active ? "success" : "neutral"}>
          {item.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      width: "120px",
      align: "right",
      render: (item) => (
        <Link href={`/admin/waste-types/${item.id}/edit`}>
          <Button variant="secondary" size="sm">
            Ubah
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Master Data Jenis Limbah
          </h1>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Kelola kategori limbah rumah tangga yang dapat didonasikan melalui form publik.
          </p>
        </div>

        <Link href="/admin/waste-types/new">
          <Button variant="primary" size="md">
            + Tambah Jenis Limbah
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={wasteTypes}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada data master jenis limbah."
      />
    </div>
  );
}
