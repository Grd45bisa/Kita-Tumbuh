import type { Metadata } from "next";
import "@/styles/globals.css";
import { SkipLink } from "@/components/ui/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "KITA TUMBUH — Kampung Smart Farming | Dari Limbah, Tumbuh Manfaat",
    template: "%s | KITA TUMBUH — Kampung Smart Farming",
  },
  description:
    "KITA TUMBUH — Platform ekonomi sirkular sosial Kampung Smart Farming. Mengubah limbah menjadi karya bernilai di tangan yang spesial dan menghadirkan dampak sosial nyata bagi masyarakat. Sampah kalian sangat berarti bagi kami.",
  keywords: [
    "KITA TUMBUH",
    "Kampung Smart Farming",
    "ekonomi sirkular",
    "donasi limbah",
    "minyak jelantah",
    "dampak sosial",
    "smart farming",
    "pemberdayaan masyarakat",
  ],
  authors: [{ name: "KITA TUMBUH — Kampung Smart Farming" }],
  creator: "KITA TUMBUH — Kampung Smart Farming",
  publisher: "KITA TUMBUH — Kampung Smart Farming",
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
    siteName: "KITA TUMBUH — Kampung Smart Farming",
    title: "KITA TUMBUH — Kampung Smart Farming | Dari Limbah, Tumbuh Manfaat",
    description:
      "KITA TUMBUH — Platform ekonomi sirkular sosial Kampung Smart Farming. Mengubah limbah menjadi karya bernilai di tangan yang spesial dan menghadirkan dampak sosial nyata bagi masyarakat. Sampah kalian sangat berarti bagi kami.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KITA TUMBUH — Kampung Smart Farming | Dari Limbah, Tumbuh Manfaat",
    description:
      "KITA TUMBUH — Platform ekonomi sirkular sosial Kampung Smart Farming. Mengubah limbah menjadi produk bernilai dan dampak sosial nyata.",
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
        <SkipLink targetId="main-content" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Header />
          <main id="main-content" style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
