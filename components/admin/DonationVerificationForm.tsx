"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { verifyDonationAction } from "@/lib/domain/admin/donations";

interface DonationVerificationFormProps {
  donationId: string;
  reference: string;
  unit: string;
  estimatedQuantity: number;
  initialVerifiedQuantity?: number | null;
  initialNotes?: string | null;
  currentStatus: string;
}

export function DonationVerificationForm({
  donationId,
  reference,
  unit,
  estimatedQuantity,
  initialVerifiedQuantity,
  initialNotes,
  currentStatus,
}: DonationVerificationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [verifiedQuantity, setVerifiedQuantity] = useState(
    initialVerifiedQuantity != null
      ? String(initialVerifiedQuantity)
      : String(estimatedQuantity)
  );
  const [notes, setNotes] = useState(initialNotes || "");
  const [decision, setDecision] = useState<"VERIFIED" | "REJECTED">(
    currentStatus === "REJECTED" ? "REJECTED" : "VERIFIED"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await verifyDonationAction(donationId, reference, {
        verified_quantity: Number(verifiedQuantity),
        verification_notes: notes,
        decision,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan verifikasi donasi.");
      } else {
        setSuccessMessage("Verifikasi fisik donasi berhasil disimpan dan tercatat di audit trail.");
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
        Form Verifikasi Fisik Donasi
      </h2>
      <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
        Masukkan hasil penimbangan nyata limbah saat serah terima. Angka ini akan menjadi data terverifikasi resmi di sistem.
      </p>

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-danger-bg, #fef2f2)",
            color: "var(--color-danger-fg, #b91c1c)",
            border: "1px solid var(--color-danger-border, #fecaca)",
            fontSize: "var(--font-size-body-s)",
            marginBottom: "var(--space-4)",
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-green-100)",
            color: "var(--color-brand-primary-hover, #166534)",
            border: "1px solid var(--color-green-200, #bbf7d0)",
            fontSize: "var(--font-size-body-s)",
            marginBottom: "var(--space-4)",
          }}
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div>
            <label
              htmlFor="decision"
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-1)",
              }}
            >
              Keputusan Verifikasi
            </label>
            <select
              id="decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value as "VERIFIED" | "REJECTED")}
              disabled={isPending}
              style={{
                width: "100%",
                height: "42px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-default)",
                padding: "0 var(--space-3)",
                fontSize: "var(--font-size-body-s)",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="VERIFIED">Diterima & Terverifikasi (VERIFIED)</option>
              <option value="REJECTED">Ditolak / Tidak Sesuai Kriteria (REJECTED)</option>
            </select>
          </div>

          <Input
            id="verified_qty"
            name="verified_quantity"
            type="number"
            step="0.01"
            label={`Kuantitas Terverifikasi (${unit})`}
            value={verifiedQuantity}
            onChange={(e) => setVerifiedQuantity(e.target.value)}
            required
            disabled={isPending || decision === "REJECTED"}
            helperText={`Estimasi awal donatur: ${estimatedQuantity} ${unit}`}
          />
        </div>

        <Textarea
          id="verification_notes"
          name="verification_notes"
          label="Catatan Verifikasi / Kondisi Fisik Limbah"
          placeholder="Contoh: Ditimbang dengan timbangan digital pos utama, kemasan jeriken bersih, minyak tersaring baik..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          rows={3}
          disabled={isPending}
        />

        <Button
          type="submit"
          variant={decision === "REJECTED" ? "destructive" : "primary"}
          size="md"
          isLoading={isPending}
          style={{ alignSelf: "flex-start" }}
        >
          {decision === "REJECTED" ? "Tolak Donasi Ini" : "Simpan & Verifikasi Donasi"}
        </Button>
      </form>
    </Card>
  );
}
