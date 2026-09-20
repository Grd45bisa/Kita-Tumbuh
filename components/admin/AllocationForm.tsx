"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { allocateRevenueAction } from "@/lib/domain/admin/finance";

interface AllocationFormProps {
  availableBalance: number;
}

export function AllocationForm({ availableBalance }: AllocationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [programName, setProgramName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const numericAmount = parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const isOverBalance = numericAmount > availableBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    if (numericAmount <= 0) {
      setErrorMessage("Nominal alokasi harus lebih dari Rp 0.");
      return;
    }

    if (isOverBalance) {
      setErrorMessage(
        `Nominal alokasi (Rp ${numericAmount.toLocaleString("id-ID")}) melebihi saldo pendapatan yang tersedia (Rp ${availableBalance.toLocaleString("id-ID")}).`
      );
      return;
    }

    startTransition(async () => {
      const res = await allocateRevenueAction({
        program_name: programName,
        amount: numericAmount,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengalokasikan dana sosial.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      setSuccessMessage(
        `Alokasi dana sebesar Rp ${numericAmount.toLocaleString("id-ID")} berhasil disetujui dan dicatat!`
      );
      setProgramName("");
      setAmount("");
      setNotes("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger-fg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
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
            backgroundColor: "var(--color-success-bg)",
            color: "var(--color-success-fg)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
          }}
        >
          {successMessage}
        </div>
      )}

      <div
        style={{
          padding: "var(--space-4)",
          backgroundColor: "var(--color-bg-subtle)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
          Saldo Pendapatan Tersedia untuk Alokasi:
        </span>
        <span style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", color: "var(--color-brand-primary)" }}>
          Rp {availableBalance.toLocaleString("id-ID")}
        </span>
      </div>

      <Input
        id="program_name"
        name="program_name"
        label="Nama Program Sosial / Pemberdayaan"
        placeholder="Contoh: Pelatihan Kerajinan Lilin Aromaterapi Anak Difabel"
        value={programName}
        onChange={(e) => setProgramName(e.target.value)}
        error={fieldErrors.program_name?.[0]}
        required
        disabled={isPending}
      />

      <Input
        id="amount"
        name="amount"
        label="Nominal Alokasi (Rupiah)"
        placeholder="Contoh: 500000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={
          fieldErrors.amount?.[0] ||
          (isOverBalance ? "Nominal melebihi saldo pendapatan yang tersedia." : undefined)
        }
        required
        disabled={isPending}
      />

      <Textarea
        id="notes"
        name="notes"
        label="Catatan & Tujuan Alokasi (Opsional)"
        placeholder="Keterangan peruntukan dana dan penanggung jawab program"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        error={fieldErrors.notes?.[0]}
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isPending}
        disabled={isPending || isOverBalance || availableBalance <= 0}
      >
        {isPending ? "Menyimpan Alokasi..." : "Alokasikan Dana Sosial"}
      </Button>
    </form>
  );
}
