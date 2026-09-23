import React from "react";
import styles from "./DonationWizard.module.css";
import type { CollectionPoint } from "@/types/donation";
import {
  AlertTriangleIcon,
  ShieldLockIcon,
  InfoCircleIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ScaleIcon,
} from "./DonationIcons";

interface ReviewData {
  wasteTypeName: string;
  unit: string;
  estimated_quantity: number;
  method: "DROP_OFF" | "PICKUP";
  collection_point?: CollectionPoint | null;
  pickup_requested_date?: string;
  pickup_requested_slot?: string;
  donor_notes?: string;
  donor_email?: string;
}

interface StepReviewProps {
  data: ReviewData;
  serverError?: string;
  isSubmitting: boolean;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function StepReview({ data, serverError, isSubmitting }: StepReviewProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Periksa & Konfirmasi Donasi</h2>
        <p className={styles.stepSubtitle}>
          Pastikan rincian limbah dan metode penyerahan di bawah sudah sesuai.
        </p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          <AlertTriangleIcon size={20} className={styles.errorIcon} />
          <p>{serverError}</p>
        </div>
      )}

      {/* Manifest Summary Card */}
      <div className={styles.reviewManifestCard}>
        <div className={styles.manifestHeader}>
          <span className={styles.manifestBadge}>Ringkasan Donasi</span>
          <span className={styles.manifestIdHint}>Siap Disalurkan</span>
        </div>

        <div className={styles.reviewCard}>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Kategori Limbah</span>
            <span className={styles.reviewValuePrimary}>
              {data.wasteTypeName}
            </span>
          </div>

          <div className={styles.reviewDivider} />

          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Perkiraan Jumlah</span>
            <span className={styles.reviewValueHighlight}>
              <ScaleIcon size={16} />
              <span>
                {new Intl.NumberFormat("id-ID", {
                  maximumFractionDigits: 1,
                }).format(data.estimated_quantity)}{" "}
                {data.unit === "pcs" ? "wadah" : data.unit}
              </span>
            </span>
          </div>

          <div className={styles.reviewDivider} />

          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Metode Serah</span>
            <span className={styles.reviewValue}>
              {data.method === "DROP_OFF"
                ? "Antar ke Collection Point"
                : "Dijemput oleh Tim"}
            </span>
          </div>

          {data.method === "DROP_OFF" && data.collection_point && (
            <>
              <div className={styles.reviewDivider} />
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Titik Kumpul</span>
                <span className={styles.reviewValue}>
                  {data.collection_point.name}
                </span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Alamat Lokasi</span>
                <span className={styles.reviewValueSubtle}>
                  <MapPinIcon size={14} className={styles.inlineIcon} />
                  <span>{data.collection_point.address}</span>
                </span>
              </div>
            </>
          )}

          {data.method === "PICKUP" && (
            <>
              {data.pickup_requested_date && (
                <>
                  <div className={styles.reviewDivider} />
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Tanggal Pilihan</span>
                    <span className={styles.reviewValue}>
                      <CalendarIcon size={14} className={styles.inlineIcon} />
                      <span>{formatDate(data.pickup_requested_date)}</span>
                    </span>
                  </div>
                </>
              )}
              {data.pickup_requested_slot && (
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Rentang Waktu</span>
                  <span className={styles.reviewValue}>
                    <ClockIcon size={14} className={styles.inlineIcon} />
                    <span>{data.pickup_requested_slot}</span>
                  </span>
                </div>
              )}
              <div className={styles.reviewDivider} />
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Alamat Rumah</span>
                <span className={`${styles.reviewValue} ${styles.reviewPrivate}`}>
                  <ShieldLockIcon size={14} className={styles.inlineIcon} />
                  <span>Tersimpan dengan aman & privat</span>
                </span>
              </div>
            </>
          )}

          {data.donor_email && (
            <>
              <div className={styles.reviewDivider} />
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Kabar Progres ke Email</span>
                <span className={styles.reviewValue}>{data.donor_email}</span>
              </div>
            </>
          )}

          {data.donor_notes && (
            <>
              <div className={styles.reviewDivider} />
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Catatan Khusus</span>
                <span className={styles.reviewValueNote}>{data.donor_notes}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reassuring note */}
      <div className={styles.reviewDisclaimer}>
        <div className={styles.disclaimerIconWrap}>
          <InfoCircleIcon size={20} />
        </div>
        <p>
          Jumlah di atas adalah <strong>estimasi awal</strong>. Petugas kami akan
          menimbang dan mencatat jumlah terverifikasi setelah limbah diserahkan.
        </p>
      </div>

      <p className={styles.reviewCommitment}>
        Dengan mengonfirmasi, kamu menyetujui bahwa limbah yang didaftarkan bebas
        dari kontaminan berbahaya dan siap diolah oleh tim SEMAI.
      </p>

      {isSubmitting && (
        <div className={styles.submittingState} aria-live="polite">
          <div className={styles.submittingSpinner} aria-hidden="true" />
          <p>Mendaftarkan donasimu ke sistem…</p>
        </div>
      )}
    </div>
  );
}

