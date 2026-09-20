import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { env } from "@/lib/env";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Transparansi — Kampung Setara Smart Farming",
  description:
    "Komitmen transparansi Kampung Setara Smart Farming — laporan periodik yang dapat diverifikasi sedang kami bangun.",
  alternates: {
    canonical: `${env.siteUrl}/transparansi`,
  },
};

const principles = [
  "Perkiraan jumlah dari donatur dan jumlah aktual hasil verifikasi selalu dicatat sebagai dua angka terpisah, tidak pernah dicampur.",
  "Setiap perubahan status donasi tercatat dalam riwayat yang dapat ditelusuri, termasuk kapan perubahan itu terjadi.",
  "Biaya operasional tidak pernah disamarkan sebagai dana sosial.",
  "Angka publik hanya dipublikasikan setelah berasal dari data operasional yang terverifikasi — bukan perkiraan atau target.",
];

export default function TransparansiPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Transparansi" },
  ];

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>KITA TUMBUH — KAMPUNG SETARA SMART FARMING</p>
            <h1 className={styles.title}>Transparansi</h1>
            <p className={styles.lead}>
              Kami berkomitmen memisahkan perkiraan awal donatur dari hasil verifikasi
              aktual, lalu mencatat perjalanan bahan secara terbuka dari saat diterima
              hingga menjadi produk dan manfaat sosial.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <h2 className={styles.sectionTitle}>Prinsip pencatatan kami</h2>
          <ul className={styles.principleList}>
            {principles.map((principle) => (
              <li key={principle} className={styles.principleItem}>
                <span className={styles.principleIcon} aria-hidden="true">
                  ✓
                </span>
                <p className={styles.principleText}>{principle}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container>
          <ComingSoon
            title="Laporan periodik sedang kami siapkan"
            description="Ringkasan periodik berisi limbah masuk, limbah terolah, penjualan, dan alokasi sosial akan kami terbitkan begitu sistem agregasi data operasional kami siap — agar setiap angka yang dipublikasikan benar-benar dapat diverifikasi."
            action={{ label: "Lacak Donasimu", href: "/donasikan" }}
          />
        </Container>
      </section>
    </main>
  );
}
