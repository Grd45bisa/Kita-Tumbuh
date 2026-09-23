import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MemberLayout } from "@/components/member/MemberLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DONATION_STATUS_LABELS, type DonationStatus } from "@/types/donation";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Dashboard Member | SEMAI",
  description: "Pantau donasi dan kontribusi sirkularmu di SEMAI.",
  robots: { index: false, follow: false },
};

const statusSteps: DonationStatus[] = ["SUBMITTED", "SCHEDULED", "COLLECTED", "VERIFIED"];

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();
  const { data: rawDonations } = await supabase
    .from("donations")
    .select("id, reference, waste_type_name, method, status, estimated_quantity, verified_quantity, unit, created_at, scheduled_pickup_date, pickup_time_slot")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const donations = rawDonations || [];
  let verifiedLiters = 0;
  let verifiedKg = 0;
  let estimatedLiters = 0;
  let estimatedKg = 0;

  donations.forEach((donation) => {
    const quantity = Number(donation.verified_quantity ?? donation.estimated_quantity ?? 0);
    const verified = donation.verified_quantity != null;
    if (donation.unit === "L") {
      if (verified) verifiedLiters += quantity;
      else estimatedLiters += quantity;
    } else if (donation.unit === "kg") {
      if (verified) verifiedKg += quantity;
      else estimatedKg += quantity;
    }
  });

  const activeDonation = donations.find((donation) =>
    statusSteps.includes(donation.status as DonationStatus)
  );
  const activeStep = activeDonation
    ? Math.max(0, statusSteps.indexOf(activeDonation.status as DonationStatus))
    : 0;
  const displayName = user.profile?.full_name || user.email.split("@")[0];
  const volumeLabel = (verified: number, estimated: number, unit: string) =>
    verified > 0 ? `${verified.toFixed(1)} ${unit}` : estimated > 0 ? `~${estimated.toFixed(1)} ${unit}` : `0 ${unit}`;

  return (
    <MemberLayout activeKey="dashboard" user={user}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Ringkasan akun</p>
          <h1 className={styles.pageTitle}>Halo, {displayName}</h1>
          <p className={styles.pageSubtitle}>Pantau donasi dan mulai kontribusi berikutnya dari sini.</p>
        </div>
        <Link href="/donasikan" className={styles.headerAction}>
          <Button variant="primary" size="md">+ Donasi limbah</Button>
        </Link>
      </header>

      {activeDonation && (
        <section className={styles.activeCard} aria-labelledby="active-donation-title">
          <div className={styles.activeTopRow}>
            <div>
              <p className={styles.eyebrow}>Donasi sedang berjalan</p>
              <h2 id="active-donation-title" className={styles.activeTitle}>
                {activeDonation.waste_type_name} <span>#{activeDonation.reference}</span>
              </h2>
            </div>
            <Badge variant={activeDonation.status === "VERIFIED" ? "success" : "warning"}>
              {DONATION_STATUS_LABELS[activeDonation.status as DonationStatus] || activeDonation.status}
            </Badge>
          </div>
          <div className={styles.progressTrack} aria-label={`Tahap ${activeStep + 1} dari 4`}>
            {statusSteps.map((step, index) => (
              <span key={step} className={index <= activeStep ? styles.progressDone : styles.progressPending} />
            ))}
          </div>
          <div className={styles.activeBottomRow}>
            <p className={styles.activeMeta}>
              {activeDonation.method === "PICKUP" ? "Dijemput" : "Diantar ke titik kumpul"}
              {activeDonation.scheduled_pickup_date ? ` · ${activeDonation.scheduled_pickup_date}` : ""}
            </p>
            <Link href={`/donasi/${activeDonation.reference}`} className={styles.textLink}>Lihat detail →</Link>
          </div>
        </section>
      )}

      <section aria-labelledby="summary-title">
        <div className={styles.sectionHeader}>
          <h2 id="summary-title" className={styles.sectionTitle}>Kontribusimu</h2>
          <Link href="/impact" className={styles.textLink}>Lihat dampak →</Link>
        </div>
        <div className={styles.metricGrid}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Total donasi</span>
            <strong className={styles.metricValue}>{donations.length}</strong>
            <span className={styles.metricNote}>kali tercatat</span>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Minyak jelantah</span>
            <strong className={styles.metricValue}>{volumeLabel(verifiedLiters, estimatedLiters, "L")}</strong>
            <span className={styles.metricNote}>{verifiedLiters > 0 ? "terverifikasi" : estimatedLiters > 0 ? "estimasi" : "belum ada"}</span>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Limbah padat</span>
            <strong className={styles.metricValue}>{volumeLabel(verifiedKg, estimatedKg, "kg")}</strong>
            <span className={styles.metricNote}>{verifiedKg > 0 ? "terverifikasi" : estimatedKg > 0 ? "estimasi" : "belum ada"}</span>
          </article>
        </div>
      </section>

      <section aria-labelledby="quick-title">
        <div className={styles.sectionHeader}>
          <h2 id="quick-title" className={styles.sectionTitle}>Akses cepat</h2>
        </div>
        <div className={styles.quickLinks}>
          <Link href="/collection-point" className={styles.quickLink}>
            <span className={styles.quickIcon} aria-hidden="true">⌖</span>
            <span><strong>Cari titik kumpul</strong><small>Temukan lokasi terdekat</small></span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/produk" className={styles.quickLink}>
            <span className={styles.quickIcon} aria-hidden="true">♻</span>
            <span><strong>Produk sirkular</strong><small>Lihat hasil pengolahan</small></span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="recent-title">
        <div className={styles.sectionHeader}>
          <h2 id="recent-title" className={styles.sectionTitle}>Donasi terbaru</h2>
          {donations.length > 0 && <Link href="/riwayat" className={styles.textLink}>Semua ({donations.length}) →</Link>}
        </div>
        {donations.length === 0 ? (
          <EmptyState
            title="Belum ada donasi"
            description="Donasi pertamamu akan muncul dan bisa dipantau di sini."
            action={{ label: "Mulai donasi", href: "/donasikan" }}
          />
        ) : (
          <div className={styles.donationList}>
            {donations.slice(0, 3).map((donation) => (
              <Link key={donation.id} href={`/donasi/${donation.reference}`} className={styles.donationItem}>
                <div className={styles.donationMain}>
                  <strong>{donation.waste_type_name}</strong>
                  <span className={styles.donationMeta}>
                    #{donation.reference} · {new Date(donation.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className={styles.donationStatusArea}>
                  <span className={styles.quantity}>
                    {donation.verified_quantity != null ? donation.verified_quantity : `~${donation.estimated_quantity}`} {donation.unit}
                  </span>
                  <Badge variant={["IMPACTED", "VERIFIED"].includes(donation.status) ? "success" : "neutral"}>
                    {DONATION_STATUS_LABELS[donation.status as DonationStatus] || donation.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MemberLayout>
  );
}
