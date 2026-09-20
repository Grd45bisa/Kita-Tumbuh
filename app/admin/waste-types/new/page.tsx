import React from "react";
import Link from "next/link";
import { WasteTypeForm } from "@/components/admin/WasteTypeForm";

export default function NewWasteTypePage() {
  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/admin/waste-types"
          style={{
            fontSize: "var(--font-size-caption)",
            color: "var(--color-brand-primary)",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "var(--space-2)",
          }}
        >
          ← Kembali ke Daftar Limbah
        </Link>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Tambah Jenis Limbah Baru
        </h1>
        <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Masukkan spesifikasi jenis limbah, satuan takaran, dan panduan kondisi diterima/ditolak.
        </p>
      </div>

      <WasteTypeForm />
    </div>
  );
}
