import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Masuk | KITA TUMBUH",
  description: "Masuk ke member area KITA TUMBUH untuk mengelola riwayat donasi dan kontribusi Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner size="lg" label="Memuat form login..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
