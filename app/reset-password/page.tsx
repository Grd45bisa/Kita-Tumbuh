import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi | SEMAI",
  description: "Reset kata sandi akun SEMAI Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ type?: string; code?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const isRecovery = params.type === "recovery" || Boolean(params.code);

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner size="lg" label="Memuat formulir..." />
        </div>
      }
    >
      <ResetPasswordForm isRecoverySession={isRecovery} />
    </Suspense>
  );
}
