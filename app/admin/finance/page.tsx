import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getFinancialSummary } from "@/lib/domain/admin/finance";

export const metadata: Metadata = {
  title: "Keuangan & Alokasi Sosial | Admin SEMAI",
  robots: { index: false, follow: false },
};

export default async function AdminFinanceHubPage() {
  const summary = await getFinancialSummary();

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
          Keuangan & Alokasi Sosial
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Pencatatan realisasi pendapatan produk sirkular, alokasi dana program sosial, dan pemantauan saldo kas terverifikasi.
        </p>
      </div>

      {/* Financial metric summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        <Card style={{ padding: "var(--space-6)", backgroundColor: "var(--color-green-100)", border: "1px solid var(--color-green-200)" }}>
          <div style={{ fontSize: "var(--font-size-caption)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-green-800)", fontWeight: "600", marginBottom: "var(--space-1)" }}>
            Total Pendapatan Terwujud
          </div>
          <div style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-green-800)" }}>
            Rp {summary.totalRevenue.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
            Dari penjualan produk terverifikasi (Lunas)
          </div>
        </Card>

        <Card style={{ padding: "var(--space-6)", backgroundColor: "var(--color-earth-100)", border: "1px solid var(--color-earth-300)" }}>
          <div style={{ fontSize: "var(--font-size-caption)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-earth-700)", fontWeight: "600", marginBottom: "var(--space-1)" }}>
            Alokasi Dana Sosial Disetujui
          </div>
          <div style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-earth-700)" }}>
            Rp {summary.totalAllocations.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
            Telah disalurkan ke program pemberdayaan
          </div>
        </Card>

        <Card style={{ padding: "var(--space-6)", backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
          <div style={{ fontSize: "var(--font-size-caption)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", fontWeight: "600", marginBottom: "var(--space-1)" }}>
            Saldo Tersedia untuk Dialokasikan
          </div>
          <div style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-brand-primary)" }}>
            Rp {summary.availableBalance.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
            Pendapatan dikurangi alokasi yang disetujui
          </div>
        </Card>
      </div>

      {/* Module sub-links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        <Link
          href="/admin/finance/revenue"
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
            Buku Besar Pendapatan (Revenue Ledger) →
          </h2>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
            Lacak setiap nominal rupiah yang terealisasi dari pesanan produk lunas secara append-only, beserta status rekonsiliasi perbankan.
          </p>
        </Link>

        <Link
          href="/admin/finance/allocations"
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
            Alokasi Program Sosial →
          </h2>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
            Alokasikan saldo pendapatan bersih ke program sosial (pemberdayaan difabel / lansia) dengan validasi saldo server-side anti-defisit.
          </p>
        </Link>

        <Link
          href="/admin/finance/expenses"
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
            Biaya Operasional (Expenses) →
          </h2>
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
            Catat pengeluaran operasional logistik, wadah pengemasan, dan utilitas secara terpisah dari dana sosial per prinsip transparansi.
          </p>
        </Link>
      </div>
    </div>
  );
}
