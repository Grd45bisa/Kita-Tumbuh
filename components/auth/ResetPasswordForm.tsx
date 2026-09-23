"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction, updatePasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./AuthForm.module.css";

interface ResetPasswordFormProps {
  isRecoverySession?: boolean;
}

export function ResetPasswordForm({ isRecoverySession = false }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);

      const res = await requestPasswordResetAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengirim tautan reset.");
      } else {
        setSubmitted(true);
      }
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", newPassword);
      formData.append("confirm_password", confirmPassword);

      const res = await updatePasswordAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui kata sandi.");
      } else {
        setPasswordUpdated(true);
      }
    });
  };

  if (passwordUpdated) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.brandBadge}>Kata Sandi Diperbarui</div>
            <h1 className={styles.title}>Sandi Berhasil Diubah</h1>
            <p className={styles.subtitle}>
              Kata sandi akunmu telah berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.
            </p>
          </div>
          <Link href="/login">
            <Button variant="primary" size="lg" style={{ width: "100%" }}>
              Masuk Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isRecoverySession) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.brandBadge}>Atur Sandi Baru</div>
            <h1 className={styles.title}>Buat Kata Sandi Baru</h1>
            <p className={styles.subtitle}>
              Masukkan kata sandi baru yang aman untuk akun SEMAI kamu.
            </p>
          </div>

          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className={styles.form} noValidate>
            <Input
              id="new_password"
              name="password"
              type="password"
              label="Kata Sandi Baru"
              placeholder="Minimal 8 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isPending}
            />

            <Input
              id="confirm_new_password"
              name="confirm_password"
              type="password"
              label="Konfirmasi Kata Sandi Baru"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isPending}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isPending}
              style={{ width: "100%", marginTop: "var(--space-2)" }}
            >
              Simpan Kata Sandi
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.brandBadge}>Tautan Terkirim</div>
            <h1 className={styles.title}>Periksa Kotak Masuk</h1>
            <p className={styles.subtitle}>
              Jika email <strong>{email}</strong> terdaftar di sistem kami, kamu akan menerima tautan untuk mereset kata sandi.
            </p>
          </div>
          <div className={styles.footer} style={{ borderTop: "none", marginTop: "var(--space-4)" }}>
            <Link href="/login" className={styles.footerLink}>
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandBadge}>Lupa Sandi</div>
          <h1 className={styles.title}>Atur Ulang Kata Sandi</h1>
          <p className={styles.subtitle}>
            Masukkan email terdaftar kamu. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRequestReset} className={styles.form} noValidate>
          <Input
            id="reset_email"
            name="email"
            type="email"
            label="Alamat Email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            style={{ width: "100%", marginTop: "var(--space-2)" }}
          >
            Kirim Tautan Reset
          </Button>
        </form>

        <div className={styles.footer}>
          Ingat kata sandi kamu?{" "}
          <Link href="/login" className={styles.footerLink}>
            Masuk kembali
          </Link>
        </div>
      </div>
    </div>
  );
}
