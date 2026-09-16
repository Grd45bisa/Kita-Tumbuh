"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import styles from "./GallerySection.module.css";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";

interface GalleryItem {
  id: string;
  category: "karya-istimewa" | "smart-farming" | "aksi-warga" | "dampak-berbagi";
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
    category: "karya-istimewa",
    categoryLabel: "Karya Istimewa",
    badgeVariant: "brand",
    title: "Meracik Lilin Aromaterapi Bersama Teman Istimewa",
    desc: "Kawan disabilitas meracik lilin beraroma herbal dan sabun alami dari minyak jelantah terfiltrasi dengan ketelatenan tinggi di bengkel kerja komunitas.",
    imageSrc: "/images/gallery-inclusive-workshop.jpg",
    imageAlt: "Kawan disabilitas sedang dengan telaten menuangkan lilin aromaterapi dan meracik sabun alami di meja workshop komunitas",
  },
  {
    id: "gal-2",
    category: "smart-farming",
    categoryLabel: "Smart Farming",
    badgeVariant: "success",
    title: "Greenhouse Cerdas & Sensor Kelembapan",
    desc: "Perawatan instalasi sayuran hidroponik bebas pestisida berbantuan sensor kelembapan otomatis yang ramah dipantau oleh petani penggerak warga.",
    imageSrc: "/images/gallery-smart-greenhouse.jpg",
    imageAlt: "Petani wanita penggerak warga tersenyum memeriksa sensor kelembapan pada instalasi sayuran hijau hidroponik greenhouse",
  },
  {
    id: "gal-3",
    category: "karya-istimewa",
    categoryLabel: "Karya Istimewa",
    badgeVariant: "brand",
    title: "Mahakarya Lilin & Sabun Alami Bernilai Tinggi",
    desc: "Koleksi produk olahan siap guna bernilai tinggi dalam kemasan ramah lingkungan, membuktikan limbah menjadi bernilai di tangan yang spesial.",
    imageSrc: "/images/gallery-handcrafted-products.jpg",
    imageAlt: "Deretan lilin aromaterapi dalam toples kaca amber dan sabun batang herbal alami tertata rapi di atas meja kayu",
  },
  {
    id: "gal-4",
    category: "dampak-berbagi",
    categoryLabel: "Dampak & Berbagi",
    badgeVariant: "success",
    title: "Penyaluran Panen Segar ke Warga & Lansia",
    desc: "Kebahagiaan kader dan warga saat membagikan keranjang sayuran hidroponik segar hasil panen kebun kepada para lansia sekitar tanpa sekat.",
    imageSrc: "/images/gallery-harvest-distribution.jpg",
    imageAlt: "Kader sukarelawan muda dengan penuh hormat menyerahkan keranjang sayuran segar hidroponik kepada seorang nenek di depan beranda rumahnya",
  },
  {
    id: "gal-5",
    category: "aksi-warga",
    categoryLabel: "Aksi Komunitas",
    badgeVariant: "neutral",
    title: "Penyetoran & Penimbangan Jelantah di Pos Warga",
    desc: "Warga menyetorkan jeriken minyak jelantah bersih ke pos pengumpulan terpadu untuk ditimbang dan dicatat transparan ke dalam sistem terbuka.",
    imageSrc: "/images/gallery-waste-collection.jpg",
    imageAlt: "Ibu warga menyerahkan jeriken minyak jelantah kepada petugas relawan di meja penimbangan pos pengumpulan komunitas",
  },
  {
    id: "gal-6",
    category: "smart-farming",
    categoryLabel: "Smart Farming",
    badgeVariant: "neutral",
    title: "Pusat Pengolahan & Bedengan Bio-Kompos",
    desc: "Fasilitas swadaya warga untuk pemilahan jelantah dan fermentasi biokompos organik yang menjadi sumber nutrisi kebun hidroponik mandiri.",
    imageSrc: "/images/waste-transformation-process.jpg",
    imageAlt: "Fasilitas pemilahan limbah jelantah dan rumah kompos bio-organik warga Kampung Smart Farming",
  },
];

type FilterType = "semua" | "karya-istimewa" | "smart-farming" | "aksi-warga" | "dampak-berbagi";

const filters: { key: FilterType; label: string }[] = [
  { key: "semua", label: "Semua Dokumentasi" },
  { key: "karya-istimewa", label: "Karya Istimewa" },
  { key: "smart-farming", label: "Smart Farming" },
  { key: "aksi-warga", label: "Aksi Komunitas" },
  { key: "dampak-berbagi", label: "Dampak & Berbagi" },
];

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("semua");
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key to close lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && activeModalItem) {
        setActiveModalItem(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalItem]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (activeModalItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModalItem]);

  const filteredItems = activeFilter === "semua"
    ? galleryData
    : galleryData.filter((item) => item.category === activeFilter);

  return (
    <section id="galeri" className={styles.gallery} aria-labelledby="galeri-title">
      <Container>
        <SectionHeading
          eyebrow="Dokumentasi Jejak Nyata"
          title="Galeri Aktivitas & Mahakarya Komunitas"
          description="Menyaksikan langsung perjalanan gotong royong warga: dari penampungan limbah, kebun cerdas hidroponik, sentuhan tangan kawan istimewa, hingga berkah panen bersama."
        />

        {/* Filter Tabs */}
        <div className={styles.filterGroup} role="tablist" aria-label="Filter Galeri Aktivitas">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === f.key}
              className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.card}
              onClick={() => setActiveModalItem(item)}
              aria-label={`Buka detail foto: ${item.title}`}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  width={600}
                  height={450}
                  className={styles.image}
                  loading="lazy"
                />
                <div className={styles.badgeOverlay}>
                  <Badge variant={item.badgeVariant}>{item.categoryLabel}</Badge>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Container>

      {/* Lightbox Modal via Portal */}
      {mounted && activeModalItem && createPortal(
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-image-title"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setActiveModalItem(null)}
              aria-label="Tutup pratinjau gambar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.modalImageWrapper}>
              <Image
                src={activeModalItem.imageSrc}
                alt={activeModalItem.imageAlt}
                width={1200}
                height={800}
                className={styles.modalImage}
                priority
              />
            </div>

            <div className={styles.modalBody}>
              <div style={{ marginBottom: "var(--space-2)" }}>
                <Badge variant={activeModalItem.badgeVariant}>{activeModalItem.categoryLabel}</Badge>
              </div>
              <h3 id="modal-image-title" style={{ fontSize: "var(--font-size-heading-s)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
                {activeModalItem.title}
              </h3>
              <p style={{ fontSize: "var(--font-size-body-m)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-m)" }}>
                {activeModalItem.desc}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
