"use client";

import React, { useState, useTransition } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  createUserAction,
  updateUserRoleAction,
  deleteUserAction,
  type ManagedUser,
} from "@/lib/domain/admin/users";
import { ALLOWED_ROLES, type ManagedRole } from "@/lib/validation/admin-user-schema";
import type { Role } from "@/lib/auth/permissions";
import styles from "./UserManagementTable.module.css";

interface UserManagementTableProps {
  users: ManagedUser[];
  currentUserId: string;
  canWrite: boolean;
}

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OPERATOR: "Operator",
  FINANCE: "Finance",
  SOCIAL_OFFICER: "Social Officer",
  MEMBER: "Member",
  PUBLIC: "Public",
};

export function UserManagementTable({
  users,
  currentUserId,
  canWrite,
}: UserManagementTableProps) {
  const [isPending, startTransition] = useTransition();

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    fullName: string;
    email: string;
    password: string;
    phone: string;
    role: ManagedRole;
  }>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "ADMIN",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Role Modal State
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<ManagedRole>("MEMBER");
  const [editError, setEditError] = useState<string | null>(null);

  // Delete User Modal State
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    startTransition(async () => {
      try {
        const res = await createUserAction(createForm);
        if (!res.success) {
          setCreateError(res.error || "Gagal membuat pengguna.");
          return;
        }
        setIsCreateOpen(false);
        setCreateForm({
          fullName: "",
          email: "",
          password: "",
          phone: "",
          role: "ADMIN",
        });
      } catch (err: unknown) {
        setCreateError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    });
  };

  const handleUpdateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError(null);

    startTransition(async () => {
      try {
        const res = await updateUserRoleAction({
          targetUserId: editUser.id,
          role: selectedRole,
        });
        if (!res.success) {
          setEditError(res.error || "Gagal mengubah role pengguna.");
          return;
        }
        setEditUser(null);
      } catch (err: unknown) {
        setEditError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    startTransition(async () => {
      try {
        const res = await deleteUserAction({ targetUserId: deleteTarget.id });
        if (!res.success) {
          setDeleteError(res.error || "Gagal menghapus pengguna.");
          return;
        }
        setDeleteTarget(null);
      } catch (err: unknown) {
        setDeleteError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    });
  };

  const columns: Column<ManagedUser>[] = [
    {
      key: "user",
      header: "Nama & Email",
      render: (item) => (
        <div>
          <strong style={{ color: "var(--color-text-primary)", display: "block" }}>
            {item.fullName}
            {item.id === currentUserId && (
              <span style={{ fontSize: "11px", marginLeft: "6px", color: "var(--color-brand-primary)" }}>
                (Anda)
              </span>
            )}
          </strong>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {item.email}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role / Hak Akses",
      width: "160px",
      render: (item) => {
        let variant: BadgeVariant = "neutral";
        if (item.role === "SUPER_ADMIN") variant = "success";
        else if (item.role === "ADMIN") variant = "brand";
        else if (["OPERATOR", "FINANCE", "SOCIAL_OFFICER"].includes(item.role)) variant = "info";

        return (
          <Badge variant={variant}>
            {ROLE_LABELS[item.role] || item.role}
          </Badge>
        );
      },
    },
    {
      key: "phone",
      header: "Telepon",
      render: (item) => <span>{item.phone || "—"}</span>,
    },
    {
      key: "email_status",
      header: "Email Status",
      width: "140px",
      render: (item) =>
        item.emailConfirmedAt ? (
          <Badge variant="success">Aktif Terverifikasi</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        ),
    },
    {
      key: "created_at",
      header: "Bergabung",
      render: (item) => (
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          {new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      width: "180px",
      render: (item) => {
        if (!canWrite) return <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>Read-only</span>;

        return (
          <div className={styles.actionButtons}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditUser(item);
                setSelectedRole(item.role as ManagedRole);
                setEditError(null);
              }}
            >
              Ubah Role
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={item.id === currentUserId || isPending}
              title={item.id === currentUserId ? "Tidak dapat menghapus akun sendiri" : "Hapus Akun"}
              onClick={() => {
                setDeleteTarget(item);
                setDeleteError(null);
              }}
            >
              Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h2>Daftar Akun Pengguna & Admin</h2>
          <p>Kelola hak akses role operasional dan pengguna Kampung Smart Farming.</p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Tambah Akun Baru
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        emptyMessage="Belum ada akun terdaftar."
      />

      {/* Modal Buat Akun Baru Langsung Tanpa Konfirmasi Email */}
      {isCreateOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Tambah Akun Admin / User Baru</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsCreateOpen(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.instantBadge}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Akun ini akan langsung <strong>aktif dan terverifikasi</strong> tanpa memerlukan konfirmasi tautan email.</span>
                </div>

                {createError && <div className={styles.errorMessage}>{createError}</div>}

                <Input
                  label="Nama Lengkap"
                  required
                  placeholder="misal: Budi Pratama"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  required
                  placeholder="admin@kitatumbuh.id"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />

                <Input
                  label="Password Awal"
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />

                <Input
                  label="Nomor WhatsApp / Telepon (Opsional)"
                  type="tel"
                  placeholder="08123456789"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />

                <Select
                  label="Role / Hak Akses"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as ManagedRole })}
                  options={ALLOWED_ROLES.map((r) => ({
                    value: r,
                    label: `${ROLE_LABELS[r]} ${r === "SUPER_ADMIN" ? "(Akses Penuh)" : ""}`,
                  }))}
                />
              </div>

              <div className={styles.modalFooter}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Buat Akun Sekarang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Role */}
      {editUser && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Ubah Role Pengguna</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setEditUser(null)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateRoleSubmit}>
              <div className={styles.modalBody}>
                {editError && <div className={styles.errorMessage}>{editError}</div>}

                <div>
                  <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Target Pengguna:</p>
                  <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-text-primary)" }}>
                    {editUser.fullName} ({editUser.email})
                  </p>
                </div>

                <Select
                  label="Pilih Role Baru"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as ManagedRole)}
                  options={ALLOWED_ROLES.map((r) => ({
                    value: r,
                    label: ROLE_LABELS[r],
                  }))}
                />
              </div>

              <div className={styles.modalFooter}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditUser(null)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Perubahan Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengguna */}
      {deleteTarget && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 style={{ color: "var(--color-status-error)" }}>Konfirmasi Hapus Akun</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setDeleteTarget(null)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {deleteError && <div className={styles.errorMessage}>{deleteError}</div>}
              <p className={styles.deleteWarning}>
                Apakah Anda yakin ingin menghapus akun <strong>{deleteTarget.fullName}</strong> (
                {deleteTarget.email})?
              </p>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                Tindakan ini permanen dan akan menghapus akun dari sistem autentikasi dan profil pengguna.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteSubmit}
                disabled={isPending}
              >
                {isPending ? "Menghapus..." : "Hapus Akun Permanen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
