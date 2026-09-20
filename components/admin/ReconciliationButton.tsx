"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRevenueReconciliationAction } from "@/lib/domain/admin/finance";
import type { ReconciliationStatus } from "@/lib/validation/finance-schema";

interface ReconciliationButtonProps {
  entryId: string;
  currentStatus: ReconciliationStatus;
}

export function ReconciliationButton({ entryId, currentStatus }: ReconciliationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<ReconciliationStatus>(currentStatus);

  const handleSave = () => {
    startTransition(async () => {
      await updateRevenueReconciliationAction({
        entry_id: entryId,
        status,
      });
      setIsEditing(false);
      router.refresh();
    });
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-brand-primary)",
          fontSize: "var(--font-size-caption)",
          fontWeight: "600",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Ubah Status
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ReconciliationStatus)}
        disabled={isPending}
        style={{
          fontSize: "var(--font-size-caption)",
          padding: "2px 6px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border-default)",
        }}
      >
        <option value="RECONCILED">Cocok</option>
        <option value="PENDING">Pending</option>
        <option value="DISCREPANCY">Selisih</option>
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        style={{
          fontSize: "var(--font-size-caption)",
          padding: "2px 8px",
          backgroundColor: "var(--color-brand-primary)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
        }}
      >
        OK
      </button>
      <button
        type="button"
        onClick={() => setIsEditing(false)}
        disabled={isPending}
        style={{
          fontSize: "var(--font-size-caption)",
          padding: "2px 6px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}
