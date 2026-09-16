import React from "react";
import styles from "./DonationTimeline.module.css";
import type { DonationStatus, DonationStatusHistory } from "@/types/donation";

const STATUS_LABELS: Record<DonationStatus, string> = {
  SUBMITTED: "Donasi Didaftarkan",
  SCHEDULED: "Pickup / Drop-off Dijadwalkan",
  COLLECTED: "Limbah Diterima",
  VERIFIED: "Verifikasi Berat Selesai",
  SORTED: "Pemilahan Selesai",
  PROCESSED: "Sedang Diproses",
  CONVERTED: "Menjadi Produk / Dampak",
};

const STATUS_ORDER: DonationStatus[] = [
  "SUBMITTED",
  "SCHEDULED",
  "COLLECTED",
  "VERIFIED",
  "SORTED",
  "PROCESSED",
  "CONVERTED",
];

const STATUS_DESCRIPTIONS: Record<DonationStatus, string> = {
  SUBMITTED: "Donasi kamu telah kami terima dan sedang menunggu penjadwalan.",
  SCHEDULED: "Pickup atau drop-off telah dijadwalkan.",
  COLLECTED: "Limbah telah kami terima secara fisik.",
  VERIFIED: "Berat dan kondisi limbah telah diverifikasi oleh tim kami.",
  SORTED: "Limbah telah dipilah sesuai kategori pengolahan.",
  PROCESSED: "Limbah sedang dalam proses pengolahan menjadi produk atau kompos.",
  CONVERTED: "Limbahmu telah berhasil diubah menjadi produk atau manfaat sosial.",
};

interface DonationTimelineProps {
  currentStatus: DonationStatus;
  statusHistory: DonationStatusHistory[];
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export function DonationTimeline({
  currentStatus,
  statusHistory,
}: DonationTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  // Build a map of status → timestamp from history
  const statusTimestamps: Partial<Record<DonationStatus, string>> = {};
  statusHistory.forEach((h) => {
    statusTimestamps[h.to_status] = h.created_at;
  });

  return (
    <div className={styles.timeline}>
      {STATUS_ORDER.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const timestamp = statusTimestamps[status];

        return (
          <div
            key={status}
            className={`${styles.timelineItem} ${isCompleted ? styles.completed : ""} ${isCurrent ? styles.current : ""} ${isPending ? styles.pending : ""}`}
          >
            {/* Line connector */}
            {index < STATUS_ORDER.length - 1 && (
              <div
                className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ""}`}
                aria-hidden="true"
              />
            )}

            {/* Status dot */}
            <div className={styles.dot} aria-hidden="true">
              {isCompleted && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {isCurrent && <div className={styles.dotPulse} />}
            </div>

            {/* Content */}
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <span className={styles.itemLabel}>{STATUS_LABELS[status]}</span>
                {timestamp && (
                  <span className={styles.itemTimestamp}>
                    {formatTimestamp(timestamp)}
                  </span>
                )}
              </div>
              {(isCurrent || isCompleted) && (
                <p className={styles.itemDescription}>
                  {STATUS_DESCRIPTIONS[status]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
