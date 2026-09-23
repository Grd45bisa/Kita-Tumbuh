import type { Metadata } from "next";
import { getPublicDonationReceipt } from "@/lib/domain/donations";
import { ImpactReceipt } from "@/components/donation/ImpactReceipt";
import { DonationLookupFallback } from "@/components/donation/DonationLookupFallback";
import { LinkButton } from "@/components/ui/LinkButton";
import { env } from "@/lib/env";
import styles from "@/components/donation/DonationPage.module.css";

interface Props {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  const title = `Bukti Donasi ${reference} — SEMAI`;
  const description = "Lihat material, jumlah, dan status donasi limbah yang tercatat. Tanpa informasi pribadi donor.";
  const url = `${env.siteUrl}/donasi/${encodeURIComponent(reference)}/receipt`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    openGraph: { title, description, url, type: "website", locale: "id_ID" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicDonationReceiptPage({ params }: Props) {
  const { reference } = await params;
  const result = await getPublicDonationReceipt(reference);

  if (!result.success) {
    return <DonationLookupFallback reference={reference} unavailable={result.code === "UNAVAILABLE"} />;
  }

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.content}>
        <header>
          <h1 className={styles.heading}>Dari Limbah, Tumbuh Manfaat.</h1>
          <p className={styles.intro}>Bukti donasi di SEMAI — Room to Grow.</p>
        </header>
        <ImpactReceipt donation={result.data} />
        <p className={styles.note}>
          Untuk membagikan bukti donasi, salin tautan halaman ini dari bilah alamat
          browser. Penerima tautan dapat membukanya tanpa akun.
        </p>
        <p className={styles.note}>
          Halaman ini hanya menampilkan referensi, material, jumlah, dan status.
          Nama, kontak, alamat penjemputan, serta catatan internal tidak dibagikan.
        </p>
        <div className={styles.actions}>
          <LinkButton href={`/donasi/${encodeURIComponent(result.data.reference)}`} variant="secondary">
            Lihat Perjalanan Donasi
          </LinkButton>
          <LinkButton href="/donasikan">Mulai Donasi</LinkButton>
        </div>
      </div>
    </main>
  );
}
