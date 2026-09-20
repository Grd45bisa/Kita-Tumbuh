import type { Metadata } from "next";
import { getDonationByReference } from "@/lib/domain/donations";
import { DonationTimeline } from "@/components/donation/DonationTimeline";
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
  return {
    title: `Donasi ${reference} — Kampung Setara Smart Farming`,
    description: `Lacak status donasi limbahmu dengan referensi ${reference}.`,
    alternates: { canonical: `${env.siteUrl}/donasi/${encodeURIComponent(reference)}` },
    robots: { index: false, follow: false },
  };
}

export default async function DonationTrackingPage({ params }: Props) {
  const { reference } = await params;
  const result = await getDonationByReference(reference);

  if (!result.success) {
    return <DonationLookupFallback reference={reference} unavailable={result.code === "UNAVAILABLE"} />;
  }

  const donation = result.data;
  const createdAt = new Date(donation.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  });

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.content}>
        <header>
          <h1 className={styles.heading}>Status Donasi</h1>
          <p className={styles.intro}>Didaftarkan pada {createdAt}.</p>
        </header>
        <ImpactReceipt donation={donation} />
        <dl className={styles.details}>
          <div>
            <dt>Metode Penyerahan</dt>
            <dd>{donation.method === "DROP_OFF" ? "Antar ke Collection Point" : "Dijemput"}</dd>
          </div>
          {donation.collection_point && (
            <div>
              <dt>Collection Point</dt>
              <dd>{donation.collection_point.name}</dd>
            </div>
          )}
        </dl>
        <section aria-labelledby="donation-journey">
          <h2 id="donation-journey" className={styles.sectionTitle}>Perjalanan Donasimu</h2>
          <DonationTimeline currentStatus={donation.status} statusHistory={donation.status_history} />
        </section>
        <div className={styles.actions}>
          <LinkButton href={`/donasi/${encodeURIComponent(donation.reference)}/receipt`}>
            Bagikan Dampak
          </LinkButton>
          <LinkButton href="/donasikan" variant="secondary">Donasikan Lagi</LinkButton>
        </div>
        <p className={styles.note}>
          Alamat penjemputan, kontak, dan catatan internal tidak ditampilkan di halaman publik.
        </p>
      </div>
    </main>
  );
}
