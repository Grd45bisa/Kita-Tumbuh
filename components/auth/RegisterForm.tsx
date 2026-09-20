"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import styles from "./AuthForm.module.css";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [isSuccessDirect, setIsSuccessDirect] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedToTerms) {
      setErrorMessage("Silakan setujui persetujuan pemrosesan data untuk mendaftar.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);

      const res = await signUpAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal membuat akun.");
      } else {
        if (res.data?.requiresVerification) {
          setVerificationRequired(true);
        } else {
          setIsSuccessDirect(true);
        }
      }
    });
  };

  if (verificationRequired) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.brandBadge}>Verifikasi Email</div>
            <h1 className={styles.title}>Cek Email Kamu</h1>
            <p className={styles.subtitle}>
              Kami telah mengirimkan tautan verifikasi ke <strong>{email}</strong>.
              Silakan klik tautan di email tersebut untuk mengaktifkan akunmu, lalu masuk ke member area.
            </p>
          </div>
          <div className={styles.footer} style={{ borderTop: "none", marginTop: "var(--space-4)" }}>
            <Link href="/login" className={styles.footerLink}>
              Sudah verifikasi? Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccessDirect) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.brandBadge}>Pendaftaran Berhasil</div>
            <h1 className={styles.title}>Akun Berhasil Dibuat!</h1>
            <p className={styles.subtitle}>
              Selamat bergabung di gerakan sirkular KITA TUMBUH. Kamu sekarang dapat masuk ke akunmu.
            </p>
          </div>
          <Link href="/login">
            <Button variant="primary" size="lg" style={{ width: "100%" }}>
              Lanjut ke Halaman Masuk
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandBadge}>Daftar Baru</div>
          <h1 className={styles.title}>Buat Akun Member</h1>
          <p className={styles.subtitle}>
            Bergabung untuk melacak riwayat donasi limbah dan mengukur dampak nyata yang kamu tumbuhkan.
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            label="Nama Lengkap"
            placeholder="Contoh: Budi Prasetyo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            disabled={isPending}
          />

          <Input
            id="email"
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

          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Nomor WhatsApp / Telepon (Opsional)"
            placeholder="08123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            disabled={isPending}
            helperText="Memudahkan koordinasi penjemputan limbah jika memilih layanan pickup."
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Kata Sandi"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isPending}
          />

          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            label="Konfirmasi Kata Sandi"
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={isPending}
          />

          <div style={{ marginTop: "var(--space-2)" }}>
            <Checkbox
              id="consent"
              label="Saya menyetujui penggunaan data kontak untuk koordinasi penjemputan dan pencatatan riwayat donasi limbah."
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isPending}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            style={{ width: "100%", marginTop: "var(--space-3)" }}
          >
            Daftar Sekarang
          </Button>
        </form>

        <div className={styles.footer}>
          Sudah punya akun?{" "}
          <Link href="/login" className={styles.footerLink}>
            Masuk ke akun
          </Link>
        </div>
      </div>
    </div>
  );
}
