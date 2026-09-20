import React from "react";
import Link from "next/link";
import { ImpactReceipt } from "./ImpactReceipt";
import type { PublicDonationReceipt } from "@/types/donation";
import styles from "./DonationWizard.module.css";
import { CheckCircleIcon } from "./DonationIcons";

interface DonationSuccessProps {
  donation: PublicDonationReceipt;
  method: "DROP_OFF" | "PICKUP";
  wasAlreadySubmitted?: boolean;
}

export function DonationSuccess({
  donation,
  method,
  wasAlreadySubmitted,
}: DonationSuccessProps) {
  const { reference } = donation;
  return (
    <div className={styles.successContainer}>
      <div className={styles.successIconWrap} aria-hidden="true">
        <CheckCircleIcon size={56} className={styles.successSvgIcon} />
      </div>

      <h2 className={styles.successTitle}>
        {wasAlreadySubmitted ? "Donasi Sudah Terdaftar" : "Donasi Berhasil Didaftarkan!"}
      </h2>

      <p className={styles.successSubtitle}>
        Terima kasih. <strong>SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.</strong>
      </p>

      <ImpactReceipt donation={donation} />

      {/* Next steps */}
      {!wasAlreadySubmitted && (
        <div className={styles.successNextSteps}>
          <h3>Langkah Selanjutnya</h3>
          {method === "DROP_OFF" ? (
            <ol className={styles.nextStepsList}>
              <li>Siapkan limbahmu sesuai panduan yang telah dijelaskan.</li>
              <li>Antar ke lokasi collection point yang kamu pilih sesuai jam operasional.</li>
              <li>Tim kami akan menimbang dan memverifikasi limbahmu di tempat.</li>
              <li>Status donasimu mengikuti pencatatan hasil oleh tim operasional.</li>
            </ol>
          ) : (
            <ol className={styles.nextStepsList}>
              <li>Tanggal dan waktu pilihanmu menunggu konfirmasi tim operasional.</li>
              <li>Siapkan limbahmu sesuai panduan sebelum tim datang.</li>
              <li>Tim kami akan menimbang dan memverifikasi saat pengambilan.</li>
              <li>Status donasimu akan diperbarui setelah verifikasi selesai.</li>
            </ol>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={styles.successActions}>
        <Link
          href={`/donasi/${reference}`}
          className={styles.successBtnPrimary}
        >
          Lacak Status Donasi
        </Link>
        <Link
          href={`/donasi/${encodeURIComponent(reference)}/receipt`}
          className={styles.successBtnSecondary}
        >
          Bagikan Dampak
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

