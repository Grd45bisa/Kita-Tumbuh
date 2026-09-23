"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { verifyDonationAction } from "@/lib/domain/admin/donations";
import { formatWasteUnitLabel } from "@/types/donation";
import styles from "./AdminDonationForms.module.css";

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
      <h2 className={styles.title}>
        Form Verifikasi Fisik Donasi
      </h2>
      <p className={styles.description}>
        Masukkan hasil penimbangan nyata limbah saat serah terima. Angka ini akan menjadi data terverifikasi resmi di sistem.
      </p>

      {errorMessage && (
        <div role="alert" className={`${styles.message} ${styles.error}`}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div role="status" className={`${styles.message} ${styles.success}`}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div>
            <label htmlFor="decision" className={styles.label}>
              Keputusan Verifikasi
            </label>
            <select
              id="decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value as "VERIFIED" | "REJECTED")}
              disabled={isPending}
              className={styles.select}
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
            label={`Kuantitas Terverifikasi (${formatWasteUnitLabel(unit)})`}
            value={verifiedQuantity}
            onChange={(e) => setVerifiedQuantity(e.target.value)}
            required
            disabled={isPending || decision === "REJECTED"}
            helperText={`Estimasi awal donatur: ${estimatedQuantity} ${formatWasteUnitLabel(unit)}`}
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
          className={styles.submitButton}
        >
          {decision === "REJECTED" ? "Tolak Donasi Ini" : "Simpan & Verifikasi Donasi"}
        </Button>
      </form>
    </Card>
  );
}
