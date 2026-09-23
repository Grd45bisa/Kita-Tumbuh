import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { getAdminProgramById } from "@/lib/domain/admin/social-programs";
import { getAdminDistributions } from "@/lib/domain/admin/distributions";
import { ProgramForm } from "@/components/admin/ProgramForm";
import type { Distribution } from "@/types/social";

export const metadata: Metadata = {
  title: "Detail Program Sosial | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Independent of each other — both only need `id`, not each other's
  // result — so fetch concurrently instead of sequentially.
  const [program, { distributions }] = await Promise.all([
    getAdminProgramById(id),
    getAdminDistributions({ programId: id, pageSize: 20 }),
  ]);

  if (!program) {
    notFound();
  }

  const columns: Column<Distribution>[] = [
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
      key: "distributed_at",
      header: "Tanggal",
      render: (d) =>
        new Date(d.distributed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/admin/social/programs" style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-brand-primary)", textDecoration: "underline" }}>
          ← Kembali ke Daftar Program
        </Link>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)", marginTop: "var(--space-2)" }}>
          {program.name}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Teralokasi: Rp {(program.allocated_amount || 0).toLocaleString("id-ID")}
          {program.target_amount ? ` dari target Rp ${program.target_amount.toLocaleString("id-ID")}` : " (tanpa target dana tetap)"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }}>
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Edit Program
          </h2>
          <ProgramForm program={program} />
        </Card>

        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Riwayat Distribusi ke Program Ini ({distributions.length})
          </h2>
          <DataTable
            columns={columns}
            data={distributions}
            keyExtractor={(d) => d.id}
            emptyMessage="Belum ada distribusi tercatat untuk program ini."
          />
          <Link
            href="/admin/social/distributions/new"
            style={{ display: "inline-block", marginTop: "var(--space-4)", fontSize: "var(--font-size-body-s)", fontWeight: "600", color: "var(--color-brand-primary)", textDecoration: "underline" }}
          >
            + Catat Distribusi Baru
          </Link>
        </Card>
      </div>
    </div>
  );
}
