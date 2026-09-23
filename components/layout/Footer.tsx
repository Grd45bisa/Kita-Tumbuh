import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.topGrid}>
          <div className={styles.brandCol}>
            <div className={styles.brandRow}>
              <Image
                src="/images/semai-logo.png"
                alt="Logo SEMAI"
                width={48}
                height={48}
                className={styles.logo}
              />
              <div>
                <span className={styles.brandTitle}>SEMAI</span>
                <span className={styles.brandTagline}>Room to Grow</span>
              </div>
            </div>
            <p>
              Sebab setiap potensi butuh ruang untuk bermula. Mengolah sisa organik dan limbah rumah tangga menjadi nutrisi kebun, ruang belajar, dan karya nyata yang setara.
            </p>
          </div>

          <div className={styles.navCol}>
            <h2>Jelajahi</h2>
            <Link href="#tentang">Tentang SEMAI</Link>
            <Link href="#ruang-tumbuh">The Four Rooms</Link>
            <Link href="#cara-kerja">Cara Kerja</Link>
            <Link href="#jejak-tumbuh">Jejak Tumbuh</Link>
            <Link href="#dampak">Dampak & Cerita</Link>
          </div>

          <div className={styles.actionCol}>
            <span>Beri ruang. Lihat apa yang bisa tumbuh.</span>
            <h2>Satu tindakan kecil membuka ruang untuk banyak hal bertumbuh.</h2>
            <Link href="/donasikan">Beri Ruang untuk Tumbuh <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} SEMAI — Inclusive Circular Smart Farming.</p>
          <p>“Yang kami tumbuhkan bukan hanya tanaman.”</p>
        </div>
      </Container>
    </footer>
  );
}
