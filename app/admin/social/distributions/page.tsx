import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { getAdminDistributions } from "@/lib/domain/admin/distributions";
import { DISTRIBUTION_APPROVAL_LABELS, type DistributionApprovalStatus } from "@/lib/validation/social-schema";
import type { Distribution } from "@/types/social";

export const metadata: Metadata = {
  title: "Distribusi Program Sosial | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminDistributionsPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const { distributions, totalCount, totalPages } = await getAdminDistributions({ page, pageSize: 15 });

  const getStatusVariant = (st: DistributionApprovalStatus): BadgeVariant => {
    switch (st) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "warning";
    }
  };

  const columns: Column<Distribution>[] = [
    {
      key: "program_name",
      header: "Program",
      render: (d) => <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{d.program_name || "—"}</span>,
    },
    {
      key: "beneficiary_name",
      header: "Penerima",
      render: (d) => d.beneficiary_name || "—",
    },
    {
      key: "amount",
      header: "Nominal / Barang",
      render: (d) => (
        <span style={{ fontSize: "var(--font-size-body-s)" }}>
          {d.amount ? `Rp ${d.amount.toLocaleString("id-ID")}` : ""}
          {d.amount && d.item_description ? " + " : ""}
          {d.item_description || ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (d) => <Badge variant={getStatusVariant(d.approval_status)}>{DISTRIBUTION_APPROVAL_LABELS[d.approval_status]}</Badge>,
    },
    {
      key: "distributed_at",
      header: "Tanggal",
      render: (d) =>
        new Date(d.distributed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    },
    {
      key: "evidence",
      header: "Bukti",
      render: (d) =>
        d.evidence_url ? (
          <a href={d.evidence_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-brand-primary)", fontSize: "var(--font-size-caption)" }}>
            Lihat bukti
          </a>
        ) : (
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-caption)" }}>—</span>
        ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <Link href="/admin/social" style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-brand-primary)", textDecoration: "underline" }}>
            ← Kembali ke Program & Penerima Manfaat
          </Link>
          <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)", marginTop: "var(--space-2)" }}>
            Distribusi Program Sosial
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
            Realisasi penyaluran dana/barang ke penerima manfaat dengan bukti dan jejak persetujuan.
          </p>
        </div>
        <Link href="/admin/social/distributions/new">
          <button
            type="button"
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
            + Catat Distribusi
          </button>
        </Link>
      </div>

      <Card style={{ padding: "var(--space-6)" }}>
        <DataTable
          columns={columns}
          data={distributions}
          keyExtractor={(d) => d.id}
          emptyMessage="Belum ada distribusi yang tercatat."
        />

        {totalPages > 1 && (
          <div style={{ marginTop: "var(--space-6)" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={15}
              buildPageUrl={(p) => `/admin/social/distributions?page=${p}`}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
