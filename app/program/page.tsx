import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { env } from "@/lib/env";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Program Sosial — Kampung Setara Smart Farming",
  description:
    "Program sosial yang didukung oleh hasil ekonomi Kampung Setara Smart Farming — daftar program sedang kami siapkan.",
  alternates: {
    canonical: `${env.siteUrl}/program`,
  },
};

export default function ProgramPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Program Sosial" },
  ];

  return (
    <main id="main-content">
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <Breadcrumb items={breadcrumbItems} />
            <p className={styles.eyebrow}>KITA TUMBUH — KAMPUNG SETARA SMART FARMING</p>
            <h1 className={styles.title}>Program Sosial</h1>
            <p className={styles.lead}>
              Hasil ekonomi dari pengolahan limbah dan kebun smart farming kami arahkan untuk
              mendukung ruang belajar, berkarya, dan kemandirian anak-anak difabel.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <p className={styles.blockText}>
            Kami sedang menyusun daftar program secara terstruktur — lengkap dengan tujuan,
            status, dan sumber pendanaan masing-masing — agar setiap program yang ditampilkan
            benar-benar dapat dipertanggungjawabkan datanya.
          </p>

          <ComingSoon
            title="Daftar program sedang kami siapkan"
            description="Kami ingin setiap program yang ditampilkan di sini punya tujuan, status, dan sumber dana yang jelas dan dapat diverifikasi. Untuk memahami bagaimana hasil donasimu dialokasikan, lihat penjelasan alur di halaman Cara Kerja."
            action={{ label: "Lihat Cara Kerja", href: "/cara-kerja" }}
          />
        </Container>
      </section>
    </main>
  );
}
