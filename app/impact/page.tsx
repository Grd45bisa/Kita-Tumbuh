import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MemberLayout } from "@/components/member/MemberLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatWasteUnitLabel } from "@/types/donation";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Dampak Saya | SEMAI",
  description: "Ringkasan kontribusi sirkular Anda di SEMAI.",
  robots: { index: false, follow: false },
};

interface WasteAggregation {
  name: string;
  count: number;
  verifiedTotal: number;
  estimatedTotal: number;
  unit: string;
}

export default async function MemberImpactPage() {
  const user = await requireUser("/impact");
  const supabase = await createClient();
  const { data: rawDonations } = await supabase
    .from("donations")
    .select("waste_type_slug, waste_type_name, estimated_quantity, verified_quantity, unit")
    .eq("user_id", user.id);

  const summaryByType: Record<string, WasteAggregation> = {};
  (rawDonations || []).forEach((donation) => {
    const key = donation.waste_type_slug;
    if (!summaryByType[key]) {
      summaryByType[key] = {
        name: donation.waste_type_name,
        count: 0,
        verifiedTotal: 0,
        estimatedTotal: 0,
        unit: donation.unit,
      };
    }
    summaryByType[key].count += 1;
    if (donation.verified_quantity != null) {
      summaryByType[key].verifiedTotal += Number(donation.verified_quantity);
    } else {
      summaryByType[key].estimatedTotal += Number(donation.estimated_quantity);
    }
  });

  const summaries = Object.values(summaryByType);

  return (
    <MemberLayout activeKey="impact" user={user}>
      <header className={styles.welcomeSection}>
        <h1 className={styles.greeting}>Dampak Saya</h1>
        <p className={styles.subgreeting}>Ringkasan limbah yang sudah kamu salurkan.</p>
      </header>

      {summaries.length === 0 ? (
        <EmptyState
          title="Belum ada dampak tercatat"
          description="Ringkasan akan muncul setelah kamu membuat donasi."
          action={{ label: "Mulai donasi", href: "/donasikan" }}
        />
      ) : (
        <>
          <div className={styles.statsGrid}>
            {summaries.map((summary) => {
              const verified = summary.verifiedTotal > 0;
              const value = verified ? summary.verifiedTotal : summary.estimatedTotal;
              return (
                <article key={summary.name} className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <span className={styles.statLabel}>{summary.name}</span>
                    <span className={styles.metricNote}>{summary.count} donasi</span>
                  </div>
                  <strong className={styles.statValue}>{verified ? "" : "~"}{value.toFixed(1)} {formatWasteUnitLabel(summary.unit)}</strong>
                  <span className={styles.statHint}>{verified ? "Sudah ditimbang" : "Masih estimasi"}</span>
                </article>
              );
            })}
          </div>

          <aside className={styles.infoCard}>
            <strong>Cara membaca angka</strong>
            <p>Angka bertanda ~ masih berupa estimasi. Setelah petugas menimbang donasi, angka akan diperbarui otomatis.</p>
          </aside>
          <Link href="/transparansi" className={styles.fullLink}>Lihat dampak SEMAI →</Link>
        </>
      )}
    </MemberLayout>
  );
}
