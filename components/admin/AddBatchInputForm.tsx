"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { addBatchInputAction } from "@/lib/domain/admin/production";

export interface AvailableLotOption {
  id: string;
  lot_code: string;
  waste_type_name: string;
  current_quantity: number;
  unit: string;
  quality_grade: string;
}

interface AddBatchInputFormProps {
  batchId: string;
  availableLots: AvailableLotOption[];
  disabled?: boolean;
}

export function AddBatchInputForm({ batchId, availableLots, disabled }: AddBatchInputFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedLotId, setSelectedLotId] = useState(availableLots[0]?.id || "");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const selectedLot = availableLots.find((l) => l.id === selectedLotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedLot) {
      setFormError("Pilih lot limbah yang valid.");
      return;
    }

    const qty = Number(quantityUsed);
    if (!qty || qty <= 0) {
      setFormError("Kuantitas harus lebih dari 0.");
      return;
    }

    if (qty > selectedLot.current_quantity) {
      setFormError(
        `Kuantitas melebihi stok yang tersedia (${selectedLot.current_quantity} ${selectedLot.unit}).`
      );
      return;
    }

    startTransition(async () => {
      const res = await addBatchInputAction({
        batch_id: batchId,
        waste_lot_id: selectedLot.id,
        quantity_used: qty,
        unit: selectedLot.unit,
        notes,
      });

      if (!res.success) {
        setFormError(res.error || "Gagal mengalokasikan bahan baku.");
        return;
      }

      setQuantityUsed("");
      setNotes("");
      router.refresh();
    });
  };

  if (disabled) {
    return (
      <Card style={{ padding: "var(--space-5)" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-ink-600)" }}>
          Pengalokasian bahan baku ditutup untuk batch yang sudah selesai (COMPLETED / RELEASED).
        </p>
      </Card>
    );
  }

  if (availableLots.length === 0) {
    return (
      <Card style={{ padding: "var(--space-5)" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-ink-600)" }}>
          Tidak ada lot limbah dengan stok aktif di inventaris. Silakan tambah lot baru di menu{" "}
          <a href="/admin/inventory" style={{ color: "var(--color-brand-primary)", textDecoration: "underline" }}>
            Inventaris Limbah
          </a>.
        </p>
      </Card>
    );
  }

  const lotOptions = availableLots.map((lot) => ({
    value: lot.id,
    label: `${lot.lot_code} — ${lot.waste_type_name} (Sisa: ${lot.current_quantity} ${lot.unit}) [${lot.quality_grade}]`,
  }));

  return (
    <Card style={{ padding: "var(--space-6)" }}>
      <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-brand-primary)", marginBottom: "var(--space-2)" }}>
        Tambah Alokasi Bahan Baku Limbah (Batch Input)
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--color-ink-600)", marginBottom: "var(--space-4)" }}>
        Bahan baku yang dialokasikan akan langsung memotong stok lot limbah dan tercatat permanen di buku besar inventaris.
      </p>

      {formError && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "rgba(180, 83, 9, 0.1)",
            border: "1px solid var(--color-earth-500)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-earth-700)",
            marginBottom: "var(--space-4)",
            fontSize: "0.875rem",
          }}
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Select
          id="waste_lot_id"
          name="waste_lot_id"
          label="Pilih Sumber Lot Limbah"
          options={lotOptions}
          value={selectedLotId}
          onChange={(e) => setSelectedLotId(e.target.value)}
          required
          disabled={isPending}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "var(--space-3)" }}>
          <Input
            id="quantity_used"
            name="quantity_used"
            type="number"
            step="0.01"
            label={`Jumlah Digunakan (${selectedLot?.unit || "Unit"})`}
            placeholder="0.00"
            value={quantityUsed}
            onChange={(e) => setQuantityUsed(e.target.value)}
            required
            disabled={isPending}
            helperText={selectedLot ? `Maks: ${selectedLot.current_quantity} ${selectedLot.unit}` : undefined}
          />

          <Input
            id="input_notes"
            name="notes"
            label="Catatan Pengambilan (Opsional)"
            placeholder="Contoh: Digunakan 10 Liter untuk penyabunan awal"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            Alokasikan ke Batch Ini
          </Button>
        </div>
      </form>
    </Card>
  );
}
