import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.topGrid}>
          {/* Column 1: Brand & Core Statement */}
          <div className={styles.brandCol}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
              <Image
                src="/images/Logo.png"
                alt="Logo KITA TUMBUH"
                width={44}
                height={44}
                style={{ objectFit: "contain", borderRadius: "var(--radius-sm)", flexShrink: 0 }}
              />
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: "var(--font-weight-bold)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-earth-600)", display: "block", lineHeight: 1 }}>
                  KITA TUMBUH
                </span>
                <span className={styles.brandTitle} style={{ display: "block", marginTop: "2px" }}>
                  KAMPUNG SMART FARMING
                </span>
              </div>
            </div>
            <span className={styles.brandTagline}>Dari Limbah, Tumbuh Manfaat.</span>
            <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
              Platform sirkular sosial yang mengubah limbah rumah tangga menjadi pupuk, pakan, produk bernilai, dan pangan segar berbasis smart farming untuk mendanai program sosial keluarga sekitar.
            </p>
            <div className={styles.brandStatement}>
              &ldquo;SAMPAH KALIAN SANGAT BERARTI BAGI KAMI&rdquo;
            </div>
          </div>

          {/* Column 2: Alur & Aksi */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Alur & Partisipasi</h3>
            <ul className={styles.navList}>
              <li>
                <Link href="/donasikan" className={styles.navItem}>
                  Donasikan Limbah
                </Link>
              </li>
              <li>
                <Link href="#cara-kerja" className={styles.navItem}>
                  Cara Kerja Sirkular
                </Link>
              </li>
              <li>
                <Link href="#kategori-limbah" className={styles.navItem}>
                  Kategori Minyak & Organik
                </Link>
              </li>
              <li>
                <Link href="#produk" className={styles.navItem}>
                  Produk Olahan & Pangan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Ekosistem & Dampak */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Dampak & Transparansi</h3>
            <ul className={styles.navList}>
              <li>
                <Link href="#smart-farming" className={styles.navItem}>
                  Smart Farming Warga
                </Link>
              </li>
              <li>
                <Link href="#dampak-sosial" className={styles.navItem}>
                  Penyaluran Sosial
                </Link>
              </li>
              <li>
                <Link href="#transparansi" className={styles.navItem}>
                  Audit Jejak & Data Terbuka
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Titik Pengumpulan & Operasional */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Pusat Pengumpulan</h3>
            <div className={styles.contactInfo}>
              <p style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                Pos Pengumpulan Terpadu Komunitas
              </p>
              <p>Balai Kebun & Rumah Kompos Mandiri Warga</p>
              <p style={{ marginTop: "var(--space-2)" }}>
                <strong>Jam Penerimaan:</strong><br />
                Senin – Sabtu: 08.00 – 16.00 WIB
              </p>
              <p style={{ marginTop: "var(--space-1)" }}>
                <strong>Kontak Narahubung:</strong><br />
                +62 812-3456-7890 (Kader Penggerak)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>
            &copy; {new Date().getFullYear()} Kampung Smart Farming. Semua hak cipta dilindungi.
          </p>
          <p>
            Inisiatif sirkular sosial percontohan — berkomitmen pada integritas jejak data nyata dan martabat warga.
          </p>
        </div>
      </Container>
    </footer>
  );
}
