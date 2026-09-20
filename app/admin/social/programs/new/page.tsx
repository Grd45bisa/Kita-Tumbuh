import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgramForm } from "@/components/admin/ProgramForm";

export const metadata: Metadata = {
  title: "Program Baru | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

export default function NewProgramPage() {
  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/admin/social/programs" style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-brand-primary)", textDecoration: "underline" }}>
          ← Kembali ke Daftar Program
        </Link>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)", marginTop: "var(--space-2)" }}>
          Buat Program Sosial Baru
        </h1>
      </div>

      <Card style={{ padding: "var(--space-6)", maxWidth: "42rem" }}>
        <ProgramForm />
      </Card>
    </div>
  );
}
