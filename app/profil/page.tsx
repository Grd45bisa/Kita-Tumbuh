import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { MemberLayout } from "@/components/member/MemberLayout";
import { ProfileForms } from "@/components/member/ProfileForms";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Pengaturan Profil | SEMAI",
  description: "Kelola profil dan keamanan akun member SEMAI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilPage() {
  const user = await requireUser("/profil");

  return (
    <MemberLayout activeKey="profil" user={user}>
      <header className={styles.welcomeSection}>
        <h1 className={styles.greeting}>Profil</h1>
        <p className={styles.subgreeting}>
          Kelola data kontak dan kata sandi akunmu.
        </p>
      </header>

      <ProfileForms user={user} />
    </MemberLayout>
  );
}
