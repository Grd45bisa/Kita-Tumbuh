import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { getAdminBeneficiaries } from "@/lib/domain/admin/beneficiaries";
import { BeneficiaryForm } from "@/components/admin/BeneficiaryForm";
import {
  BENEFICIARY_CATEGORY_LABELS,
  VERIFICATION_STATUS_LABELS,
  CONSENT_STATUS_LABELS,
  PRIVACY_LEVEL_LABELS,
  type VerificationStatus,
} from "@/lib/validation/social-schema";
import type { Beneficiary } from "@/types/social";

export const metadata: Metadata = {
  title: "Penerima Manfaat | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ category?: string; verification_status?: string; page?: string }>;
}

export default async function AdminBeneficiariesPage({ searchParams }: PageProps) {
  const { category, verification_status, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const { beneficiaries, totalCount, totalPages } = await getAdminBeneficiaries({
    category,
    verificationStatus: verification_status,
    page,
    pageSize: 15,
  });

  const getVerificationVariant = (st: VerificationStatus): BadgeVariant => {
    switch (st) {
      case "VERIFIED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "warning";
    }
  };

  const columns: Column<Beneficiary>[] = [
    {
      key: "name_or_alias",
      header: "Nama / Alias",
      render: (b) => (
        <div>
          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>{b.name_or_alias}</div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
            {BENEFICIARY_CATEGORY_LABELS[b.category]}
          </div>
        </div>
      ),
    },
    {
      key: "need_type",
      header: "Kebutuhan",
      render: (b) => <span style={{ fontSize: "var(--font-size-body-s)" }}>{b.need_type}</span>,
    },
    {
      key: "verification_status",
      header: "Verifikasi",
      render: (b) => <Badge variant={getVerificationVariant(b.verification_status)}>{VERIFICATION_STATUS_LABELS[b.verification_status]}</Badge>,
    },
    {
      key: "consent_privacy",
      header: "Consent / Privasi",
      render: (b) => (
        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)" }}>
          {CONSENT_STATUS_LABELS[b.consent_status]}
          <br />
          {PRIVACY_LEVEL_LABELS[b.privacy_level]}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/admin/social" style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-brand-primary)", textDecoration: "underline" }}>
          ← Kembali ke Program & Penerima Manfaat
        </Link>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)", marginTop: "var(--space-2)" }}>
          Penerima Manfaat
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Data internal privat. Tidak pernah ditampilkan langsung ke publik — lihat kolom Privasi setiap penerima.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }}>
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Tambah Penerima Manfaat
          </h2>
          <BeneficiaryForm />
        </Card>

        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Daftar Penerima Manfaat ({totalCount})
          </h2>
          <DataTable
            columns={columns}
            data={beneficiaries}
            keyExtractor={(b) => b.id}
            emptyMessage="Belum ada penerima manfaat yang tercatat."
          />

          {totalPages > 1 && (
            <div style={{ marginTop: "var(--space-6)" }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={15}
                buildPageUrl={(p) => `/admin/social/beneficiaries?page=${p}`}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
