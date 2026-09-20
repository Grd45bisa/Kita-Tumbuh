"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./AuthForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await signInAction(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal masuk ke akun.");
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandBadge}>Member Area</div>
          <h1 className={styles.title}>Masuk ke Akun</h1>
          <p className={styles.subtitle}>
            Akses riwayat donasi, pantau status limbah, dan lihat ringkasan kontribusi kamu.
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
            id="password"
            name="password"
            type="password"
            label="Kata Sandi"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isPending}
          />

          <div className={styles.forgotRow}>
            <Link href="/reset-password" className={styles.forgotLink}>
              Lupa kata sandi?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            style={{ width: "100%", marginTop: "var(--space-2)" }}
          >
            Masuk
          </Button>
        </form>

        <div className={styles.footer}>
          Belum punya akun?{" "}
          <Link href="/register" className={styles.footerLink}>
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
