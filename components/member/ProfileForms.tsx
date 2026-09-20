"use client";

import { useState, useTransition } from "react";
import type { AuthUser } from "@/types/user";
import { updateProfileAction, updatePasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface ProfileFormsProps {
  user: AuthUser;
}

export function ProfileForms({ user }: ProfileFormsProps) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "600px" }}>
      {/* Profile Form */}
      <Card>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)", color: "var(--color-ink)" }}>
          Informasi Profil
        </h2>

        {profileMessage && (
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              marginBottom: "var(--space-4)",
              background: profileMessage.type === "success" ? "var(--color-primary-subtle)" : "var(--color-destructive-subtle, #fef2f2)",
              color: profileMessage.type === "success" ? "var(--color-primary-dark, #166534)" : "var(--color-destructive, #b91c1c)",
              border: `1px solid ${profileMessage.type === "success" ? "var(--color-primary-border, #bbf7d0)" : "var(--color-destructive-border, #fecaca)"}`,
            }}
          >
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input
            id="profile_email"
            name="email"
            type="email"
            label="Alamat Email"
            value={user.email}
            disabled
            helperText="Email akun dikelola oleh autentikasi sistem."
          />

          <Input
            id="profile_full_name"
            name="full_name"
            type="text"
            label="Nama Lengkap"
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
            label="Nomor Telepon / WhatsApp"
            placeholder="08123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isProfilePending}
            helperText="Digunakan petugas penjemputan untuk konfirmasi koordinasi."
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isProfilePending}
            style={{ alignSelf: "flex-start" }}
          >
            Simpan Perubahan
          </Button>
        </form>
      </Card>

      {/* Password Change Form */}
      <Card>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)", color: "var(--color-ink)" }}>
          Keamanan & Kata Sandi
        </h2>

        {passwordMessage && (
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              marginBottom: "var(--space-4)",
              background: passwordMessage.type === "success" ? "var(--color-primary-subtle)" : "var(--color-destructive-subtle, #fef2f2)",
              color: passwordMessage.type === "success" ? "var(--color-primary-dark, #166534)" : "var(--color-destructive, #b91c1c)",
              border: `1px solid ${passwordMessage.type === "success" ? "var(--color-primary-border, #bbf7d0)" : "var(--color-destructive-border, #fecaca)"}`,
            }}
          >
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input
            id="new_pwd"
            name="password"
            type="password"
            label="Kata Sandi Baru"
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
            label="Konfirmasi Kata Sandi Baru"
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
            style={{ alignSelf: "flex-start" }}
          >
            Perbarui Kata Sandi
          </Button>
        </form>
      </Card>

      {/* Note about Saved Pickup Addresses (P1-405 MVP scope postponement) */}
      <Card style={{ background: "var(--color-canvas)" }}>
        <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-ink)", marginBottom: "var(--space-1)" }}>
          Daftar Alamat Penjemputan Tersimpan
        </h3>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-ink-muted)", lineHeight: 1.5 }}>
          Fitur multi-alamat tersimpan untuk penjemputan limbah direncanakan pada pembaruan Phase 5.
          Saat ini, alamat penjemputan dimasukkan langsung pada formulir penjemputan di wizard donasi.
        </p>
      </Card>
    </div>
  );
}
