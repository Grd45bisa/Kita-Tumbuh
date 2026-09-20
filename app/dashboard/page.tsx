import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MemberLayout } from "@/components/member/MemberLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DONATION_STATUS_LABELS, WASTE_TYPE_LABELS, type DonationStatus } from "@/types/donation";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Dashboard Member | KITA TUMBUH",
  description: "Area member KITA TUMBUH untuk memantau status donasi limbah dan kontribusi sirkular.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();

  // Query donations belonging strictly to this user
  const { data: rawDonations } = await supabase
    .from("donations")
    .select("id, reference_number, waste_type, delivery_method, status, estimated_quantity, verified_quantity, unit, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const donations = rawDonations || [];
  const totalDonations = donations.length;

  // Compute verified vs estimated quantities (factual, non-fabricated)
  let totalVerifiedLiters = 0;
  let totalVerifiedKg = 0;
  let totalEstimatedLiters = 0;
  let totalEstimatedKg = 0;
  let hasVerifiedData = false;

  donations.forEach((d) => {
    const isVerified = d.verified_quantity !== null && d.verified_quantity !== undefined;
    if (isVerified) hasVerifiedData = true;

    if (d.unit === "LITER") {
      if (isVerified) totalVerifiedLiters += Number(d.verified_quantity);
      else totalEstimatedLiters += Number(d.estimated_quantity);
    } else if (d.unit === "KG") {
      if (isVerified) totalVerifiedKg += Number(d.verified_quantity);
      else totalEstimatedKg += Number(d.estimated_quantity);
    }
  });

  // Active pickups
  const activePickup = donations.find(
    (d) => d.delivery_method === "PICKUP" && ["SUBMITTED", "SCHEDULED"].includes(d.status)
  );

  const displayName = user.profile?.full_name || user.email.split("@")[0];

  return (
    <MemberLayout activeKey="dashboard" user={user}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.greeting}>Halo, {displayName}!</h1>
        <p className={styles.subgreeting}>
          Terima kasih telah bergotong royong menjaga lingkungan. Sampah kalian sangat berarti bagi kami.
        </p>
      </div>

      {activePickup && (
        <div className={styles.activePickupBanner}>
          <div className={styles.pickupBannerInfo}>
            <div className={styles.pickupBannerTitle}>
              Jadwal Penjemputan Aktif — #{activePickup.reference_number}
            </div>
            <div className={styles.pickupBannerDesc}>
              Limbah {WASTE_TYPE_LABELS[activePickup.waste_type] || activePickup.waste_type} sedang
              dalam antrean penjemputan (Status: {DONATION_STATUS_LABELS[activePickup.status as DonationStatus]}).
            </div>
          </div>
          <Link href={`/donasi/${activePickup.reference_number}`}>
            <Button variant="secondary" size="sm">
              Pantau Status
            </Button>
          </Link>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Donasi</span>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className={styles.statValue}>{totalDonations}</div>
          <div className={styles.statHint}>Kontribusi yang tercatat</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Limbah Terverifikasi (Liter)</span>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className={styles.statValue}>
            {totalVerifiedLiters > 0 ? `${totalVerifiedLiters.toFixed(1)} L` : totalEstimatedLiters > 0 ? `~${totalEstimatedLiters.toFixed(1)} L*` : "0 L"}
          </div>
          <div className={styles.statHint}>
            {hasVerifiedData ? "Volume riil terverifikasi tim" : "*Berdasarkan estimasi awal"}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Limbah Terverifikasi (Kg)</span>
            <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <div className={styles.statValue}>
            {totalVerifiedKg > 0 ? `${totalVerifiedKg.toFixed(1)} Kg` : totalEstimatedKg > 0 ? `~${totalEstimatedKg.toFixed(1)} Kg*` : "0 Kg"}
          </div>
          <div className={styles.statHint}>
            {hasVerifiedData ? "Bobot riil terverifikasi tim" : "*Berdasarkan estimasi awal"}
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Donasi Terbaru</h2>
        {donations.length > 0 && (
          <Link href="/riwayat" className={styles.sectionAction}>
            Lihat Semua Riwayat →
          </Link>
        )}
      </div>

      {donations.length === 0 ? (
        <EmptyState
          title="Belum Ada Donasi Tercatat"
          description="Kamu belum melakukan donasi limbah saat masuk dengan akun ini. Limbah rumah tanggamu sangat berarti untuk diolah menjadi berkah sosial."
          action={{
            label: "Mulai Donasikan Limbah",
            href: "/donasikan",
          }}
        />
      ) : (
        <div className={styles.donationList}>
          {donations.slice(0, 5).map((d) => (
            <Link key={d.id} href={`/donasi/${d.reference_number}`} className={styles.donationItem}>
              <div className={styles.donationMain}>
                <div className={styles.donationRef}>#{d.reference_number}</div>
                <div className={styles.donationMeta}>
                  <span>{WASTE_TYPE_LABELS[d.waste_type] || d.waste_type}</span>
                  <span>•</span>
                  <span>{d.delivery_method === "PICKUP" ? "Jemput (Pickup)" : "Antar Mandiri"}</span>
                  <span>•</span>
                  <span>
                    {new Date(d.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className={styles.donationStatusArea}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-ink-muted)" }}>
                  {d.verified_quantity != null
                    ? `${d.verified_quantity} ${d.unit}`
                    : `Est. ~${d.estimated_quantity} ${d.unit}`}
                </span>
                <Badge variant={d.status === "IMPACTED" ? "success" : d.status === "REJECTED" ? "danger" : "neutral"}>
                  {DONATION_STATUS_LABELS[d.status as DonationStatus] || d.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MemberLayout>
  );
}
