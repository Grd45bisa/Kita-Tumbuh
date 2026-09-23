import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IntroLoader } from "@/components/layout/IntroLoader";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-google",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-google",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "SEMAI — Room to Grow | Inclusive Circular Smart Farming",
    template: "%s | SEMAI",
  },
  description:
    "Sebab setiap potensi butuh ruang untuk bermula. Di SEMAI, sisa organik dari rumah kembali ke siklus, kebun menjadi ruang belajar dan berkarya, dan setiap orang mendapat kesempatan mengambil bagian secara setara.",
  keywords: [
    "SEMAI",
    "Room to Grow",
    "donasi sampah terpilah",
    "minyak jelantah",
    "sampah organik",
    "kebun inklusif",
    "smart farming",
    "anak difabel berdaya",
    "ekonomi sirkular",
  ],
  authors: [{ name: "SEMAI" }],
  creator: "SEMAI",
  publisher: "SEMAI",
  icons: {
    icon: "/images/semai-logo.png",
    shortcut: "/images/semai-logo.png",
    apple: "/images/semai-logo.png",
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
    siteName: "SEMAI",
    title: "SEMAI — Room to Grow | Inclusive Circular Smart Farming",
    description:
      "Beri ruang. Lihat apa yang bisa tumbuh. Bersama SEMAI, sisa organik dan limbah rumah tangga membuka ruang belajar, karya, dan kemandirian nyata.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEMAI — Room to Grow | Inclusive Circular Smart Farming",
    description:
      "Beri ruang. Lihat apa yang bisa tumbuh. Bersama SEMAI, sisa organik dan limbah rumah tangga membuka ruang belajar, karya, dan kemandirian nyata.",
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
    <html lang="id" className={`${sans.variable} ${serif.variable}`}>
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
