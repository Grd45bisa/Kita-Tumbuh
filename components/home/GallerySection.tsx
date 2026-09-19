"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import styles from "./GallerySection.module.css";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

interface GalleryItem {
  id: string;
  categoryLabel: string;
  badgeVariant: "brand" | "success" | "neutral";
  title: string;
  desc: string;
  imageSrc: string;
  imageAlt: string;
}

const galleryData: GalleryItem[] = [
  {
    id: "gal-1",
    categoryLabel: "Karya Istimewa",
    badgeVariant: "brand",
    title: "Workshop Kreasi Mandiri Anak-Anak Difabel",
    desc: "Anak-anak dan kawan difabel meracik lilin aromaterapi dan sabun ramah lingkungan dari minyak jelantah dengan ketelatenan tinggi di bengkel kerja komunitas.",
    imageSrc: "/images/data-difabel-workshop-jelantah.jpg",
    imageAlt: "Anak-anak difabel bekerja sama dengan teliti dan gembira di workshop pembuatan lilin dan sabun alami",
  },
  {
    id: "gal-2",
    categoryLabel: "Smart Farming",
    badgeVariant: "success",
    title: "Greenhouse Hidroponik Inklusif & Cerdas",
    desc: "Anak-anak difabel merawat instalasi sayuran hidroponik dengan ceria di kebun cerdas modern Kampung Setara Smart Farming.",
    imageSrc: "/images/hero-difabel-smart-farming.jpg",
    imageAlt: "Anak-anak difabel dengan ceria merawat sayuran hidroponik di greenhouse modern",
  },
  {
    id: "gal-3",
    categoryLabel: "Dampak & Panen",
    badgeVariant: "brand",
    title: "Senyum Bangga Panen Sayuran Segar",
    desc: "Kebahagiaan dan kebanggaan anak-anak difabel memegang keranjang sayuran hidroponik segar hasil rawatan mereka sendiri.",
    imageSrc: "/images/data-difabel-panen-hidroponik.jpg",
    imageAlt: "Anak-anak difabel tersenyum lebar dan bangga memegang keranjang sayuran segar hidroponik hasil panen",
  },
  {
    id: "gal-4",
    categoryLabel: "Edukasi Sirkular",
    badgeVariant: "success",
    title: "Edukasi Tunas Tani & Pupuk Bio-Kompos",
    desc: "Anak-anak difabel belajar mencampur bio-kompos organik dan menanam bibit sayuran di kebun komunitas dengan penuh kegembiraan.",
    imageSrc: "/images/data-difabel-kompos-tanaman.jpg",
    imageAlt: "Anak-anak difabel tertawa ceria saat belajar merawat tanah dan bibit tanaman sayur dengan pupuk kompos alami",
  },
  {
    id: "gal-5",
    categoryLabel: "Teknologi Setara",
    badgeVariant: "neutral",
    title: "Pemantauan Sensor Pintar Kebun Cerdas",
    desc: "Anak difabel didampingi instruktur memantau grafik kelembapan dan nutrisi sayuran hidroponik melalui tablet cerdas di greenhouse.",
    imageSrc: "/images/data-difabel-smart-monitoring.jpg",
    imageAlt: "Anak difabel di kursi roda memantau sensor cerdas kelembapan tanah hidroponik melalui layar digital tablet",
  },
  {
    id: "gal-6",
    categoryLabel: "Kemandirian Warga",
    badgeVariant: "neutral",
    title: "Potret Kebersamaan & Gotong Royong Tanpa Sekat",
    desc: "Momen kebersamaan anak-anak difabel, pemuda desa, dan kader relawan membuktikan kemandirian sirkular lahir dari gotong royong yang setara.",
    imageSrc: "/images/impact-difabel-komunitas.jpg",
    imageAlt: "Anak-anak difabel bersama para relawan komunitas berpose bersama dengan bangga di kebun hidroponik Kampung Setara Smart Farming",
  },
];

export function GallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeItem = selectedIndex !== null ? galleryData[selectedIndex] : null;

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : galleryData.length - 1));
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < galleryData.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex]);

  // Handle keyboard navigation for modal (Esc, Left Arrow, Right Arrow)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null) return;
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const getTileSpanClass = (index: number) => {
    if (index === 0) return styles.tileSpan7;
    if (index === 1) return styles.tileSpan5;
    if (index === 2 || index === 3 || index === 4) return styles.tileSpan4;
    return styles.tileSpan12;
  };

  return (
    <section id="galeri" className={styles.gallery} aria-labelledby="galeri-title">
      <Container>
        <div className={styles.sectionHeader}>
          <SectionHeading
            eyebrow="Kolase Jejak Nyata"
            title="Galeri Visual & Mahakarya Anak-Anak Difabel"
            description="Merekam setiap momen autentik dari bengkel kerja kreatif anak-anak istimewa, greenhouse cerdas hidroponik, hingga berkah kebersamaan warga Kampung Setara Smart Farming."
          />
          <div className={styles.hint}>
            <svg className={styles.hintIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>Klik pada gambar untuk membaca cerita di baliknya</span>
          </div>
        </div>

        {/* Collage Mosaic Grid (Pure Images - 2 cols on mobile) */}
        <div className={styles.collageGrid} role="region" aria-label="Kolase Foto Dokumentasi">
          {galleryData.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.tile} ${getTileSpanClass(idx)}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Buka cerita foto: ${item.title}`}
            >
              {/* Badge Overlay */}
              <div className={styles.tileCategoryBadge}>
                <Badge variant={item.badgeVariant}>{item.categoryLabel}</Badge>
              </div>

              {/* Pure Image */}
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 600px"
                className={styles.tileImage}
                loading="lazy"
              />

              {/* Hover Overlay Hint Pill */}
              <div className={styles.tileOverlay} aria-hidden="true">
                <span className={styles.tilePromptPill}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Buka Cerita
                </span>
              </div>
            </button>
          ))}
        </div>
      </Container>

      {/* Lightbox Story Modal via Portal */}
      {mounted && activeItem && createPortal(
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-image-title"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setSelectedIndex(null)}
              aria-label="Tutup cerita foto"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* High-res Photo */}
            <div className={styles.modalImageWrapper}>
              <Image
                src={activeItem.imageSrc}
                alt={activeItem.imageAlt}
                fill
                sizes="(max-width: 1023px) 100vw, 860px"
                className={styles.modalImage}
                priority
              />
            </div>

            {/* Story Details (Revealed Only When Clicked) */}
            <div className={styles.modalBody}>
              <div className={styles.modalNavRow}>
                <Badge variant={activeItem.badgeVariant}>{activeItem.categoryLabel}</Badge>
                <span className={styles.modalCounter}>
                  {selectedIndex! + 1} dari {galleryData.length}
                </span>
              </div>

              <h3 id="modal-image-title" className={styles.modalTitle}>
                {activeItem.title}
              </h3>

              <p className={styles.modalDesc}>
                {activeItem.desc}
              </p>

              {/* Navigation Arrows */}
              <div className={styles.modalNavButtons}>
                <button
                  type="button"
                  className={styles.modalNavBtn}
                  onClick={handlePrev}
                  aria-label="Foto sebelumnya"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Sebelumnya
                </button>

                <button
                  type="button"
                  className={styles.modalNavBtn}
                  onClick={handleNext}
                  aria-label="Foto selanjutnya"
                >
                  Selanjutnya
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
