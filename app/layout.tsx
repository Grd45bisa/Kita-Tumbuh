import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IntroLoader } from "@/components/layout/IntroLoader";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "KITA TUMBUH — Dari Limbah, Tumbuh Manfaat",
    template: "%s | KITA TUMBUH",
  },
  description:
    "Gerakan donasi sampah terpilah yang mengubah minyak jelantah, sampah organik, dan plastik menjadi karya bernilai untuk mendukung anak-anak difabel.",
  keywords: [
    "KITA TUMBUH",
    "donasi sampah",
    "donasi minyak jelantah",
    "anak difabel berdaya",
    "ekonomi sirkular",
    "pengolahan sampah organik",
    "Kampung Setara Smart Farming",
  ],
  authors: [{ name: "KITA TUMBUH" }],
  creator: "KITA TUMBUH",
  publisher: "KITA TUMBUH",
  icons: {
    icon: "/images/Logo.png",
    shortcut: "/images/Logo.png",
    apple: "/images/Logo.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "KITA TUMBUH",
    title: "KITA TUMBUH — Dari Limbah, Tumbuh Manfaat",
    description:
      "Ubah sampah terpilah dari rumah menjadi karya bernilai dan ruang tumbuh bagi anak-anak difabel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KITA TUMBUH — Dari Limbah, Tumbuh Manfaat",
    description:
      "Ubah sampah terpilah dari rumah menjadi karya bernilai dan ruang tumbuh bagi anak-anak difabel.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <IntroLoader />
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Header />
          <main id="main-content" style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
