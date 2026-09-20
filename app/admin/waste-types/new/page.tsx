import React from "react";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { WasteTypeForm } from "@/components/admin/WasteTypeForm";

export default async function NewWasteTypePage() {
  // Every other admin "new"/"edit" page gates itself at the page level
  // (e.g. app/admin/waste-types/[id]/edit/page.tsx) so a role that only has
  // "read" on this module (FINANCE, SOCIAL_OFFICER per ARSITEKTUR.md §11)
  // never even sees the create form — only the shared layout's baseline
  // "dashboard: read" gate (app/admin/layout.tsx) was protecting this page,
  // which is not module-specific. Found missing during the Phase 9 audit.
  await requirePermission("waste_inventory", "write");

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
