"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createProductionBatchAction } from "@/lib/domain/admin/production";

export function ProductionBatchForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [batchNumber, setBatchNumber] = useState(
    `BATCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [title, setTitle] = useState("");
  const [targetOutputType, setTargetOutputType] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [outputUnit, setOutputUnit] = useState("Pcs");
  const [notes, setNotes] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await createProductionBatchAction({
        batch_number: batchNumber,
        title,
        target_output_type: targetOutputType,
        target_quantity: Number(targetQuantity),
        output_unit: outputUnit,
        notes,
      });

      if (!res.success) {
        setFormError(res.error || "Gagal membuat batch produksi.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      if (res.data?.id) {
        router.push(`/admin/production/${res.data.id}`);
      } else {
        router.push("/admin/production");
      }
    });
  };

  return (
    <Card style={{ padding: "var(--space-6)" }}>
      {formError && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "rgba(180, 83, 9, 0.1)",
            border: "1px solid var(--color-earth-500)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-earth-700)",
            marginBottom: "var(--space-5)",
            fontSize: "0.875rem",
          }}
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          <Input
            id="batch_number"
            name="batch_number"
            label="Nomor Batch Unik"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
            required
            disabled={isPending}
            error={fieldErrors.batch_number?.[0]}
            helperText="Format standar BATCH-YYYY-XXX untuk penelusuran lot."
          />

          <Input
            id="title"
            name="title"
            label="Nama / Judul Batch Produksi"
            placeholder="Contoh: Produksi Sabun Cuci Serbaguna Batch 01"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.title?.[0]}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
          <Input
            id="target_output_type"
            name="target_output_type"
            label="Jenis Produk Luaran"
            placeholder="Contoh: Sabun Cuci Piring, Lilin Aromaterapi"
            value={targetOutputType}
            onChange={(e) => setTargetOutputType(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.target_output_type?.[0]}
          />

          <Input
            id="target_quantity"
            name="target_quantity"
            type="number"
            step="0.01"
            label="Target Output Hasil"
            placeholder="0"
            value={targetQuantity}
            onChange={(e) => setTargetQuantity(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.target_quantity?.[0]}
          />

          <Input
            id="output_unit"
            name="output_unit"
            label="Satuan Output"
            placeholder="Pcs / Botol / Batang / Liter"
            value={outputUnit}
            onChange={(e) => setOutputUnit(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.output_unit?.[0]}
          />
        </div>

        <Textarea
          id="notes"
          name="notes"
          label="Catatan Formulasi / Instruksi Kerja (Opsional)"
          placeholder="Instruksi rasio NaOH, suhu pencampuran, atau waktu curing..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={isPending}
          hint="Catatan ini membantu operator di workshop mengikuti instruksi standar operasional."
        />

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => router.push("/admin/production")}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            Rencanakan Batch (PLANNED)
          </Button>
        </div>
      </form>
    </Card>
  );
}
