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
                src="/images/Logo.png"
                alt="Logo KITA TUMBUH"
                width={48}
                height={48}
                className={styles.logo}
              />
              <div>
                <span className={styles.brandTitle}>KITA TUMBUH</span>
                <span className={styles.brandTagline}>Kampung Setara Smart Farming</span>
              </div>
            </div>
            <p>
              Gerakan gotong royong yang mengubah sampah terpilah menjadi ruang belajar, karya, dan kemandirian bagi anak-anak difabel.
            </p>
          </div>

          <div className={styles.navCol}>
            <h2>Jelajahi</h2>
            <Link href="#cara-kerja">Cara kerja</Link>
            <Link href="#kategori-limbah">Sampah yang diterima</Link>
            <Link href="#dampak-sosial">Dampak sosial</Link>
            <Link href="#galeri">Galeri kegiatan</Link>
            <Link href="#transparansi">Transparansi</Link>
          </div>

          <div className={styles.actionCol}>
            <span>Punya sampah terpilah di rumah?</span>
            <h2>Jangan dibuang. Mari tumbuhkan manfaatnya.</h2>
            <Link href="/donasikan">Mulai berdonasi <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} KITA TUMBUH — Kampung Setara Smart Farming.</p>
          <p>Sampah kalian sangat berarti bagi kami.</p>
        </div>
      </Container>
    </footer>
  );
}
