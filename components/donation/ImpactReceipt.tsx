import type { PublicDonationReceipt } from "@/types/donation";
import { formatWasteUnitLabel } from "@/types/donation";
import { STATUS_LABELS } from "./DonationTimeline";
import styles from "./ImpactReceipt.module.css";

interface ImpactReceiptProps {
  donation: PublicDonationReceipt;
}

export function ImpactReceipt({ donation }: ImpactReceiptProps) {
  const formatQuantity = (quantity: number) =>
    `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(quantity)} ${formatWasteUnitLabel(donation.unit)}`;

  return (
    <section className={styles.receipt} aria-label="Bukti donasi">
      <div className={styles.header}>
        <h2 className={styles.title}>Bukti Donasi</h2>
        <p className={styles.hint}>Simpan nomor referensi untuk memantau perjalanan donasi.</p>
      </div>
      <dl className={styles.details}>
        <div className={styles.row}>
          <dt>Nomor Referensi</dt>
          <dd className={styles.reference}>{donation.reference}</dd>
        </div>
        <div className={styles.row}>
          <dt>Jenis Limbah</dt>
          <dd>{donation.waste_type_name}</dd>
        </div>
        <div className={styles.row}>
          <dt>Perkiraan Jumlah</dt>
          <dd>{formatQuantity(donation.estimated_quantity)}</dd>
        </div>
        {donation.verified_quantity != null && (
          <div className={styles.row}>
            <dt>Jumlah Terverifikasi</dt>
            <dd>{formatQuantity(donation.verified_quantity)}</dd>
          </div>
        )}
        <div className={styles.row}>
          <dt>Status Saat Ini</dt>
          <dd>{STATUS_LABELS[donation.status]}</dd>
        </div>
      </dl>
      {donation.verified_quantity == null && (
        <p className={styles.note}>
          Jumlah di atas adalah perkiraan donor. Jumlah terverifikasi ditampilkan
          setelah penimbangan oleh tim operasional.
        </p>
      )}
      {/* No impact summary until verified donation-to-impact records exist. */}
    </section>
  );
}
