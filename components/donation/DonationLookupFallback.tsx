import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DonationLookupForm } from "./DonationLookupForm";
import styles from "./DonationPage.module.css";

interface DonationLookupFallbackProps {
  reference: string;
  unavailable?: boolean;
}

export function DonationLookupFallback({ reference, unavailable }: DonationLookupFallbackProps) {
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Lacak Donasi</h1>
        {unavailable ? (
          <ErrorState
            title="Status donasi belum dapat dimuat."
            description="Layanan sedang mengalami kendala. Coba cek ulang referensi dalam beberapa saat."
            action={{ label: "Coba Muat Ulang", href: `/donasi/${encodeURIComponent(reference)}` }}
          />
        ) : (
          <EmptyState
            title="Donasi dengan referensi ini tidak ditemukan."
            description="Periksa kembali kodenya pada konfirmasi donasi, lalu masukkan di bawah ini."
            action={{ label: "Mulai Donasi Baru", href: "/donasikan" }}
          />
        )}
        <DonationLookupForm reference={reference} />
      </div>
    </main>
  );
}
