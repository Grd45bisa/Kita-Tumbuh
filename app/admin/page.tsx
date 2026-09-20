import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission, type AdminModule } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/admin/AdminDashboard.module.css";

type Card = { module: AdminModule; label: string; value: number; hint: string; href: string };

export default async function AdminOverviewPage() {
  const user = await requirePermission("dashboard", "read", "/admin");
  const role = user.profile?.role;
  const supabase = await createClient();
  const can = (module: AdminModule) => hasPermission(role, module, "read");

  const emptyCount = Promise.resolve({ count: 0 });
  const results = await Promise.all([
    can("donations") ? supabase.from("donations").select("id", { count: "exact", head: true }).in("status", ["SUBMITTED", "COLLECTED"]) : emptyCount,
    can("waste_inventory") ? supabase.from("waste_lots").select("id", { count: "exact", head: true }).gt("current_quantity", 0) : emptyCount,
    can("production") ? supabase.from("production_batches").select("id", { count: "exact", head: true }).in("status", ["PLANNED", "IN_PROGRESS"]) : emptyCount,
    can("product_catalog") ? supabase.from("products").select("id", { count: "exact", head: true }).gt("stock_quantity", 0) : emptyCount,
    can("orders_sales") ? supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["PENDING_PAYMENT", "PAID", "PROCESSING"]) : emptyCount,
    can("finance") ? supabase.from("social_allocations").select("id", { count: "exact", head: true }).eq("approval_status", "APPROVED") : emptyCount,
    can("social_programs") ? supabase.from("social_programs").select("id", { count: "exact", head: true }).eq("public_status", true) : emptyCount,
  ]);
  const [donations, wasteLots, batches, products, orders, allocations, programs] = results.map((result) => result.count ?? 0);

  const allCards: Card[] = [
    { module: "donations", label: "Donasi perlu diproses", value: donations, hint: "Menunggu penerimaan atau verifikasi", href: "/admin/donations" },
    { module: "waste_inventory", label: "Lot Limbah Tersedia", value: wasteLots, hint: "Lot dengan saldo fisik", href: "/admin/inventory" },
    { module: "production", label: "Produksi Aktif", value: batches, hint: "Batch direncanakan atau berjalan", href: "/admin/production" },
    { module: "product_catalog", label: "Produk Tersedia", value: products, hint: "Produk dengan stok positif", href: "/admin/products" },
    { module: "orders_sales", label: "Pesanan Aktif", value: orders, hint: "Menunggu bayar hingga diproses", href: "/admin/orders" },
    { module: "finance", label: "Alokasi Disetujui", value: allocations, hint: "Catatan alokasi dana sosial", href: "/admin/finance" },
    { module: "social_programs", label: "Program Publik", value: programs, hint: "Program yang sedang dipublikasikan", href: "/admin/social/programs" },
  ];
  const cards = allCards.filter((card) => can(card.module));

  return <div>
    <div className={styles.header}>
      <p className={styles.eyebrow}>Ringkasan {role ?? "pengguna"}</p>
      <h1 className={styles.title}>Dashboard Admin</h1>
      <p className={styles.subtitle}>Pilih data yang perlu kamu tangani hari ini.</p>
    </div>
    <div className={styles.statsGrid}>
      {cards.map((card) => <Link className={styles.actionCard} href={card.href} key={card.module}>
        <span className={styles.statLabel}>{card.label}</span>
        <strong className={styles.statValue}>{card.value}</strong>
        <span className={styles.statHint}>{card.hint}</span>
        <span className={styles.cardArrow} aria-hidden="true">→</span>
      </Link>)}
    </div>
    {cards.length === 0 && <p className={styles.subtitle}>Belum ada modul operasional yang dapat ditampilkan untuk role ini.</p>}
  </div>;
}
