import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getAdminPrograms } from "@/lib/domain/admin/social-programs";
import { getAdminBeneficiaries } from "@/lib/domain/admin/beneficiaries";
import { getAdminDistributions } from "@/lib/domain/admin/distributions";

export const metadata: Metadata = {
  title: "Program & Penerima Manfaat Sosial | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

export default async function AdminSocialHubPage() {
  const [programsData, beneficiariesData, distributionsData] = await Promise.all([
    getAdminPrograms({ pageSize: 1 }),
    getAdminBeneficiaries({ pageSize: 1 }),
    getAdminDistributions({ pageSize: 1 }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
          Program & Penerima Manfaat Sosial
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Kelola program pemberdayaan, data penerima manfaat (privat), dan realisasi penyaluran dana/barang dengan bukti dan jejak persetujuan.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        <Link
          href="/admin/social/programs"
          style={{
            display: "block",
            padding: "var(--space-6)",
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-lg)",
            textDecoration: "none",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
            Program Sosial ({programsData.totalCount}) →
          </h2>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
            Kelola CRUD program pemberdayaan: tujuan, status siklus hidup, target dana, dan visibilitas publik/privat.
          </p>
        </Link>

        <Link
          href="/admin/social/beneficiaries"
          style={{
            display: "block",
            padding: "var(--space-6)",
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-lg)",
            textDecoration: "none",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
            Penerima Manfaat ({beneficiariesData.totalCount}) →
          </h2>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
            Data internal privat: kategori, kebutuhan, status verifikasi, dan status consent/privasi. Tidak pernah diekspos ke publik.
          </p>
        </Link>

        <Link
          href="/admin/social/distributions"
          style={{
            display: "block",
            padding: "var(--space-6)",
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-lg)",
            textDecoration: "none",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
            Distribusi ({distributionsData.totalCount}) →
          </h2>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
            Catat realisasi penyaluran dana/barang ke penerima manfaat, dengan validasi saldo alokasi anti-defisit dan bukti penyaluran.
          </p>
        </Link>
      </div>

      <Card style={{ padding: "var(--space-6)", marginTop: "var(--space-8)", backgroundColor: "var(--color-bg-subtle)" }}>
        <h2 style={{ fontSize: "var(--font-size-body-m)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
          Alur Data
        </h2>
        <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
          Alokasi Dana (Keuangan) → Program Sosial → Penerima Manfaat → Distribusi (bukti penyaluran nyata). Lihat{" "}
          <Link href="/admin/finance/allocations" style={{ color: "var(--color-brand-primary)", textDecoration: "underline" }}>
            Alokasi Program Sosial
          </Link>{" "}
          untuk mencatat dana yang tersedia bagi sebuah program sebelum mencatat distribusinya di sini.
        </p>
      </Card>
    </div>
  );
}
