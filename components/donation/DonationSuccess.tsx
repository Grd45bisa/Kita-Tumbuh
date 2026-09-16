import React from "react";
import Link from "next/link";
import styles from "./DonationWizard.module.css";

interface DonationSuccessProps {
  reference: string;
  wasteTypeName: string;
  estimatedQuantity: number;
  unit: string;
  method: "DROP_OFF" | "PICKUP";
  wasAlreadySubmitted?: boolean;
}

export function DonationSuccess({
  reference,
  wasteTypeName,
  estimatedQuantity,
  unit,
  method,
  wasAlreadySubmitted,
}: DonationSuccessProps) {
  return (
    <div className={styles.successContainer}>
      <div className={styles.successIcon} aria-hidden="true">✓</div>

      <h2 className={styles.successTitle}>
        {wasAlreadySubmitted ? "Donasi Sudah Terdaftar" : "Donasi Berhasil Didaftarkan!"}
      </h2>

      <p className={styles.successSubtitle}>
        Terima kasih. <strong>SAMPAH KALIANMU SANGAT BERARTI BAGI KAMI.</strong>
      </p>

      {/* Reference code */}
      <div className={styles.referenceBox}>
        <p className={styles.referenceLabel}>Nomor Referensi Donasi</p>
        <p className={styles.referenceCode}>{reference}</p>
        <p className={styles.referenceHint}>
          Simpan kode ini untuk memantau status donasimu.
        </p>
      </div>

      {/* Summary */}
      <div className={styles.successSummary}>
        <div className={styles.successSummaryRow}>
          <span>Jenis</span>
          <span>{wasteTypeName}</span>
        </div>
        <div className={styles.successSummaryRow}>
          <span>Perkiraan</span>
          <span>
            {estimatedQuantity} {unit}
          </span>
        </div>
        <div className={styles.successSummaryRow}>
          <span>Metode</span>
          <span>{method === "DROP_OFF" ? "Antar ke Collection Point" : "Dijemput"}</span>
        </div>
      </div>

      {/* Next steps */}
      <div className={styles.successNextSteps}>
        <h3>Langkah Selanjutnya</h3>
        {method === "DROP_OFF" ? (
          <ol className={styles.nextStepsList}>
            <li>Siapkan limbahmu sesuai panduan yang telah dijelaskan.</li>
            <li>Antar ke lokasi collection point yang kamu pilih sesuai jam operasional.</li>
            <li>Tim kami akan menimbang dan memverifikasi limbahmu di tempat.</li>
            <li>Status donasimu akan diperbarui secara otomatis.</li>
          </ol>
        ) : (
          <ol className={styles.nextStepsList}>
            <li>Tim kami akan menghubungimu dalam 1–2 hari kerja untuk konfirmasi jadwal.</li>
            <li>Siapkan limbahmu sesuai panduan sebelum tim datang.</li>
            <li>Tim kami akan menimbang dan memverifikasi saat pengambilan.</li>
            <li>Status donasimu akan diperbarui setelah verifikasi selesai.</li>
          </ol>
        )}
      </div>

      {/* Actions */}
      <div className={styles.successActions}>
        <Link
          href={`/donasi/${reference}`}
          className={styles.successBtnPrimary}
        >
          Lacak Status Donasi
        </Link>
        <Link href="/" className={styles.successBtnSecondary}>
          Kembali ke Beranda
        </Link>
      </div>

      <p className={styles.successFooterNote}>
        Ada pertanyaan?{" "}
        <a href="mailto:kampungsmartfarming@gmail.com" className={styles.stepNoteLink}>
          Hubungi kami
        </a>
        .
      </p>
    </div>
  );
}
