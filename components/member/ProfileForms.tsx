"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AuthUser } from "@/types/user";
import { signOutAction, updateProfileAction, updatePasswordAction } from "@/lib/auth/actions";
import { hasPermission, normalizeRole, type Role } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import styles from "./ProfileForms.module.css";

interface ProfileFormsProps {
  user: AuthUser;
}

const ROLE_LABELS: Record<Role, string> = {
  PUBLIC: "Pengunjung",
  MEMBER: "Member",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OPERATOR: "Operator",
  FINANCE: "Tim Keuangan",
  SOCIAL_OFFICER: "Petugas Program Sosial",
};

export function ProfileForms({ user }: ProfileFormsProps) {
  const normalizedRole = normalizeRole(user.profile?.role);
  const accountRole: Role = normalizedRole === "PUBLIC" ? "MEMBER" : normalizedRole;
  const hasOperationalDashboard = hasPermission(accountRole, "dashboard", "read");
  // Profile info state
  const [fullName, setFullName] = useState(user.profile?.full_name || "");
  const [phone, setPhone] = useState(user.profile?.phone || "");
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    startProfileTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("phone", phone);

      const res = await updateProfileAction(formData);
      if (!res.success) {
        setProfileMessage({ type: "error", text: res.error || "Gagal memperbarui profil." });
      } else {
        setProfileMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      }
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    startPasswordTransition(async () => {
      const formData = new FormData();
      formData.append("password", newPassword);
      formData.append("confirm_password", confirmPassword);

      const res = await updatePasswordAction(formData);
      if (!res.success) {
        setPasswordMessage({ type: "error", text: res.error || "Gagal memperbarui kata sandi." });
      } else {
        setPasswordMessage({ type: "success", text: "Kata sandi berhasil diperbarui!" });
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className={styles.forms}>
      <section className={styles.accessSection} aria-labelledby="access-title">
        <div className={styles.accessIdentity}>
          <span className={styles.avatar} aria-hidden="true">
            {(user.profile?.full_name || user.email).charAt(0).toUpperCase()}
          </span>
          <div>
            <span className={styles.accessLabel}>Status akun</span>
            <h2 id="access-title">{ROLE_LABELS[accountRole]}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        {hasOperationalDashboard && (
          <Link href="/admin" className={styles.dashboardLink}>
            Buka dashboard operasional
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      <Card className={styles.formCard}>
        <h2 className={styles.cardTitle}>
          Data diri
        </h2>

        {profileMessage && (
          <div className={profileMessage.type === "success" ? styles.successMessage : styles.errorMessage}>
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className={styles.form}>
          <Input
            id="profile_email"
            name="email"
            type="email"
            label="Email"
            value={user.email}
            disabled
          />

          <Input
            id="profile_full_name"
            name="full_name"
            type="text"
            label="Nama lengkap"
            placeholder="Nama Anda"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isProfilePending}
            required
          />

          <Input
            id="profile_phone"
            name="phone"
            type="tel"
            label="Nomor WhatsApp"
            placeholder="08123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isProfilePending}
            helperText="Dipakai petugas untuk menghubungi saat penjemputan."
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isProfilePending}
            className={styles.submitButton}
          >
            Simpan profil
          </Button>
        </form>
      </Card>

      <Card className={styles.formCard}>
        <h2 className={styles.cardTitle}>
          Ubah kata sandi
        </h2>

        {passwordMessage && (
          <div className={passwordMessage.type === "success" ? styles.successMessage : styles.errorMessage}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className={styles.form}>
          <Input
            id="new_pwd"
            name="password"
            type="password"
            label="Kata sandi baru"
            placeholder="Minimal 8 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPasswordPending}
            required
            autoComplete="new-password"
          />

          <Input
            id="confirm_pwd"
            name="confirm_password"
            type="password"
            label="Ulangi kata sandi"
            placeholder="Ulangi kata sandi baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPasswordPending}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="secondary"
            size="md"
            isLoading={isPasswordPending}
            className={styles.submitButton}
          >
            Simpan kata sandi
          </Button>
        </form>
      </Card>

      <section className={styles.logoutSection} aria-labelledby="logout-title">
        <div>
          <h2 id="logout-title">Keluar dari akun</h2>
          <p>Akhiri sesi akun pada perangkat ini.</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className={styles.logoutButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </form>
      </section>

    </div>
  );
}
