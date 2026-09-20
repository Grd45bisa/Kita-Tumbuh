import React from "react";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductionBatchForm } from "@/components/admin/ProductionBatchForm";

export const metadata: Metadata = {
  title: "Buat Batch Produksi Baru | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

export default function NewProductionBatchPage() {
  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "Batch Produksi", href: "/admin/production" },
    { label: "Buat Batch Baru" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "800px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-brand-primary)", marginBottom: "var(--space-1)" }}>
          Rencanakan Batch Produksi Baru
        </h1>
        <p style={{ color: "var(--color-ink-600)", fontSize: "0.9375rem" }}>
          Inisialisasi batch kerja baru sebelum bahan baku limbah dialokasikan.
        </p>
      </div>

      <ProductionBatchForm />
    </div>
  );
}
