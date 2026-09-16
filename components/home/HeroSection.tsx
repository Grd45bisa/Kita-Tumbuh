import React from "react";
import Image from "next/image";
import styles from "./HeroSection.module.css";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Badge } from "@/components/ui/Badge";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Container>
        <div className={styles.grid}>
          {/* Left: Editorial Story & Primary CTAs */}
          <div className={styles.contentCol}>
            <div className={styles.eyebrowBadge}>
              <Badge variant="brand">KITA TUMBUH</Badge>
              <Badge variant="neutral">Ekosistem Mandiri</Badge>
            </div>

            <h1 id="hero-title" className={styles.brandHeadline}>
              KAMPUNG SMART FARMING
            </h1>

            <p className={styles.brandTagline}>
              Dari Limbah, Tumbuh Manfaat.
            </p>

            <blockquote className={styles.signatureStatement}>
              &ldquo;SAMPAH KALIAN SANGAT BERARTI BAGI KAMI&rdquo;
            </blockquote>

            <p className={styles.description}>
              Sesuatu yang sering dianggap tak berguna berubah menjadi luar biasa dan bernilai di tangan yang spesial. Bersama kawan-kawan disabilitas dan penggerak komunitas, kami mengolah minyak jelantah dan limbah dapur menjadi produk bernilai tinggi, bio-kompos, serta sayuran segar kebun pintar yang menghidupkan kemandirian bersama.
            </p>

            <div className={styles.ctaGroup}>
              <LinkButton href="/donasikan" variant="primary" size="lg">
                Donasikan Limbah
              </LinkButton>
              <LinkButton href="#cara-kerja" variant="secondary" size="lg">
                Pelajari Alur
              </LinkButton>
              <LinkButton href="#dampak-sosial" variant="tertiary" size="md">
                Lihat Dampak
              </LinkButton>
            </div>
          </div>

          {/* Right: Human & Smart Farming Photo Frame */}
          <div className={styles.imageCol}>
            <div className={styles.imageFrame}>
              <Image
                src="/images/hero-community-farm.jpg"
                alt="Warga dan petani lokal merawat kebun sayur hidroponik dan irigasi cerdas di greenhouse Kampung Smart Farming"
                width={800}
                height={500}
                priority
                className={styles.heroImage}
              />
              <div className={styles.imageCaption}>
                <span className={styles.captionDot} aria-hidden="true" />
                <span>
                  Greenhouse Kebun Komunitas: Memanfaatkan pupuk bio-organik hasil olahan limbah warga.
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
