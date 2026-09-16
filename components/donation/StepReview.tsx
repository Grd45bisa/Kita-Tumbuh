import React from "react";
import styles from "./DonationWizard.module.css";
import type { CollectionPoint } from "@/types/donation";

interface ReviewData {
  wasteTypeName: string;
  unit: string;
  estimated_quantity: number;
  method: "DROP_OFF" | "PICKUP";
  collection_point?: CollectionPoint | null;
  pickup_requested_date?: string;
  pickup_requested_slot?: string;
  donor_notes?: string;
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
        <h2 className={styles.stepTitle}>Periksa Donasimu</h2>
        <p className={styles.stepSubtitle}>
          Pastikan informasi di bawah sudah benar sebelum mengirim.
        </p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          <span aria-hidden="true">⚠️</span>
          <p>{serverError}</p>
        </div>
      )}

      <div className={styles.reviewCard}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Jenis Limbah</span>
          <span className={styles.reviewValue}>{data.wasteTypeName}</span>
        </div>
        <div className={styles.reviewDivider} />
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Perkiraan Jumlah</span>
          <span className={styles.reviewValue}>
            {data.estimated_quantity} {data.unit}
          </span>
        </div>
        <div className={styles.reviewDivider} />
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Metode</span>
          <span className={styles.reviewValue}>
            {data.method === "DROP_OFF" ? "Antar ke Collection Point" : "Dijemput"}
          </span>
        </div>

        {data.method === "DROP_OFF" && data.collection_point && (
          <>
            <div className={styles.reviewDivider} />
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Lokasi</span>
              <span className={styles.reviewValue}>{data.collection_point.name}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Alamat</span>
              <span className={styles.reviewValue}>{data.collection_point.address}</span>
            </div>
          </>
        )}

        {data.method === "PICKUP" && (
          <>
            {data.pickup_requested_date && (
              <>
                <div className={styles.reviewDivider} />
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Tanggal Pickup</span>
                  <span className={styles.reviewValue}>
                    {formatDate(data.pickup_requested_date)}
                  </span>
                </div>
              </>
            )}
            {data.pickup_requested_slot && (
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Slot Waktu</span>
                <span className={styles.reviewValue}>{data.pickup_requested_slot}</span>
              </div>
            )}
            <div className={styles.reviewDivider} />
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Alamat Pickup</span>
              <span className={`${styles.reviewValue} ${styles.reviewPrivate}`}>
                🔒 Tersimpan dengan aman
              </span>
            </div>
          </>
        )}

        {data.donor_notes && (
          <>
            <div className={styles.reviewDivider} />
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Catatan</span>
              <span className={styles.reviewValue}>{data.donor_notes}</span>
            </div>
          </>
        )}
      </div>

      {/* Estimated vs verified disclaimer */}
      <div className={styles.reviewDisclaimer}>
        <span aria-hidden="true">📝</span>
        <p>
          Jumlah yang tertera adalah <strong>perkiraan dari kamu</strong>. Jumlah
          terverifikasi akan diperbarui setelah tim kami melakukan penimbangan dan
          verifikasi fisik.
        </p>
      </div>

      {/* Commitment text */}
      <p className={styles.reviewCommitment}>
        Dengan mengkonfirmasi, kamu menyetujui bahwa limbah yang didaftarkan
        sesuai dengan kategori yang dipilih dan dalam kondisi yang dapat kami
        proses.
      </p>

      {isSubmitting && (
        <div className={styles.submittingState} aria-live="polite">
          <div className={styles.submittingSpinner} aria-hidden="true" />
          <p>Mendaftarkan donasimu…</p>
        </div>
      )}
    </div>
  );
}
