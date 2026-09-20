import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WasteTypeForm } from "@/components/admin/WasteTypeForm";
import type { WasteType } from "@/types/donation";

interface EditWasteTypePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWasteTypePage({ params }: EditWasteTypePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rawWasteType, error } = await supabase
    .from("waste_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !rawWasteType) {
    notFound();
  }

  const wasteType = rawWasteType as WasteType;

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
          Ubah Jenis Limbah: {wasteType.name}
        </h1>
        <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Perbarui batas kuantitas, panduan pemilahan, atau status aktif limbah ini.
        </p>
      </div>

      <WasteTypeForm initialData={wasteType} isEdit={true} />
    </div>
  );
}
