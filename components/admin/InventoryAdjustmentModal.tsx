"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { adjustWasteLotAction } from "@/lib/domain/admin/inventory";

interface InventoryAdjustmentModalProps {
  lotId: string;
  lotCode: string;
  currentQuantity: number;
  unit: string;
  onClose: () => void;
}

export function InventoryAdjustmentModal({
  lotId,
  lotCode,
  currentQuantity,
  unit,
  onClose,
}: InventoryAdjustmentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "SUBTRACT">("SUBTRACT");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLSelectElement>(null);
  // Lazy-initialized so it captures the trigger element exactly once, at
  // first mount — never re-captured on a later re-render while the modal
  // is still open (which would wrongly point it at an element inside the
  // modal itself if the parent re-renders for an unrelated reason).
  const triggerElementRef = useRef<Element | null>(
    typeof document !== "undefined" ? document.activeElement : null
  );

  // Focus the first field once, when the dialog first mounts.
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  // Escape-to-close and Tab focus trap. Re-attaching this on every render is
  // harmless (it's the same idempotent listener), so onClose can safely be
  // a dependency without needing a stable identity from the caller.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Restore focus to the trigger element once, on unmount only.
  useEffect(() => {
    return () => {
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await adjustWasteLotAction({
        waste_lot_id: lotId,
        adjustment_type: adjustmentType,
        quantity: Number(quantity),
        reason,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal melakukan penyesuaian stok.");
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adj-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 36, 26, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "var(--space-4)",
      }}
    >
      <div
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "var(--elevation-3)",
        }}
      >
        <h2 id="adj-modal-title" style={{ fontSize: "var(--font-size-title)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "4px" }}>
          Penyesuaian Stok Fisik
        </h2>
        <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
          Lot: <strong>{lotCode}</strong> • Saldo saat ini: <strong>{currentQuantity} {unit}</strong>
        </p>

        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-danger-bg, #fef2f2)",
              color: "var(--color-danger-fg, #b91c1c)",
              border: "1px solid var(--color-danger-border, #fecaca)",
              fontSize: "var(--font-size-caption)",
              marginBottom: "var(--space-4)",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label
              htmlFor="adj_type"
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-1)",
              }}
            >
              Jenis Penyesuaian
            </label>
            <select
              ref={firstFieldRef}
              id="adj_type"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as "ADD" | "SUBTRACT")}
              disabled={isPending}
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-default)",
                padding: "0 var(--space-3)",
                fontSize: "var(--font-size-body-s)",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="SUBTRACT">Pengurangan / Penyusutan / Pembuangan (SUBTRACT)</option>
              <option value="ADD">Penambahan / Koreksi Lebih (ADD)</option>
            </select>
          </div>

          <Input
            id="adj_quantity"
            name="quantity"
            type="number"
            step="0.01"
            label={`Jumlah Penyesuaian (${unit})`}
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            disabled={isPending}
          />

          <Textarea
            id="adj_reason"
            name="reason"
            label="Alasan Wajib Penyesuaian (Audit Trail)"
            placeholder="Contoh: Penyusutan karena penguapan endapan air pada wadah terbuka..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            disabled={isPending}
            hint="Setiap perubahan stok tercatat permanen di buku besar inventaris."
          />

          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isPending}>
              Simpan Mutasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
