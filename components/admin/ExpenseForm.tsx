"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { recordExpenseAction } from "@/lib/domain/admin/finance";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/validation/finance-schema";

export function ExpenseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState<ExpenseCategory>("LOGISTICS");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const numericAmount = parseInt(amount.replace(/\D/g, ""), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    if (numericAmount <= 0) {
      setErrorMessage("Nominal pengeluaran harus lebih dari Rp 0.");
      return;
    }

    startTransition(async () => {
      const res = await recordExpenseAction({
        category,
        amount: numericAmount,
        notes: notes.trim(),
        attachment_url: attachmentUrl.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mencatat pengeluaran.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      setSuccessMessage(
        `Biaya operasional sebesar Rp ${numericAmount.toLocaleString("id-ID")} berhasil dicatat!`
      );
      setAmount("");
      setNotes("");
      setAttachmentUrl("");
      router.refresh();
    });
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: EXPENSE_CATEGORY_LABELS[cat] || cat,
  }));

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

      <Select
        id="expense_category"
        name="category"
        label="Kategori Biaya Operasional"
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        error={fieldErrors.category?.[0]}
        disabled={isPending}
      />

      <Input
        id="expense_amount"
        name="amount"
        label="Nominal Pengeluaran (Rupiah)"
        placeholder="Contoh: 150000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={fieldErrors.amount?.[0]}
        required
        disabled={isPending}
      />

      <Textarea
        id="expense_notes"
        name="notes"
        label="Catatan & Rincian Pengeluaran"
        placeholder="Contoh: Pembelian botol kaca kemasan lilin aromaterapi 50 pcs"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        error={fieldErrors.notes?.[0]}
        required
        disabled={isPending}
      />

      <Input
        id="attachment_url"
        name="attachment_url"
        label="Tautan Bukti / Nota (Opsional)"
        placeholder="URL dokumen atau nota pembayaran"
        value={attachmentUrl}
        onChange={(e) => setAttachmentUrl(e.target.value)}
        error={fieldErrors.attachment_url?.[0]}
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending ? "Menyimpan..." : "Catat Biaya Operasional"}
      </Button>
    </form>
  );
}
