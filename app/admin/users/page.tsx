import React from "react";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getUsersList } from "@/lib/domain/admin/users";
import { UserManagementTable } from "@/components/admin/UserManagementTable";

export const metadata: Metadata = {
  title: "Manajemen Akun & Role — Admin SEMAI",
  description: "Kelola pengguna, administrator, dan hak akses peran operasional SEMAI.",
};

export default async function AdminUsersPage() {
  const currentUser = await requirePermission("user_roles", "read");
  const canWrite = hasPermission(currentUser.profile?.role, "user_roles", "write");

  const users = await getUsersList();

  return (
    <div>
      <UserManagementTable
        users={users}
        currentUserId={currentUser.id}
        canWrite={canWrite}
      />
    </div>
  );
}
