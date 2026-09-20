import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { env } from "@/lib/env";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dampak — Kampung Setara Smart Farming",
  description:
    "Ringkasan dampak Kampung Setara Smart Farming — sistem agregasi data dampak publik sedang kami bangun agar setiap angka dapat diverifikasi.",
  alternates: {
    canonical: `${env.siteUrl}/dampak`,
  },
};

const metricLabels = [
  "Limbah diterima",
  "Limbah diproses",
  "Produk dihasilkan",
  "Alokasi sosial",
];

export default function DampakPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Dampak" },
  ];

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>KITA TUMBUH — KAMPUNG SETARA SMART FARMING</p>
            <h1 className={styles.title}>Dampak</h1>
            <p className={styles.lead}>
              Kami ingin setiap angka dampak yang ditampilkan di sini benar-benar berasal
              dari data operasional yang terverifikasi — bukan perkiraan.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Metrik yang akan kami tampilkan</h2>
          <div className={styles.metricGrid}>
            {metricLabels.map((label) => (
              <div key={label} className={styles.metricCard}>
                <p className={styles.metricLabel}>{label}</p>
                <p className={styles.metricValue}>—</p>
              </div>
            ))}
          </div>

          <ComingSoon
            title="Angka dampak sedang kami verifikasi"
            description="Kami sedang membangun sistem agregasi data agar angka limbah diterima, diproses, produk dihasilkan, dan alokasi sosial yang ditampilkan di sini benar-benar berasal dari catatan operasional yang terverifikasi — bukan perkiraan."
            action={{ label: "Lacak Donasimu", href: "/donasikan" }}
          />
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <h2 className={styles.sectionTitle}>Bagaimana angka ini nantinya dihitung</h2>
          <p className={styles.methodologyText}>
            <strong>Limbah diterima</strong> dihitung dari jumlah aktual yang diverifikasi
            saat limbah diterima — bukan dari perkiraan yang diisi donatur saat mengajukan
            donasi.
          </p>
          <p className={styles.methodologyText}>
            <strong>Limbah diproses</strong> dihitung dari jumlah limbah yang benar-benar
            masuk ke tahap pengolahan menjadi produk atau bahan pendukung kebun.
          </p>
          <p className={styles.methodologyText}>
            <strong>Alokasi sosial</strong> dihitung dari catatan alokasi yang telah disetujui
            dan ditujukan untuk program sosial — dipisahkan secara jelas dari biaya
            operasional.
          </p>
        </Container>
      </section>
    </main>
  );
}
