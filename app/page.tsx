import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";
import { heroContent } from "@/lib/content/hero";
import { fourRoomsContent } from "@/lib/content/four-rooms";
import { jejakTumbuhContent } from "@/lib/content/jejak-tumbuh";
import { acceptedWastePreview as wasteTypes } from "@/lib/content/accepted-waste";
import { homepageJourney as journey } from "@/lib/content/how-it-works";
import { homepageGallery as galleryItems } from "@/lib/content/gallery";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "SEMAI — Room to Grow | Inclusive Circular Smart Farming",
  description:
    "Sebab setiap potensi butuh ruang untuk bermula. Ubah sisa organik dan limbah rumah tangga menjadi nutrisi kebun, ruang belajar, dan karya nyata anak-anak difabel.",
  alternates: {
    canonical: env.siteUrl,
  },
  openGraph: {
    title: "SEMAI — Room to Grow",
    description:
      "Beri ruang. Lihat apa yang bisa tumbuh. Bersama SEMAI, sisa organik dan limbah rumah tangga membuka ruang belajar, karya, dan kemandirian nyata.",
    url: env.siteUrl,
    type: "website",
  },
};

function WasteIcon({ name }: { name: string }) {
  if (name === "drop") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5C20 13 12 21 12 30a12 12 0 0 0 24 0C36 21 28 13 24 5Z" />
        <path d="M18.5 31.5c.8 3 2.8 4.7 5.8 5.2" />
      </svg>
    );
  }

  if (name === "leaf") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M39 8C21 8 10 16 10 29c0 7 5 11 11 11 13 0 19-12 18-32Z" />
        <path d="M9 41c5-10 12-17 23-24" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M19 6h10v7l4 5v22H15V18l4-5V6Z" />
      <path d="M19 12h10M15 24h18" />
    </svg>
  );
}

function RoomIcon({ name }: { name: string }) {
  if (name === "leaf") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    );
  }
  if (name === "book-open") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  if (name === "sparkles") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SEMAI — Inclusive Circular Smart Farming",
    url: env.siteUrl,
    slogan: "Sebab setiap potensi butuh ruang untuk bermula.",
    description:
      "SEMAI membuka ruang bagi sumber daya, proses belajar, karya nyata, dan partisipasi setara melalui pengolahan sisa organik dan kebun inklusif.",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SEMAI — Room to Grow",
    url: env.siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* 01 — HERO SECTION */}
      <section className={styles.hero} id="hero" aria-labelledby="hero-title">
        <Container>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.heroBrand}>{heroContent.brandLine}</p>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                {heroContent.eyebrow}
              </div>
              <h1 id="hero-title">
                {heroContent.headline}
                <em>{heroContent.headlineEmphasis}</em>
              </h1>
              <p className={styles.coreStatement}>{heroContent.tagline}</p>
              <p className={styles.heroLead}>{heroContent.lead}</p>

              <div className={styles.heroActions}>
                <Link href="/donasikan" className={styles.primaryButton}>
                  {heroContent.primaryCtaLabel}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="#ruang-tumbuh" className={styles.textLink}>
                  {heroContent.secondaryCtaLabel}
                </Link>
              </div>

              <div className={styles.heroNote}>
                <span className={styles.noteIcon} aria-hidden="true">✓</span>
                <p>
                  <strong>{heroContent.noteHighlight}</strong> {heroContent.noteText}
                </p>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroImageWrap}>
                <Image
                  src={heroContent.imageSrc}
                  alt={heroContent.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 899px) 100vw, 50vw"
                  className={styles.heroImage}
                />
              </div>
              <div className={styles.quoteCard}>
                <span aria-hidden="true">“</span>
                <p>{heroContent.quote}</p>
              </div>
              <div className={styles.visualLabel}>
                <span aria-hidden="true">↗</span>
                {heroContent.visualLabel}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 02 — PROMISE BAR */}
      <section className={styles.promiseBar} aria-label="Prinsip SEMAI Room to Grow">
        <Container>
          <div className={styles.promiseGrid}>
            <div>
              <strong>Room for Nature</strong>
              <span>Sisa organik kembali ke siklus nutrisi</span>
            </div>
            <div>
              <strong>Room to Learn & Create</strong>
              <span>Ruang belajar terarah menghasilkan karya nyata</span>
            </div>
            <div>
              <strong>Room to Belong</strong>
              <span>Partisipasi setara dalam ekosistem sirkular</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 03 — OPENING SECTION */}
      <section className={styles.openingSection} id="tentang" aria-label="Filosofi SEMAI">
        <Container>
          <div className={styles.openingGrid}>
            <div>
              <span className={styles.sectionLabel}>Filosofi Kami</span>
              <h2 className={styles.openingQuote}>
                Setiap pertumbuhan butuh ruang. <em>SEMAI menciptakan ruang itu.</em>
              </h2>
            </div>
            <div>
              <p className={styles.openingLead}>
                SEMAI bukan sekadar mengajak orang berdonasi limbah. SEMAI mengajak kita membuka ruang: agar sesuatu yang tersisih dapat kembali ke alam, menjadi media belajar dan berkarya, dan menghubungkan semua peran secara setara.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 04 — THE FOUR ROOMS (SIGNATURE SECTION) */}
      <section className={styles.fourRoomsSection} id="ruang-tumbuh" aria-labelledby="four-rooms-title">
        <Container>
          <div className={styles.fourRoomsIntro}>
            <span className={styles.sectionLabel}>{fourRoomsContent.eyebrow}</span>
            <h2 id="four-rooms-title">{fourRoomsContent.title}</h2>
            <p>{fourRoomsContent.lead}</p>
          </div>

          <div className={styles.fourRoomsGrid}>
            {fourRoomsContent.rooms.map((room) => (
              <article className={styles.roomCard} key={room.id}>
                <div className={styles.roomCardTop}>
                  <span className={styles.roomTag}>{room.tag}</span>
                  <div className={styles.roomIconBox}>
                    <RoomIcon name={room.iconName} />
                  </div>
                </div>
                <h3>{room.title}</h3>
                <span className={styles.roomSubtitle}>{room.subtitle}</span>
                <p className={styles.roomDesc}>{room.description}</p>
                <div className={styles.roomBadge}>{room.badge}</div>
              </article>
            ))}
          </div>

          <div className={styles.fourRoomsBanner}>
            <div className={styles.fourRoomsBannerText}>
              <div className={styles.fourRoomsBannerIcon} aria-hidden="true">★</div>
              <div>
                <strong>ROOM TO GROW</strong>
                <p>{fourRoomsContent.closingQuote}</p>
              </div>
            </div>
            <Link href="/donasikan" className={styles.secondaryButton}>
              Buka Ruang Sekarang <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 05 — CARA KERJA (5 TAHAP SEMAI) */}
      <section className={styles.journeySection} id="cara-kerja" aria-labelledby="journey-title">
        <Container>
          <div className={styles.sectionIntro}>
            <div>
              <span className={styles.sectionLabel}>Alur Sirkular</span>
              <h2 id="journey-title">Dari rumahmu, perjalanan itu bermula.</h2>
            </div>
            <p>Mekanisme sederhana yang menghubungkan sisa rumah tangga dengan proses tumbuh di kebun.</p>
          </div>

          <ol className={styles.journeyList}>
            {journey.map((item) => (
              <li key={item.number}>
                <span className={styles.stepNumber}>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.journeyAction}>
            <p>
              <strong>Kamu menyisihkan sampahnya.</strong> Kami membuka ruang dan meneruskan manfaatnya.
            </p>
            <Link href="/donasikan" className={styles.secondaryButton}>
              Mulai Sisihkan Limbah <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 06 — KATEGORI BAHAN YANG DITERIMA */}
      <section className={styles.wasteSection} id="kategori-limbah" aria-labelledby="waste-title">
        <Container>
          <div className={styles.sectionIntro}>
            <div>
              <span className={styles.sectionLabel}>Mulai dari rumah</span>
              <h2 id="waste-title">Apa yang bisa kamu donasikan?</h2>
            </div>
            <p>Pastikan setiap bahan dipisahkan dan disiapkan dengan benar agar aman diterima serta mudah diolah.</p>
          </div>

          <div className={styles.wasteGrid}>
            {wasteTypes.map((waste) => (
              <article className={styles.wasteCard} key={waste.title}>
                <div className={styles.wasteCardTop}>
                  <div className={styles.iconBox}>
                    <WasteIcon name={waste.icon} />
                  </div>
                  <span className={styles.wasteTag}>{waste.tag}</span>
                </div>
                <h3>{waste.title}</h3>
                <p>{waste.description}</p>
                <div className={styles.preparation}>
                  <span>Siapkan seperti ini</span>
                  <p>{waste.preparation}</p>
                </div>
              </article>
            ))}
          </div>

          <span className={styles.wasteSwipeHint}>Geser untuk lihat semua →</span>

          <div className={styles.safetyNote}>
            <div className={styles.safetyIcon} aria-hidden="true">!</div>
            <p>
              <strong>Mohon tidak mencampur bahan.</strong> Kami belum dapat menerima limbah medis, oli kendaraan, cairan kimia, kemasan bahan berbahaya, atau sampah rumah tangga campur.
            </p>
          </div>
        </Container>
      </section>

      {/* 07 — JEJAK TUMBUH (PROOF MECHANISM) */}
      <section className={styles.transparencySection} id="jejak-tumbuh" aria-labelledby="jejak-title">
        <Container>
          <div className={styles.transparencyCard}>
            <div className={styles.transparencyHeader}>
              <span className={styles.sectionLabel}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                {jejakTumbuhContent.eyebrow}
              </span>
              <h2 id="jejak-title" className={styles.transparencyTitle}>
                {jejakTumbuhContent.title}
                <em>{jejakTumbuhContent.headlineEmphasis}</em>
              </h2>
              <p className={styles.transparencyLead}>{jejakTumbuhContent.lead}</p>
            </div>

            {/* Metrik Konkrit Jejak Tumbuh */}
            <div className={styles.metricGrid} aria-label="Ringkasan Data Dampak SEMAI">
              {jejakTumbuhContent.metrics.map((metric) => (
                <div className={styles.metricCard} key={metric.label}>
                  <div className={styles.metricValueWrap}>
                    <span className={styles.metricValue}>{metric.value}</span>
                    <span className={styles.metricUnit}>{metric.unit}</span>
                  </div>
                  <div className={styles.metricLabel}>{metric.label}</div>
                  <p className={styles.metricDesc}>{metric.description}</p>
                </div>
              ))}
            </div>

            {/* Pipeline Alur Pelacakan */}
            <div className={styles.tracePipeline} aria-label="Alur pencatatan donasi Jejak Tumbuh">
              {jejakTumbuhContent.steps.map((step) => (
                <div className={styles.traceStep} key={step.step}>
                  <div className={styles.traceStepHeader}>
                    <span className={styles.traceStepBadge}>Tahap {step.step}</span>
                    <div className={styles.traceStepIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22V12M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className={styles.traceStepName}>{step.title}</h3>
                  <p className={styles.traceStepDesc}>{step.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.transparencyFooter}>
              <div className={styles.transparencyFooterInfo}>
                <span className={styles.transparencyCheckIcon} aria-hidden="true">✓</span>
                <div>
                  <strong>Bukti Nyata, Bukan Klaim Sepihak</strong>
                  <p>{jejakTumbuhContent.note}</p>
                </div>
              </div>
              <Link href="/donasikan" className={styles.transparencyLink}>
                {jejakTumbuhContent.ctaLabel} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 08 — HUMAN STORY & AGENCY (BUKAN BELAS KASIHAN) */}
      <section className={styles.storySection} id="dampak" aria-labelledby="story-title">
        <Container>
          <div className={styles.storyGrid}>
            <div className={styles.storyHeading}>
              <span className={styles.sectionLabel}>Agency & Martabat</span>
              <h2 id="story-title">Kemampuan berbicara melalui proses dan karya nyata.</h2>
            </div>
            <div className={styles.storyBody}>
              <p className={styles.storyLead}>
                “Di SEMAI, kami tidak ingin menceritakan apa yang seseorang tidak bisa lakukan. Kami ingin memberi ruang agar apa yang bisa mereka lakukan berbicara melalui karya.”
              </p>
              <p>
                Belajar membutuhkan ruang untuk memegang bibit, mencampur kompos, mencoba, gagal, mengulang, dan akhirnya mandiri. Dari sisa organik yang kamu sisihkan, tercipta ruang tempat anak-anak difabel menunjukkan ketekunan, rasa bangga, dan kemampuan yang setara.
              </p>
              <div className={styles.storySignature}>
                “Yang kami tumbuhkan bukan hanya tanaman.”
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 09 — GALERI PROSES & KEGIATAN */}
      <section className={styles.gallerySection} id="galeri" aria-labelledby="gallery-title">
        <Container>
          <div className={styles.galleryIntro}>
            <div>
              <span className={styles.sectionLabel}>Wajah-wajah yang bertumbuh</span>
              <h2 id="gallery-title">Setiap momen menyimpan ketekunan, proses, dan rasa bangga.</h2>
            </div>
            <p>Inilah potret nyata ruang belajar, berkarya, dan kebersamaan yang terus kita kembangkan di kebun inklusif SEMAI.</p>
          </div>

          <div className={styles.galleryGrid}>
            {galleryItems.map((item) => (
              <figure className={`${styles.galleryItem} ${styles[item.className]}`} key={item.src}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 639px) 50vw, (max-width: 899px) 50vw, 33vw"
                />
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* 10 — HASIL OLAHAN & KARYA NYATA */}
      <section className={styles.resultsSection} id="hasil-olahan" aria-labelledby="results-title">
        <Container>
          <div className={styles.centerIntro}>
            <span className={styles.sectionLabel}>Dari bahan sisa menjadi bernilai</span>
            <h2 id="results-title">Di tangan yang tekun, sisa dapur menemukan arti baru.</h2>
            <p>Setiap jenis bahan diarahkan untuk menghasilkan nutrisi kebun dan karya bernilai guna yang terus berputar dalam ekosistem.</p>
          </div>

          <div className={styles.resultGrid}>
            <article className={styles.resultCard}>
              <div className={styles.resultImage}>
                <Image
                  src="/images/gallery-handcrafted-products.jpg"
                  alt="Produk lilin aromaterapi dan sabun ramah lingkungan dari jelantah terolah"
                  fill
                  sizes="(max-width: 699px) 82vw, 33vw"
                />
              </div>
              <div>
                <span>Minyak Jelantah</span>
                <h3>Produk Olahan Bernilai</h3>
                <p>Diolah melalui proses aman bersama peserta menjadi lilin aromaterapi dan produk bernilai jual.</p>
              </div>
            </article>

            <article className={styles.resultCard}>
              <div className={styles.resultImage}>
                <Image
                  src="/images/data-difabel-kompos-tanaman.jpg"
                  alt="Peserta difabel memanfaatkan kompos organik untuk menyuburkan tanaman"
                  fill
                  sizes="(max-width: 699px) 82vw, 33vw"
                />
              </div>
              <div>
                <span>Sampah Organik</span>
                <h3>Nutrisi Kebun Subur</h3>
                <p>Difermentasi menjadi kompos alami penyubur tanah, mengembalikan unsur hara ke siklus tanaman.</p>
              </div>
            </article>

            <article className={styles.resultCard}>
              <div className={styles.resultImage}>
                <Image
                  src="/images/data-difabel-panen-hidroponik.jpg"
                  alt="Peserta dengan bangga menunjukkan sayuran segar hasil panen kebun inklusif"
                  fill
                  sizes="(max-width: 699px) 82vw, 33vw"
                />
              </div>
              <div>
                <span>Kebun Inklusif</span>
                <h3>Pangan Segar & Kemandirian</h3>
                <p>Hasil panen sayuran segar dikonsumsi bersama dan dipasarkan untuk mendukung keberlanjutan ruang belajar.</p>
              </div>
            </article>
          </div>

          <span className={styles.resultsSwipeHint}>Geser untuk lihat semua →</span>
        </Container>
      </section>

      {/* 11 — FINAL CTA */}
      <section className={styles.finalCta} aria-label="Ajakan Berpartisipasi">
        <Container>
          <div className={styles.finalCtaInner}>
            <span className={styles.finalKicker}>Beri ruang. Lihat apa yang bisa tumbuh.</span>
            <h2>Satu tindakan kecil bisa membuka ruang untuk banyak hal tumbuh.</h2>
            <p>Kamu tidak perlu menunggu punya banyak untuk mulai membuka ruang. Sisihkan sisa dapur dan limbah terpilah hari ini, dan biarkan ia bertumbuh menjadi karya nyata.</p>
            <Link href="/donasikan" className={styles.lightButton}>
              Beri Ruang untuk Tumbuh <span aria-hidden="true">→</span>
            </Link>
            <span className={styles.finalNote}>
              “Yang kami tumbuhkan bukan hanya tanaman.”
            </span>
          </div>
        </Container>
      </section>
    </>
  );
}
