import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DistributionForm } from "@/components/admin/DistributionForm";
import { getAdminPrograms } from "@/lib/domain/admin/social-programs";
import { getAdminBeneficiaryOptions } from "@/lib/domain/admin/beneficiaries";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Catat Distribusi | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

export default async function NewDistributionPage() {
  await requirePermission("social_programs", "write");
  await requirePermission("beneficiaries", "write");
  const [programsData, beneficiaries] = await Promise.all([
    getAdminPrograms({ pageSize: 50 }),
    getAdminBeneficiaryOptions(),
  ]);

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/admin/social/distributions" style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-brand-primary)", textDecoration: "underline" }}>
          ← Kembali ke Daftar Distribusi
        </Link>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)", marginTop: "var(--space-2)" }}>
          Catat Distribusi Baru
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Jika distribusi ini menggunakan dana dari alokasi program, pilih alokasi terkait — sistem akan menolak nominal yang melebihi sisa alokasi.
        </p>
      </div>

      <Card style={{ padding: "var(--space-6)", maxWidth: "42rem" }}>
        {beneficiaries.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)" }}>
            Belum ada penerima manfaat yang <strong>terverifikasi</strong>. Verifikasi minimal satu penerima manfaat di{" "}
            <Link href="/admin/social/beneficiaries" style={{ color: "var(--color-brand-primary)", textDecoration: "underline" }}>
              halaman Penerima Manfaat
            </Link>{" "}
            sebelum mencatat distribusi.
          </p>
        ) : (
          <DistributionForm
            programs={programsData.programs.map((p) => ({ id: p.id, name: p.name }))}
            beneficiaries={beneficiaries}
          />
        )}
      </Card>
    </div>
  );
}
