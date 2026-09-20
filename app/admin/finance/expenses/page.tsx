import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { getAdminExpenses } from "@/lib/domain/admin/finance";
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/validation/finance-schema";
import { ExpenseForm } from "@/components/admin/ExpenseForm";
import type { Expense } from "@/types/finance";

export const metadata: Metadata = {
  title: "Biaya Operasional | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function AdminExpensesPage({ searchParams }: PageProps) {
  const { category, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const {
    expenses,
    totalCount,
    totalExpenseAmount,
    totalPages,
  } = await getAdminExpenses({
    category,
    page,
    pageSize: 15,
  });

  const columns: Column<Expense>[] = [
    {
      key: "category",
      header: "Kategori Beban",
      render: (item: Expense) => (
        <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
          {EXPENSE_CATEGORY_LABELS[item.category as ExpenseCategory] || item.category}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Nominal",
      render: (item: Expense) => (
        <span style={{ fontWeight: "bold", color: "var(--color-danger-fg)" }}>
          Rp {item.amount.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Catatan Rincian",
      render: (item: Expense) => (
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
          {item.notes || "—"}
        </span>
      ),
    },
    {
      key: "occurred_at",
      header: "Tanggal Transaksi",
      render: (item: Expense) => (
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
          {new Date(item.occurred_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "attachment",
      header: "Bukti Nota",
      render: (item: Expense) =>
        item.attachment_url ? (
          <a
            href={item.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "var(--font-size-caption)",
              color: "var(--color-brand-primary)",
              textDecoration: "underline",
            }}
          >
            Buka Nota ↗
          </a>
        ) : (
          <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
            —
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
          Biaya Operasional (Expenses)
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          Pencatatan beban operasional (logistik armada, pengemasan, utilitas) terpisah tegas dari alokasi dana sosial per prinsip integritas finansial AGENTS.md §12.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <Card style={{ padding: "var(--space-6)", backgroundColor: "var(--color-bg-subtle)", border: "1px solid var(--color-border-subtle)" }}>
          <div style={{ fontSize: "var(--font-size-caption)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", fontWeight: "600" }}>
            Total Akumulasi Biaya Operasional
          </div>
          <div style={{ fontSize: "var(--font-size-heading-l)", fontWeight: "bold", color: "var(--color-text-primary)", marginTop: "var(--space-1)" }}>
            Rp {totalExpenseAmount.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
            Total dari {totalCount} transaksi operasional tercatat
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }}>
        {/* Expense Creation Form */}
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
            Catat Pengeluaran Operasional Baru
          </h2>
          <ExpenseForm />
        </Card>

        {/* Expenses List */}
        <Card style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
              Daftar Pengeluaran Operasional
            </h2>

            <form method="GET" style={{ display: "flex", gap: "var(--space-2)" }}>
              <select
                name="category"
                defaultValue={category || "ALL"}
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border-default)",
                  fontSize: "var(--font-size-body-s)",
                  backgroundColor: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                <option value="ALL">Semua Kategori</option>
                <option value="LOGISTICS">Logistik</option>
                <option value="PACKAGING">Kemasan</option>
                <option value="EQUIPMENT">Peralatan</option>
                <option value="UTILITIES">Utilitas</option>
                <option value="OTHER">Lain-Lain</option>
              </select>
              <button
                type="submit"
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  backgroundColor: "var(--color-brand-primary)",
                  color: "var(--color-brand-primary-fg)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--font-size-body-s)",
                  cursor: "pointer",
                }}
              >
                Filter
              </button>
            </form>
          </div>

          <DataTable
            columns={columns}
            data={expenses}
            keyExtractor={(item) => item.id}
            emptyMessage="Belum ada catatan pengeluaran operasional."
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
                  if (category && category !== "ALL") params.set("category", category);
                  params.set("page", String(p));
                  return `/admin/finance/expenses?${params.toString()}`;
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
