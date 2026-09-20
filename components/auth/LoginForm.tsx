"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./AuthForm.module.css";

/**
 * `redirect` reaches this component as a raw, attacker-controllable query
 * parameter (middleware sets it to the original path when bouncing an
 * unauthenticated visitor to /login, but a crafted link can set it to
 * anything). Found during the Phase 13 audit alongside the identical issue
 * in app/auth/confirm/route.ts: an unvalidated redirect target here is an
 * open-redirect vector — a link like `/login?redirect=https://evil.example`
 * would have the victim genuinely authenticate against the real site and
 * then get sent on to an attacker-controlled page. Only allow same-origin,
 * relative paths.
 */
function sanitizeRedirectPath(raw: string | null): string {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("\\") || raw.toLowerCase().includes(":")) return fallback;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectPath(searchParams.get("redirect"));

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
