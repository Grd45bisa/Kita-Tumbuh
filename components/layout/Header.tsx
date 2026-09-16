"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { Container } from "@/components/ui/Container";

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const closeDrawer = () => setIsMobileOpen(false);

  return (
    <>
      <header className={styles.header}>
        <Container>
          <div className={styles.inner}>
            {/* Brand Wordmark with Logo */}
            <Link href="/" className={styles.brand} aria-label="Beranda Kampung Smart Farming">
              <Image
                src="/images/Logo.png"
                alt="Logo KITA TUMBUH"
                width={38}
                height={38}
                className={styles.brandLogo}
                priority
              />
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>KAMPUNG SMART FARMING</span>
                <span className={styles.brandSubtitle}>KITA TUMBUH &bull; Dari Limbah, Tumbuh Manfaat.</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className={styles.desktopNav} aria-label="Navigasi Utama">
              <Link href="#cara-kerja" className={styles.navLink}>
                Cara Kerja
              </Link>
              <Link href="#kategori-limbah" className={styles.navLink}>
                Kategori Limbah
              </Link>
              <Link href="#smart-farming" className={styles.navLink}>
                Smart Farming
              </Link>
              <Link href="#dampak-sosial" className={styles.navLink}>
                Dampak Sosial
              </Link>
              <Link href="#produk" className={styles.navLink}>
                Produk
              </Link>
              <Link href="#transparansi" className={styles.navLink}>
                Transparansi
              </Link>
            </nav>

            {/* Primary CTA (Desktop & Tablet) */}
            <div className={styles.desktopCta}>
              <Link href="/donasikan" className={styles.ctaButton}>
                Donasikan Limbah
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Mobile Toggle Button */}
            <button
              type="button"
              className={styles.mobileToggle}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={isMobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {isMobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer mounted directly to document.body via Portal */}
      {mounted &&
        isMobileOpen &&
        createPortal(
          <>
            <div
              className={styles.drawerOverlay}
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <div
              id="mobile-nav-drawer"
              className={styles.drawer}
              role="dialog"
              aria-modal="true"
              aria-label="Menu Navigasi Mobile"
            >
              <div className={styles.drawerHeader}>
                <div className={styles.drawerBrand}>
                  <Image
                    src="/images/Logo.png"
                    alt="Logo KITA TUMBUH"
                    width={34}
                    height={34}
                    className={styles.drawerLogo}
                  />
                  <div>
                    <span className={styles.drawerBrandTitle}>KAMPUNG SMART FARMING</span>
                    <span className={styles.drawerBrandSubtitle}>KITA TUMBUH</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={closeDrawer}
                  aria-label="Tutup menu navigasi"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links in Drawer */}
              <div className={styles.drawerNav}>
                <div className={styles.drawerSectionTitle}>Menu Navigasi</div>
                <ul className={styles.drawerList}>
                  <li>
                    <Link href="#cara-kerja" className={styles.drawerLink} onClick={closeDrawer}>
                      Cara Kerja Sirkular
                    </Link>
                  </li>
                  <li>
                    <Link href="#kategori-limbah" className={styles.drawerLink} onClick={closeDrawer}>
                      Kategori Limbah
                    </Link>
                  </li>
                  <li>
                    <Link href="#smart-farming" className={styles.drawerLink} onClick={closeDrawer}>
                      Smart Farming Komunitas
                    </Link>
                  </li>
                  <li>
                    <Link href="#dampak-sosial" className={styles.drawerLink} onClick={closeDrawer}>
                      Dampak Sosial
                    </Link>
                  </li>
                  <li>
                    <Link href="#produk" className={styles.drawerLink} onClick={closeDrawer}>
                      Produk Olahan & Pangan
                    </Link>
                  </li>
                  <li>
                    <Link href="#transparansi" className={styles.drawerLink} onClick={closeDrawer}>
                      Transparansi & Alur Jejak
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Drawer Bottom CTA */}
              <div className={styles.drawerFooter}>
                <Link
                  href="/donasikan"
                  className={styles.drawerCtaButton}
                  onClick={closeDrawer}
                >
                  Donasikan Limbah Sekarang
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className={styles.drawerNote}>
                  Inisiatif gerakan sirkular gotong royong warga mandiri.
                </p>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
