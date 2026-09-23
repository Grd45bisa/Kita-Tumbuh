import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getAdminPrograms } from "@/lib/domain/admin/social-programs";
import { getAdminBeneficiaries } from "@/lib/domain/admin/beneficiaries";

export const metadata: Metadata = { title: "Program Sosial | Admin SEMAI", robots: { index: false, follow: false } };

export default async function AdminSocialHubPage() {
  const user = await requirePermission("social_programs", "read");
  const canBeneficiaries = hasPermission(user.profile?.role, "beneficiaries", "read");
  const [programsData, beneficiariesData] = await Promise.all([
    getAdminPrograms({ pageSize: 1 }),
    canBeneficiaries ? getAdminBeneficiaries({ pageSize: 1 }) : Promise.resolve(null),
  ]);
  const cards = [
    { href: "/admin/social/programs", title: `Program Sosial (${programsData.totalCount})`, description: "Kelola tujuan, status, target dana, dan visibilitas program." },
    ...(beneficiariesData ? [
      { href: "/admin/social/beneficiaries", title: `Penerima Manfaat (${beneficiariesData.totalCount})`, description: "Data privat penerima manfaat sesuai akses role." },
      { href: "/admin/social/distributions", title: "Distribusi", description: "Catat penyaluran dengan relasi penerima manfaat dan bukti." },
    ] : []),
  ];
  return <div>
    <div style={{ marginBottom: "var(--space-6)" }}>
      <h1 style={{ fontSize: "var(--font-size-heading-m)", color: "var(--color-text-primary)" }}>Program Sosial</h1>
      <p style={{ color: "var(--color-text-secondary)" }}>Modul yang terlihat mengikuti izin role aktif.</p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
      {cards.map((card) => <Link key={card.href} href={card.href} style={{ padding: "var(--space-5)", background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
        <h2 style={{ color: "var(--color-text-primary)", fontSize: "var(--font-size-title)" }}>{card.title} →</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)" }}>{card.description}</p>
      </Link>)}
    </div>
  </div>;
}
