import React from "react";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "@/components/admin/AdminLayout.module.css";

export const metadata: Metadata = {
  title: "Admin Operasional | SEMAI",
  description: "Portal operasional SEMAI untuk pengelolaan limbah, inventaris, dan produksi.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePermission("dashboard", "read", "/admin");

  return (
    <div className={styles.layoutShell}>
      <AdminNav user={user} />
      <main className={styles.mainContent}>
        <div className={styles.contentInner}>{children}</div>
      </main>
    </div>
  );
}
