"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateDonationStatusAction } from "@/lib/domain/admin/donations";
import { isValidDonationStatusTransition } from "@/lib/validation/admin-donation-schema";
import { DONATION_STATUS_LABELS, type DonationStatus } from "@/types/donation";
import styles from "./AdminDonationForms.module.css";

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
      <h2 className={styles.title}>
        Ubah Status Siklus Donasi
      </h2>
      <p className={styles.description}>
        Perbarui tahapan donasi sepanjang rantai pemrosesan limbah (penjemputan, penyortiran, pengolahan, hingga dampak sosial).
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

      {statuses.length === 0 ? (
        <p className={styles.noStatus}>
          Donasi ini berada di status akhir ({DONATION_STATUS_LABELS[currentStatus]}) — tidak ada tahap lanjutan yang dapat dipilih.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.statusForm}>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DonationStatus)}
              disabled={isPending}
              className={styles.select}
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

          <Button type="submit" variant="secondary" size="md" isLoading={isPending} className={styles.submitButton}>
            Simpan Status Baru
          </Button>
        </form>
      )}
    </Card>
  );
}
