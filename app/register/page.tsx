import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Member | SEMAI",
  description: "Daftar akun member SEMAI untuk mencatat donasi limbah dan memantau dampak lingkungan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
