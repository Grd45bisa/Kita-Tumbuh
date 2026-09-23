"use client";

import React, { useState, useTransition } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createUserAction,
  updateUserRoleAction,
  deleteUserAction,
  type ManagedUser,
} from "@/lib/domain/admin/users";
import { ALLOWED_ROLES, type ManagedRole } from "@/lib/validation/admin-user-schema";
import styles from "./UserManagementTable.module.css";

interface UserManagementTableProps {
  users: ManagedUser[];
  currentUserId: string;
  canWrite: boolean;
}

interface RoleConfig {
  label: string;
  description: string;
  badgeVariant: BadgeVariant;
}

const ROLE_CONFIGS: Record<ManagedRole, RoleConfig> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    description: "Akses penuh tanpa batasan ke seluruh sistem, modul keuangan, audit log, dan hak manajemen akun.",
    badgeVariant: "success",
  },
  ADMIN: {
    label: "Admin Operasional",
    description: "Mengelola donasi, gudang limbah, siklus batch produksi, katalog produk, dan program sosial.",
    badgeVariant: "brand",
  },
  OPERATOR: {
    label: "Operator Lapangan",
    description: "Fokus operasional: verifikasi intake donasi, timbangan fisik limbah, dan pemrosesan batch produksi.",
    badgeVariant: "info",
  },
  FINANCE: {
    label: "Finance / Keuangan",
    description: "Verifikasi pembayaran pesanan produk sirkular, pencatatan biaya operasional, dan alokasi dana sosial.",
    badgeVariant: "info",
  },
  SOCIAL_OFFICER: {
    label: "Social Officer",
    description: "Mengelola program sosial kemandirian, verifikasi data penerima manfaat, dan penyaluran bantuan.",
    badgeVariant: "info",
  },
  MEMBER: {
    label: "Member / Donatur",
    description: "Akses standar donatur masyarakat (hanya dapat melihat dashboard donasi dan riwayat pribadi).",
    badgeVariant: "neutral",
  },
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9999px",
              backgroundColor: item.role === "SUPER_ADMIN" ? "var(--color-green-700)" : "var(--color-surface-sunken)",
              color: item.role === "SUPER_ADMIN" ? "#ffffff" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            {item.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ color: "var(--color-text-primary)", display: "block", fontSize: "14px" }}>
              {item.fullName}
              {item.id === currentUserId && (
                <span
                  style={{
                    fontSize: "11px",
                    marginLeft: "6px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-green-100)",
                    color: "var(--color-brand-primary)",
                    fontWeight: 600,
                  }}
                >
                  Anda
                </span>
              )}
            </strong>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role / Hak Akses",
      width: "170px",
      render: (item) => {
        const config = ROLE_CONFIGS[item.role as ManagedRole] || {
          label: item.role,
          badgeVariant: "neutral" as BadgeVariant,
        };
        return (
          <Badge variant={config.badgeVariant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "phone",
      header: "Telepon",
      render: (item) => <span style={{ fontSize: "13px" }}>{item.phone || "—"}</span>,
    },
    {
      key: "email_status",
      header: "Status Akun",
      width: "150px",
      render: (item) =>
        item.emailConfirmedAt ? (
          <Badge variant="success">Aktif Terverifikasi</Badge>
        ) : (
          <Badge variant="warning">Pending Aktivasi</Badge>
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
          <p>Kelola hak akses wewenang operasional dan manajemen pengguna SEMAI.</p>
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

      {/* ====================================================================
          MODAL 1: UBAH ROLE PENGGUNA (PENAMPILAN BARU & MODERN)
          ==================================================================== */}
      {editUser && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={styles.headerIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalHeaderTitle}>Ubah Role Pengguna</h3>
                  <p className={styles.modalHeaderSubtitle}>Sesuaikan tingkat hak akses dan wewenang akun ini.</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setEditUser(null)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRoleSubmit} className={styles.modalForm}>
              <div className={styles.modalBody}>
                {editError && <div className={styles.errorMessage}>{editError}</div>}

                {/* Target User Info Card */}
                <div className={styles.targetUserCard}>
                  <div className={styles.userCardProfile}>
                    <div className={styles.avatarInitial}>
                      {editUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.targetUserDetails}>
                      <span className={styles.targetUserName}>{editUser.fullName}</span>
                      <span className={styles.targetUserEmail}>{editUser.email}</span>
                    </div>
                  </div>
                  <div className={styles.currentRoleBadge}>
                    <span className={styles.currentRoleLabel}>Role Saat Ini</span>
                    <Badge variant={ROLE_CONFIGS[editUser.role as ManagedRole]?.badgeVariant || "neutral"}>
                      {ROLE_CONFIGS[editUser.role as ManagedRole]?.label || editUser.role}
                    </Badge>
                  </div>
                </div>

                {/* Role Options Radio Cards */}
                <div>
                  <div className={styles.roleSectionTitle}>Pilih Tingkat Hak Akses Baru:</div>
                  <div className={styles.roleGrid}>
                    {ALLOWED_ROLES.map((roleKey) => {
                      const cfg = ROLE_CONFIGS[roleKey];
                      const isSelected = selectedRole === roleKey;
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          className={`${styles.roleCard} ${isSelected ? styles.roleCardActive : ""}`}
                          onClick={() => setSelectedRole(roleKey)}
                        >
                          <div className={styles.roleRadio}>
                            {isSelected && <div className={styles.roleRadioInner} />}
                          </div>
                          <div className={styles.roleInfo}>
                            <div className={styles.roleTitleRow}>
                              <span className={styles.roleName}>{cfg.label}</span>
                              <Badge variant={cfg.badgeVariant}>
                                {roleKey}
                              </Badge>
                            </div>
                            <span className={styles.roleDesc}>{cfg.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                  {isPending ? "Menyimpan Perubahan..." : "Simpan Perubahan Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: TAMBAH AKUN BARU
          ==================================================================== */}
      {isCreateOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={styles.headerIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalHeaderTitle}>Tambah Akun Baru</h3>
                  <p className={styles.modalHeaderSubtitle}>Daftarkan admin atau personil operasional baru.</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsCreateOpen(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.modalForm}>
              <div className={styles.modalBody}>
                <div className={styles.instantBadge}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div>
                    <strong>Instan & Tanpa Konfirmasi Email</strong>
                    <div>Akun yang dibuat akan langsung aktif dan terverifikasi untuk login segera dengan password awal yang Anda tentukan.</div>
                  </div>
                </div>

                {createError && <div className={styles.errorMessage}>{createError}</div>}

                {/* Input Grid 2 Kolom */}
                <div className={styles.formGrid2Col}>
                  <Input
                    label="Nama Lengkap"
                    required
                    placeholder="misal: Budi Santoso"
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
                </div>

                <div className={styles.formGrid2Col}>
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
                </div>

                {/* Role selection radio list */}
                <div>
                  <div className={styles.roleSectionTitle}>Pilih Role / Hak Akses:</div>
                  <div className={styles.roleGrid}>
                    {ALLOWED_ROLES.map((roleKey) => {
                      const cfg = ROLE_CONFIGS[roleKey];
                      const isSelected = createForm.role === roleKey;
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          className={`${styles.roleCard} ${isSelected ? styles.roleCardActive : ""}`}
                          onClick={() => setCreateForm({ ...createForm, role: roleKey })}
                        >
                          <div className={styles.roleRadio}>
                            {isSelected && <div className={styles.roleRadioInner} />}
                          </div>
                          <div className={styles.roleInfo}>
                            <div className={styles.roleTitleRow}>
                              <span className={styles.roleName}>{cfg.label}</span>
                              <Badge variant={cfg.badgeVariant}>
                                {roleKey}
                              </Badge>
                            </div>
                            <span className={styles.roleDesc}>{cfg.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                  {isPending ? "Mendaftarkan Akun..." : "Buat Akun Sekarang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: KONFIRMASI HAPUS PENGGUNA
          ==================================================================== */}
      {deleteTarget && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.modalContent} ${styles.modalContentConfirm}`}>
            <div className={styles.modalHeader}>
              <div className={styles.headerTitleGroup}>
                <div className={`${styles.headerIcon} ${styles.headerIconDanger}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className={styles.modalHeaderTitle} style={{ color: "var(--color-danger-fg)" }}>
                    Hapus Akun Pengguna
                  </h3>
                  <p className={styles.modalHeaderSubtitle}>Konfirmasi tindakan penghapusan akun dari sistem.</p>
                </div>
              </div>
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

              <div className={styles.deleteWarningBox}>
                <div className={styles.deleteWarningText}>
                  Tindakan ini tidak dapat dibatalkan!
                </div>
                <div className={styles.deleteWarningSubtext}>
                  Akun atas nama <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email}) akan dihapus secara permanen dari server autentikasi dan database.
                </div>
              </div>
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
                {isPending ? "Menghapus..." : "Ya, Hapus Akun Permanen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
