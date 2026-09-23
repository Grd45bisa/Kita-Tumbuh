import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { getAdminPrograms } from "@/lib/domain/admin/social-programs";
import {
  SOCIAL_PROGRAM_STATUS_LABELS,
  type SocialProgramStatus,
} from "@/lib/validation/social-schema";
import type { SocialProgram } from "@/types/social";

export const metadata: Metadata = {
  title: "Program Sosial | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminProgramsPage({ searchParams }: PageProps) {
  const { status, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const { programs, totalCount, totalPages } = await getAdminPrograms({ status, page, pageSize: 15 });

  const getStatusVariant = (st: SocialProgramStatus): BadgeVariant => {
    switch (st) {
      case "COMPLETED":
      case "FUNDED":
        return "success";
      case "ACTIVE":
      case "APPROVED":
      case "PARTIALLY_FUNDED":
      case "DISTRIBUTED":
        return "info";
      case "REVIEW":
        return "warning";
      default:
        return "neutral";
    }
  };

  const columns: Column<SocialProgram>[] = [
    {
      key: "name",
      header: "Nama Program",
      render: (p) => (
        <div>
          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>{p.name}</div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>/{p.slug}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge variant={getStatusVariant(p.status)}>{SOCIAL_PROGRAM_STATUS_LABELS[p.status]}</Badge>,
    },
    {
      key: "target",
      header: "Target / Teralokasi",
      render: (p) => (
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-primary)" }}>
          {p.target_amount ? `Rp ${p.target_amount.toLocaleString("id-ID")}` : "Tanpa target"}
          <br />
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-caption)" }}>
            Teralokasi: Rp {(p.allocated_amount || 0).toLocaleString("id-ID")}
          </span>
        </span>
      ),
    },
    {
      key: "public_status",
      header: "Visibilitas",
      render: (p) => (
        <Badge variant={p.public_status ? "success" : "neutral"}>{p.public_status ? "Publik" : "Privat"}</Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (p) => (
        <Link
          href={`/admin/social/programs/${p.id}`}
          style={{ fontSize: "var(--font-size-body-s)", fontWeight: "600", color: "var(--color-brand-primary)", textDecoration: "underline" }}
        >
          Kelola
        </Link>
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
            Program Sosial
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
            Kelola program pemberdayaan yang dibiayai dari alokasi pendapatan produk sirkular.
          </p>
        </div>
        <Link href="/admin/social/programs/new">
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
            + Program Baru
          </button>
        </Link>
      </div>

      <Card style={{ padding: "var(--space-6)" }}>
        <DataTable
          columns={columns}
          data={programs}
          keyExtractor={(p) => p.id}
          emptyMessage="Belum ada program sosial yang tercatat. Buat program baru untuk mulai mengalokasikan dana."
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
                return `/admin/social/programs?${params.toString()}`;
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
