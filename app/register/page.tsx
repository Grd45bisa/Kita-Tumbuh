import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Member | KITA TUMBUH",
  description: "Daftar akun member KITA TUMBUH untuk mencatat donasi limbah dan memantau dampak lingkungan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
