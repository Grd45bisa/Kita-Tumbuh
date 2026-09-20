import React from "react";
import styles from "./DonationTimeline.module.css";
import type { DonationStatus, DonationStatusHistory } from "@/types/donation";
import { InfoCircleIcon } from "./DonationIcons";

export const STATUS_LABELS: Record<DonationStatus, string> = {
  SUBMITTED: "Donasi Didaftarkan",
  SCHEDULED: "Pickup / Drop-off Dijadwalkan",
  COLLECTED: "Limbah Diterima",
  VERIFIED: "Verifikasi Berat Selesai",
  SORTED: "Pemilahan Selesai",
  PROCESSED: "Sedang Diproses",
  CONVERTED: "Menjadi Produk",
  IMPACTED: "Dampak Tercatat",
  REJECTED: "Donasi Ditolak",
};

const STATUS_ORDER: DonationStatus[] = [
  "SUBMITTED",
  "SCHEDULED",
  "COLLECTED",
  "VERIFIED",
  "SORTED",
  "PROCESSED",
  "CONVERTED",
  "IMPACTED",
];

const STATUS_DESCRIPTIONS: Record<DonationStatus, string> = {
  SUBMITTED: "Donasi kamu telah kami terima dan sedang menunggu penjadwalan.",
  SCHEDULED: "Pickup atau drop-off telah dijadwalkan.",
  COLLECTED: "Limbah telah kami terima secara fisik.",
  VERIFIED: "Berat dan kondisi limbah telah diverifikasi oleh tim kami.",
  SORTED: "Limbah telah dipilah sesuai kategori pengolahan.",
  PROCESSED:
    "Limbah masuk ke tahap pengolahan terpadu. Pada tahap ini, material dapat digabungkan dengan donasi warga lain dalam satu batch produksi untuk efisiensi.",
  CONVERTED:
    "Pengolahan selesai. Batch material telah berhasil ditransformasikan menjadi produk bermanfaat yang siap dimanfaatkan atau didistribusikan.",
  IMPACTED: "Dampak dari donasi ini telah dicatat berdasarkan data yang terverifikasi.",
  REJECTED: "Limbah tidak memenuhi syarat penerimaan atau kondisi melebihi batas toleransi pengolahan.",
};

interface DonationTimelineProps {
  currentStatus: DonationStatus;
  statusHistory: Array<Pick<DonationStatusHistory, "to_status" | "created_at">>;
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
    <div className={styles.timelineContainer}>
      <div className={styles.transparencyNotice} role="note" aria-label="Informasi pelacakan donasi">
        <span className={styles.noticeIcon} aria-hidden="true">
          <InfoCircleIcon size={18} />
        </span>
        <div className={styles.noticeContent}>
          <p className={styles.noticeTitle}>Pelacakan Individu &amp; Pengolahan Kolektif</p>
          <p className={styles.noticeDescription}>
            Lini masa ini memantau perjalanan donasi spesifik milikmu. Sejak tahap pemrosesan, material yang telah dipilah dapat digabungkan dengan donasi warga lain dalam satu batch produksi agar pengolahan berjalan efisien dan manfaatnya berkembang optimal.
          </p>
        </div>
      </div>

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
    </div>
  );
}
