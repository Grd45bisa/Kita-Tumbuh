import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import {
  getAdminSocialAllocations,
  getFinancialSummary,
} from "@/lib/domain/admin/finance";
import {
  ALLOCATION_APPROVAL_LABELS,
  type AllocationApprovalStatus,
} from "@/lib/validation/finance-schema";
import { AllocationForm } from "@/components/admin/AllocationForm";
import type { SocialAllocation } from "@/types/finance";

export const metadata: Metadata = {
  title: "Alokasi Dana Sosial | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminAllocationsPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const [summary, allocationData] = await Promise.all([
    getFinancialSummary(),
    getAdminSocialAllocations(page, 15),
  ]);

  const getStatusVariant = (st: AllocationApprovalStatus): BadgeVariant => {
    switch (st) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "neutral";
    }
  };

  const columns: Column<SocialAllocation>[] = [
    {
      key: "program_name",
      header: "Nama Program Sosial",
      render: (item: SocialAllocation) => (
        <div>
          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
            {item.program_name}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
            Sumber: {item.funding_source_reference}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Nominal Alokasi",
      render: (item: SocialAllocation) => (
        <span style={{ fontWeight: "bold", color: "var(--color-earth-700)" }}>
          Rp {item.amount.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status Persetujuan",
      render: (item: SocialAllocation) => (
        <Badge variant={getStatusVariant(item.approval_status)}>
          {ALLOCATION_APPROVAL_LABELS[item.approval_status] || item.approval_status}
        </Badge>
      ),
    },
    {
      key: "allocated_at",
      header: "Tanggal Alokasi",
      render: (item: SocialAllocation) => (
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
          {new Date(item.allocated_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Catatan / Peruntukan",
      render: (item: SocialAllocation) => (
        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
          {item.notes || "—"}
        </span>
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
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
          Alokasi Dana Program Sosial
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Penyaluran dana hasil penjualan produk sirkular untuk pembiayaan program sosial dan pemberdayaan anak difabel / lansia.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }}>
        {/* Allocation Creation Form */}
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Buat Alokasi Dana Baru
          </h2>
          <AllocationForm availableBalance={summary.availableBalance} />
        </Card>

        {/* History DataTable */}
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Riwayat Alokasi Dana Sosial ({allocationData.totalCount})
          </h2>
          <DataTable
            columns={columns}
            data={allocationData.allocations}
            keyExtractor={(item) => item.id}
            emptyMessage="Belum ada riwayat alokasi dana sosial yang tercatat."
          />

          {allocationData.totalPages > 1 && (
            <div style={{ marginTop: "var(--space-6)" }}>
              <Pagination
                currentPage={page}
                totalPages={allocationData.totalPages}
                totalCount={allocationData.totalCount}
                pageSize={15}
                buildPageUrl={(p) => `/admin/finance/allocations?page=${p}`}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
