import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/admin/AdminDashboard.module.css";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // 1. Count donations pending verification
  const { count: pendingVerificationCount } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .in("status", ["SUBMITTED", "COLLECTED"]);

  // 2. Count active pickups
  const { count: activePickupCount } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("method", "PICKUP")
    .in("status", ["SUBMITTED", "SCHEDULED"]);

  // 3. Count active waste types
  const { count: activeWasteTypesCount } = await supabase
    .from("waste_types")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  // 4. Count total donations recorded
  const { count: totalDonationsCount } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel Operasional Utama</h1>
        <p className={styles.subtitle}>
          Kelola alur penerimaan limbah, proses verifikasi, pencatatan inventaris, dan siklus produksi Kampung Smart Farming.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Perlu Verifikasi</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.statIcon}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.statValue}>{pendingVerificationCount ?? 0}</div>
          <div className={styles.statHint}>Donasi masuk status SUBMITTED / COLLECTED</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Pickup Aktif</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.statIcon}>
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className={styles.statValue}>{activePickupCount ?? 0}</div>
          <div className={styles.statHint}>Jadwal penjemputan belum selesai</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Jenis Limbah Aktif</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.statIcon}>
              <path d="M4 7h16" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
            </svg>
          </div>
          <div className={styles.statValue}>{activeWasteTypesCount ?? 0}</div>
          <div className={styles.statHint}>Kategori limbah yang dapat didonasikan</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Seluruh Donasi</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.statIcon}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className={styles.statValue}>{totalDonationsCount ?? 0}</div>
          <div className={styles.statHint}>Akumulasi transaksi donasi di sistem</div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
        Akses Cepat Modul Operasional
      </h2>

      <div className={styles.quickActionsGrid}>
        <Link href="/admin/donations" className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Antrean Donasi & Verifikasi</h3>
          <p className={styles.actionDesc}>
            Periksa kiriman limbah, input hasil penimbangan riil (verified quantity), dan perbarui status penjemputan/pengantaran.
          </p>
          <span className={styles.actionLinkText}>Buka Antrean Donasi →</span>
        </Link>

        <Link href="/admin/waste-types" className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Master Data Jenis Limbah</h3>
          <p className={styles.actionDesc}>
            Atur jenis limbah yang diterima, satuan takaran, batas kuantitas minimum/maksimum, dan panduan kondisi diterima/ditolak.
          </p>
          <span className={styles.actionLinkText}>Kelola Master Limbah →</span>
        </Link>

        <Link href="/admin/inventory" className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Inventaris & Gudang Limbah</h3>
          <p className={styles.actionDesc}>
            Pantau saldo stok fisik per kategori limbah, lacak nomor lot bahan baku, dan lakukan penyesuaian stok dengan audit trail.
          </p>
          <span className={styles.actionLinkText}>Lihat Inventaris →</span>
        </Link>

        <Link href="/admin/production" className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Batch Pengolahan & Produksi</h3>
          <p className={styles.actionDesc}>
            Catat alur pengolahan limbah menjadi produk bernilai (sabun/lilin/pupuk) dengan pelacakan bahan baku dan catatan susut.
          </p>
          <span className={styles.actionLinkText}>Kelola Batch Produksi →</span>
        </Link>

        <Link href="/admin/products" className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Katalog Produk Sirkular</h3>
          <p className={styles.actionDesc}>
            Kelola data produk hasil hilirisasi, penetapan harga (Rupiah), nomor SKU, dan pengaturan visibilitas ke halaman publik.
          </p>
          <span className={styles.actionLinkText}>Kelola Produk →</span>
        </Link>

        <Link href="/admin/orders" className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Pesanan & Penjualan Produk</h3>
          <p className={styles.actionDesc}>
            Pantau pesanan masuk dari pembeli produk, verifikasi bukti transfer pembayaran, dan update status pengiriman pesanan.
          </p>
          <span className={styles.actionLinkText}>Kelola Pesanan →</span>
        </Link>
      </div>
    </div>
  );
}
