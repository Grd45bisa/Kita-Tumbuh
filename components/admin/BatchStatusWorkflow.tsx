"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  type ProductionBatchStatus,
  PRODUCTION_STATUS_STEPS,
  PRODUCTION_STATUS_LABELS,
} from "@/lib/validation/production-batch-schema";
import { updateBatchStatusAction } from "@/lib/domain/admin/production";

interface BatchStatusWorkflowProps {
  batchId: string;
  currentStatus: ProductionBatchStatus;
  targetQuantity: number;
  outputUnit: string;
  initialActualOutput?: number;
  initialLoss?: number;
  initialLossReason?: string;
}

export function BatchStatusWorkflow({
  batchId,
  currentStatus,
  targetQuantity,
  outputUnit,
  initialActualOutput = 0,
  initialLoss = 0,
  initialLossReason = "",
}: BatchStatusWorkflowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [actualOutput, setActualOutput] = useState(
    initialActualOutput > 0 ? String(initialActualOutput) : String(targetQuantity)
  );
  const [lossQuantity, setLossQuantity] = useState(String(initialLoss));
  const [lossReason, setLossReason] = useState(initialLossReason);
  const [transitionNotes, setTransitionNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const currentIndex = PRODUCTION_STATUS_STEPS.indexOf(currentStatus);
  const nextStatus = currentIndex < PRODUCTION_STATUS_STEPS.length - 1
    ? PRODUCTION_STATUS_STEPS[currentIndex + 1]
    : null;

  const handleAdvanceStatus = (targetNext: ProductionBatchStatus) => {
    setFormError(null);

    startTransition(async () => {
      const res = await updateBatchStatusAction({
        batch_id: batchId,
        status: targetNext,
        actual_output_quantity: targetNext === "COMPLETED" || targetNext === "RELEASED"
          ? Number(actualOutput)
          : undefined,
        loss_quantity: targetNext === "COMPLETED" || targetNext === "RELEASED"
          ? Number(lossQuantity)
          : undefined,
        loss_reason: lossReason,
        notes: transitionNotes,
      });

      if (!res.success) {
        setFormError(res.error || "Gagal mengubah status batch.");
        return;
      }

      router.refresh();
    });
  };

  const badgeVariant =
    currentStatus === "RELEASED"
      ? "success"
      : currentStatus === "COMPLETED"
      ? "info"
      : currentStatus === "QC_REVIEW"
      ? "warning"
      : currentStatus === "IN_PROGRESS"
      ? "brand"
      : "neutral";

  return (
    <Card style={{ padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-brand-primary)", marginBottom: "4px" }}>
            Alur Status Produksi (State Machine)
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-ink-600)" }}>
            Siklus pengolahan limbah mengikuti standar operasional ARSITEKTUR.md §7.2
          </p>
        </div>
        <Badge variant={badgeVariant}>
          {PRODUCTION_STATUS_LABELS[currentStatus]?.label || currentStatus}
        </Badge>
      </div>

      {/* Visual Step Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${PRODUCTION_STATUS_STEPS.length}, 1fr)`,
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
        }}
      >
        {PRODUCTION_STATUS_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={step}
              style={{
                padding: "var(--space-2)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: isCurrent
                  ? "rgba(46, 125, 50, 0.15)"
                  : isDone
                  ? "var(--color-paper-100)"
                  : "var(--color-paper-50)",
                border: `1px solid ${
                  isCurrent ? "var(--color-brand-primary)" : isDone ? "var(--color-border-subtle)" : "transparent"
                }`,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? "var(--color-brand-primary)" : "var(--color-ink-600)",
                }}
              >
                {idx + 1}. {PRODUCTION_STATUS_LABELS[step]?.label}
              </span>
            </div>
          );
        })}
      </div>

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

      {/* Completion fields if progressing to COMPLETED or already COMPLETED */}
      {(currentStatus === "QC_REVIEW" || currentStatus === "IN_PROGRESS") && nextStatus === "COMPLETED" && (
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-paper-50)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "var(--space-3)" }}>
            Catat Hasil Luaran (Output & Susut/Loss)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
            <Input
              id="actual_output"
              name="actual_output"
              type="number"
              step="0.01"
              label={`Kuantitas Luaran Jadi (${outputUnit})`}
              value={actualOutput}
              onChange={(e) => setActualOutput(e.target.value)}
              required
              disabled={isPending}
            />
            <Input
              id="loss_quantity"
              name="loss_quantity"
              type="number"
              step="0.01"
              label={`Kuantitas Susut / Loss (${outputUnit})`}
              value={lossQuantity}
              onChange={(e) => setLossQuantity(e.target.value)}
              disabled={isPending}
              helperText="Endapan, penguapan, atau sisa tidak terpakai"
            />
          </div>
          <div style={{ marginTop: "var(--space-3)" }}>
            <Input
              id="loss_reason"
              name="loss_reason"
              label="Alasan Susut / Keterangan Kualitas"
              placeholder="Contoh: Endapan minyak jelantah kental tersisa di dasar bejana..."
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {nextStatus ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Textarea
            id="transition_notes"
            name="transition_notes"
            label="Catatan Perkembangan / Log Tahapan (Opsional)"
            placeholder="Catatan kondisi proses, parameter suhu, atau evaluasi QC..."
            value={transitionNotes}
            onChange={(e) => setTransitionNotes(e.target.value)}
            rows={2}
            disabled={isPending}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--color-ink-700)" }}>
              Tahap berikutnya: <strong>{PRODUCTION_STATUS_LABELS[nextStatus]?.label}</strong> —{" "}
              {PRODUCTION_STATUS_LABELS[nextStatus]?.description}
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isPending}
              onClick={() => handleAdvanceStatus(nextStatus)}
            >
              Lanjutkan ke {PRODUCTION_STATUS_LABELS[nextStatus]?.label} &rarr;
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "rgba(46, 125, 50, 0.08)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-brand-primary)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          ✓ Batch ini telah mencapai tahap akhir (RELEASED) dan siap dikaitkan ke katalog produk sirkular.
        </div>
      )}
    </Card>
  );
}
