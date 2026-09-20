import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { MemberLayout } from "@/components/member/MemberLayout";
import { ProfileForms } from "@/components/member/ProfileForms";
import styles from "@/components/member/MemberArea.module.css";

export const metadata: Metadata = {
  title: "Pengaturan Profil | KITA TUMBUH",
  description: "Kelola profil dan keamanan akun member KITA TUMBUH.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilPage() {
  const user = await requireUser("/profil");

  return (
    <MemberLayout activeKey="profil" user={user}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.greeting}>Pengaturan Akun</h1>
        <p className={styles.subgreeting}>
          Perbarui data kontak dan informasi keamanan akun Anda.
        </p>
      </div>

      <ProfileForms user={user} />
    </MemberLayout>
  );
}
