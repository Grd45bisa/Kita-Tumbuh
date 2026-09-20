"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateDonationStatusAction } from "@/lib/domain/admin/donations";
import { isValidDonationStatusTransition } from "@/lib/validation/admin-donation-schema";
import { DONATION_STATUS_LABELS, type DonationStatus } from "@/types/donation";

interface DonationStatusFormProps {
  donationId: string;
  reference: string;
  currentStatus: DonationStatus;
}

export function DonationStatusForm({
  donationId,
  reference,
  currentStatus,
}: DonationStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Only offer status values that are genuinely reachable from the
  // donation's current status (server enforces this too — see
  // isValidDonationStatusTransition / updateDonationStatusAction — this is
  // the UI-side convenience layer, never the authorization itself).
  const allStatuses: DonationStatus[] = [
    "SUBMITTED",
    "SCHEDULED",
    "COLLECTED",
    "VERIFIED",
    "SORTED",
    "PROCESSED",
    "CONVERTED",
    "IMPACTED",
    "REJECTED",
  ];
  const statuses = allStatuses.filter((s) => isValidDonationStatusTransition(currentStatus, s));

  const [selectedStatus, setSelectedStatus] = useState<DonationStatus>(statuses[0] ?? currentStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedStatus === currentStatus) {
      setErrorMessage("Pilih status yang berbeda dari status saat ini.");
      return;
    }

    startTransition(async () => {
      const res = await updateDonationStatusAction(donationId, reference, {
        next_status: selectedStatus,
        notes: "",
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengubah status donasi.");
      } else {
        setSuccessMessage(`Status donasi berhasil diubah ke ${DONATION_STATUS_LABELS[selectedStatus]}.`);
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
        Ubah Status Siklus Donasi
      </h2>
      <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
        Perbarui tahapan donasi sepanjang rantai pemrosesan limbah (penjemputan, penyortiran, pengolahan, hingga dampak sosial).
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

      {statuses.length === 0 ? (
        <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)" }}>
          Donasi ini berada di status akhir ({DONATION_STATUS_LABELS[currentStatus]}) — tidak ada tahap lanjutan yang dapat dipilih.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "220px" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DonationStatus)}
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
              <option value={currentStatus} disabled>
                {DONATION_STATUS_LABELS[currentStatus]} ({currentStatus}) — status saat ini
              </option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {DONATION_STATUS_LABELS[s]} ({s})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="secondary" size="md" isLoading={isPending}>
            Simpan Status Baru
          </Button>
        </form>
      )}
    </Card>
  );
}
