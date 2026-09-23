import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { getAdminRevenueEntries } from "@/lib/domain/admin/finance";
import {
  RECONCILIATION_STATUS_LABELS,
  type ReconciliationStatus,
} from "@/lib/validation/finance-schema";
import { ReconciliationButton } from "@/components/admin/ReconciliationButton";
import type { RevenueEntry } from "@/types/finance";

export const metadata: Metadata = {
  title: "Buku Besar Pendapatan | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function AdminRevenueLedgerPage({ searchParams }: PageProps) {
  const { status, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const {
    entries,
    totalCount,
    totalRevenueAmount,
    totalPages,
  } = await getAdminRevenueEntries({
    reconciliationStatus: status,
    page,
    pageSize: 15,
  });

  const getReconciliationVariant = (st: ReconciliationStatus): BadgeVariant => {
    switch (st) {
      case "RECONCILED":
        return "success";
      case "PENDING":
        return "warning";
      case "DISCREPANCY":
        return "danger";
      default:
        return "neutral";
    }
  };

  const columns: Column<RevenueEntry>[] = [
    {
      key: "occurred_at",
      header: "Waktu Realisasi",
      render: (entry: RevenueEntry) => (
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
          {new Date(entry.occurred_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          })} WIB
        </span>
      ),
    },
    {
      key: "reference",
      header: "Pesanan Terkait",
      render: (entry: RevenueEntry) => (
        <Link
          href={`/admin/orders/${entry.order_id}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: "600",
            color: "var(--color-brand-primary)",
            textDecoration: "underline",
          }}
        >
          {entry.order_reference || "Lihat Pesanan"}
        </Link>
      ),
    },
    {
      key: "amount",
      header: "Nominal Masuk",
      render: (entry: RevenueEntry) => (
        <span style={{ fontWeight: "bold", color: "var(--color-green-800)" }}>
          Rp {entry.amount.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Rekonsiliasi Bank",
      render: (entry: RevenueEntry) => (
        <Badge variant={getReconciliationVariant(entry.reconciliation_status)}>
          {RECONCILIATION_STATUS_LABELS[entry.reconciliation_status] || entry.reconciliation_status}
        </Badge>
      ),
    },
    {
      key: "notes",
      header: "Catatan Mutasi",
      render: (entry: RevenueEntry) => (
        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
          {entry.notes || "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (entry: RevenueEntry) => (
        <ReconciliationButton
          entryId={entry.id}
          currentStatus={entry.reconciliation_status}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/admin/finance"
          style={{
            fontSize: "var(--font-size-body-s)",
            color: "var(--color-brand-primary)",
            textDecoration: "underline",
            display: "inline-block",
            marginBottom: "var(--space-2)",
          }}
        >
          ← Kembali ke Ringkasan Keuangan
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
              Buku Besar Pendapatan (Revenue Ledger)
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
              Pencatatan append-only atas setiap pendapatan pesanan produk sirkular yang terkonfirmasi lunas.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <Card style={{ padding: "var(--space-6)", backgroundColor: "var(--color-green-100)", border: "1px solid var(--color-green-200)" }}>
          <div style={{ fontSize: "var(--font-size-caption)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-green-800)", fontWeight: "600" }}>
            Total Akumulasi Pendapatan
          </div>
          <div style={{ fontSize: "var(--font-size-heading-l)", fontWeight: "bold", color: "var(--color-green-800)", marginTop: "var(--space-1)" }}>
            Rp {totalRevenueAmount.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
            Total riil dari {totalCount} mutasi penjualan produk
          </div>
        </Card>
      </div>

      <Card style={{ padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <form method="GET" style={{ display: "flex", gap: "var(--space-4)", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <select
              name="status"
              defaultValue={status || "ALL"}
              style={{
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border-default)",
                fontSize: "var(--font-size-body-s)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="ALL">Semua Status Rekonsiliasi</option>
              <option value="RECONCILED">Terekonsiliasi Cocok</option>
              <option value="PENDING">Menunggu Rekonsiliasi</option>
              <option value="DISCREPANCY">Terdapat Selisih</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: "var(--color-brand-primary)",
              color: "var(--color-brand-primary-fg)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-body-s)",
              fontWeight: "var(--font-weight-medium)",
              cursor: "pointer",
            }}
          >
            Filter
          </button>
        </form>
      </Card>

      <Card style={{ padding: "var(--space-6)" }}>
        <DataTable
          columns={columns}
          data={entries}
          keyExtractor={(e) => e.id}
          emptyMessage="Belum ada catatan pendapatan yang masuk."
        />

        {totalPages > 1 && (
          <div style={{ marginTop: "var(--space-6)" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={15}
              buildPageUrl={(p) => {
                const params = new URLSearchParams();
                if (status && status !== "ALL") params.set("status", status);
                params.set("page", String(p));
                return `/admin/finance/revenue?${params.toString()}`;
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
