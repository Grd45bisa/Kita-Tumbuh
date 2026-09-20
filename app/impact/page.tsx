import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MemberLayout } from "@/components/member/MemberLayout";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Card } from "@/components/ui/Card";
import { WASTE_TYPE_LABELS } from "@/types/donation";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Dampak Saya | KITA TUMBUH",
  description: "Transparansi dan ringkasan dampak kontribusi sirkular Anda di KITA TUMBUH.",
  robots: {
    index: false,
    follow: false,
  },
};

interface WasteAggregation {
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
    .select("waste_type, estimated_quantity, verified_quantity, unit, status")
    .eq("user_id", user.id);

  const donations = rawDonations || [];

  // Group by waste type
  const summaryByType: Record<string, WasteAggregation> = {};

  donations.forEach((d) => {
    if (!summaryByType[d.waste_type]) {
      summaryByType[d.waste_type] = {
        count: 0,
        verifiedTotal: 0,
        estimatedTotal: 0,
        unit: d.unit,
      };
    }
    summaryByType[d.waste_type].count += 1;
    if (d.verified_quantity != null) {
      summaryByType[d.waste_type].verifiedTotal += Number(d.verified_quantity);
    } else {
      summaryByType[d.waste_type].estimatedTotal += Number(d.estimated_quantity);
    }
  });

  return (
    <MemberLayout activeKey="impact" user={user}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.greeting}>Dampak Kontribusi Kamu</h1>
        <p className={styles.subgreeting}>
          Setiap tetes minyak dan kilogram limbah yang kamu donasikan mencegah pencemaran lingkungan
          dan menjadi modal awal pemberdayaan sosial.
        </p>
      </div>

      {/* Real Verified / Tracked Physical Aggregates */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Akumulasi Limbah Tersalurkan</h2>
      </div>

      <div className={styles.statsGrid}>
        {Object.keys(summaryByType).length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "var(--space-6)",
              background: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              textAlign: "center",
              color: "var(--color-ink-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            Belum ada data limbah yang tersalurkan untuk akun ini. Mulai donasi pertamamu di{" "}
            <a href="/donasikan" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              halaman donasi
            </a>
            .
          </div>
        ) : (
          Object.entries(summaryByType).map(([wasteType, agg]) => {
            const hasVerified = agg.verifiedTotal > 0;
            return (
              <div key={wasteType} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>
                    {WASTE_TYPE_LABELS[wasteType] || wasteType}
                  </span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-ink-muted)" }}>
                    {agg.count} kali donasi
                  </span>
                </div>
                <div className={styles.statValue}>
                  {hasVerified
                    ? `${agg.verifiedTotal.toFixed(1)} ${agg.unit}`
                    : `~${agg.estimatedTotal.toFixed(1)} ${agg.unit}*`}
                </div>
                <div className={styles.statHint}>
                  {hasVerified
                    ? "Volume terverifikasi tim penimbangan"
                    : "*Estimasi mandiri (belum penimbangan akhir)"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Explanatory definitions regarding verified vs estimated metrics */}
      <Card style={{ marginBottom: "var(--space-8)", background: "var(--color-canvas)" }}>
        <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--space-2)" }}>
          Transparansi Definisi Metrik
        </h3>
        <ul style={{ fontSize: "var(--text-xs)", color: "var(--color-ink-muted)", lineHeight: 1.6, paddingLeft: "var(--space-4)" }}>
          <li>
            <strong>Volume Terverifikasi:</strong> Jumlah fisik limbah yang telah ditimbang secara akurat oleh tim lapangan atau pengelola titik kumpul saat serah terima.
          </li>
          <li>
            <strong>Estimasi Mandiri (*):</strong> Perkiraan kasar saat pengisian form oleh donatur. Angka ini diperbarui menjadi data terverifikasi begitu limbah melalui pos verifikasi.
          </li>
          <li>
            <strong>Integritas Data:</strong> Kami tidak menampilkan estimasi sebagai data terverifikasi dan tidak mencantumkan klaim konversi rupiah yang tidak dapat diverifikasi secara faktual.
          </li>
        </ul>
      </Card>

      {/* Derived Product Impact & Social Attribution (Honest ComingSoon per AGENTS.md) */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Jejak Hilirisasi & Dampak Sosial</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <ComingSoon
          title="Pelacakan Produk Turunan (Sabun & Lilin Aromaterapi)"
          description="Sistem pencatatan batch produksi limbah menjadi produk bernilai tambah sedang dalam tahap integrasi operasional. Nantinya kamu dapat melihat nomor batch produksi spesifik yang mengolah limbah dari donasimu."
        />

        <ComingSoon
          title="Atribusi Dana Sosial & Bantuan Lansia"
          description="Alokasi dana sosial dari hasil penjualan produk sirkular akan terhubung langsung ke program santunan dan pemeriksaan kesehatan lansia di Kampung Smart Farming secara transparan."
        />
      </div>
    </MemberLayout>
  );
}
