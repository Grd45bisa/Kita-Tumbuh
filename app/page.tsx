import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";
import { acceptedWastePreview as wasteTypes } from "@/lib/content/accepted-waste";
import { homepageJourney as journey } from "@/lib/content/how-it-works";
import { homepageGallery as galleryItems } from "@/lib/content/gallery";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Donasi Sampah untuk Anak Difabel",
  description:
    "Ubah minyak jelantah, sampah organik, dan plastik terpilah dari rumah menjadi karya bernilai yang mendukung ruang belajar dan kemandirian anak-anak difabel.",
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

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KITA TUMBUH — Kampung Setara Smart Farming",
    url: env.siteUrl,
    slogan: "Dari Limbah, Tumbuh Manfaat.",
    description:
      "Gerakan donasi sampah terpilah yang mengolah limbah rumah tangga menjadi karya bernilai untuk mendukung ruang tumbuh anak-anak difabel.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={styles.hero} aria-labelledby="hero-title">
        <Container>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.heroBrand}>KITA TUMBUH · KAMPUNG SETARA SMART FARMING</p>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                Donasi tanpa uang, tetap penuh makna
              </div>
              <h1 id="hero-title">
                Sampah dari rumahmu bisa <em>menumbuhkan harapan.</em>
              </h1>
              <p className={styles.coreStatement}>Sampah kalian sangat berarti bagi kami.</p>
              <p className={styles.heroLead}>
                Minyak jelantah, sisa organik, dan plastik terpilah yang tak lagi kamu gunakan dapat kami olah menjadi barang bernilai. Hasilnya membantu menghadirkan ruang belajar, berkarya, dan bertumbuh bagi anak-anak difabel.
              </p>

              <div className={styles.heroActions}>
                <Link href="/donasikan" className={styles.primaryButton}>
                  Donasikan sampahmu
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="#cara-kerja" className={styles.textLink}>
                  Lihat cara kerjanya
                </Link>
              </div>

              <div className={styles.heroNote}>
                <span className={styles.noteIcon} aria-hidden="true">✓</span>
                <p><strong>Tidak perlu menunggu banyak.</strong> Mulailah dari yang ada di rumah hari ini.</p>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroImageWrap}>
                <Image
                  src="/images/hero-difabel-smart-farming.jpg"
                  alt="Anak-anak difabel belajar dan berkarya bersama di kebun hidroponik"
                  fill
                  priority
                  sizes="(max-width: 899px) 100vw, 50vw"
                  className={styles.heroImage}
                />
              </div>
              <div className={styles.quoteCard}>
                <span aria-hidden="true">“</span>
                <p>Sampah kalian sangat berarti bagi kami.</p>
              </div>
              <div className={styles.visualLabel}>
                <span aria-hidden="true">↗</span>
                Dari limbah, tumbuh kemampuan dan kemandirian
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.promiseBar} aria-label="Prinsip gerakan KITA TUMBUH">
        <Container>
          <div className={styles.promiseGrid}>
            <div><strong>Mudah dimulai</strong><span>Dari sampah rumah tangga sehari-hari</span></div>
            <div><strong>Diolah dengan layak</strong><span>Dipilah dan dimanfaatkan kembali</span></div>
            <div><strong>Bertumbuh bersama</strong><span>Untuk ruang belajar dan karya yang inklusif</span></div>
          </div>
        </Container>
      </section>

      <section className={styles.gallerySection} id="galeri">
        <Container>
          <div className={styles.galleryIntro}>
            <div>
              <span className={styles.sectionLabel}>Wajah-wajah yang bertumbuh</span>
              <h2>Setiap foto menyimpan proses, keberanian, dan rasa bangga.</h2>
            </div>
            <p>Inilah gambaran ruang belajar dan berkarya yang ingin terus kita tumbuhkan bersama.</p>
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

      <section className={styles.storySection} id="tentang">
        <Container>
          <div className={styles.storyGrid}>
            <div className={styles.storyHeading}>
              <span className={styles.sectionLabel}>Mengapa ini berarti</span>
              <h2>Yang sering kita buang, bisa menjadi awal bagi mereka untuk berkarya.</h2>
            </div>
            <div className={styles.storyBody}>
              <p className={styles.storyLead}>
                Kami percaya anak-anak difabel bukan penerima belas kasihan. Mereka adalah pribadi dengan kemampuan, ketekunan, dan mimpi yang layak mendapat ruang untuk tumbuh.
              </p>
              <p>
                Karena itu, sampah yang kamu pilah tidak berhenti sebagai sumbangan. Ia menjadi bahan belajar, kesempatan berlatih, dan karya yang dapat dibanggakan. Dari kebiasaan kecil di rumah, kita membangun lingkungan yang lebih bersih sekaligus masa depan yang lebih setara.
              </p>
              <div className={styles.storySignature}>Kecil bagimu. Besar artinya bagi perjalanan mereka.</div>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.wasteSection} id="kategori-limbah">
        <Container>
          <div className={styles.sectionIntro}>
            <div>
              <span className={styles.sectionLabel}>Mulai dari rumah</span>
              <h2>Apa yang bisa kamu donasikan?</h2>
            </div>
            <p>Pastikan setiap bahan dipisahkan dan disiapkan dengan benar agar aman diterima serta mudah diolah.</p>
          </div>

          <div className={styles.wasteGrid}>
            {wasteTypes.map((waste) => (
              <article className={styles.wasteCard} key={waste.title}>
                <div className={styles.wasteCardTop}>
                  <div className={styles.iconBox}><WasteIcon name={waste.icon} /></div>
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
            <p><strong>Mohon tidak mencampur bahan.</strong> Kami belum dapat menerima limbah medis, oli kendaraan, cairan kimia, kemasan bahan berbahaya, atau sampah rumah tangga yang tercampur.</p>
          </div>
        </Container>
      </section>

      <section className={styles.journeySection} id="cara-kerja">
        <Container>
          <div className={styles.sectionIntro}>
            <div>
              <span className={styles.sectionLabel}>Satu alur, banyak kebaikan</span>
              <h2>Perjalanan sampahmu tidak berakhir di tempat sampah.</h2>
            </div>
            <p>Kami membuat prosesnya sederhana agar siapa pun bisa ikut mengambil bagian.</p>
          </div>

          <ol className={styles.journeyList}>
            {journey.map((item) => (
              <li key={item.number}>
                <span className={styles.stepNumber}>{item.number}</span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </li>
            ))}
          </ol>

          <div className={styles.journeyAction}>
            <p><strong>Kamu menyiapkan sampahnya.</strong> Kami membantu meneruskan manfaatnya.</p>
            <Link href="/donasikan" className={styles.secondaryButton}>Mulai donasi <span aria-hidden="true">→</span></Link>
          </div>
        </Container>
      </section>

      <section className={styles.impactSection} id="dampak-sosial">
        <Container>
          <div className={styles.impactGrid}>
            <div className={styles.impactVisual}>
              <Image
                src="/images/impact-difabel-komunitas.jpg"
                alt="Anak-anak difabel dan pendamping menikmati kegiatan berkebun bersama"
                fill
                sizes="(max-width: 899px) 100vw, 50vw"
                className={styles.impactImage}
              />
              <div className={styles.impactCaption}>Tumbuh bukan karena dikasihani, tetapi karena diberi kesempatan.</div>
            </div>
            <div className={styles.impactContent}>
              <span className={styles.sectionLabel}>Dampak yang ingin kita tumbuhkan</span>
              <h2>Bukan sekadar bantuan. Ini tentang ruang untuk menjadi berdaya.</h2>
              <p>Sampah yang diolah membuka rangkaian kegiatan yang memberi anak-anak difabel kesempatan untuk belajar, mencoba, bekerja sama, dan melihat karya mereka memiliki nilai.</p>

              <ul className={styles.impactList}>
                <li><span>01</span><div><strong>Ruang belajar yang ramah</strong><p>Kegiatan disusun agar setiap anak dapat bertumbuh sesuai kemampuan dan ritmenya.</p></div></li>
                <li><span>02</span><div><strong>Keterampilan yang bermakna</strong><p>Belajar mengolah bahan, merawat tanaman, dan menghasilkan karya yang berguna.</p></div></li>
                <li><span>03</span><div><strong>Kepercayaan diri dan kemandirian</strong><p>Setiap proses menjadi kesempatan untuk merasa mampu, dihargai, dan dibutuhkan.</p></div></li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.resultsSection} id="hasil-olahan">
        <Container>
          <div className={styles.centerIntro}>
            <span className={styles.sectionLabel}>Dari bahan sisa menjadi berguna</span>
            <h2>Di tangan yang tekun, sampah menemukan arti baru.</h2>
            <p>Setiap jenis bahan menempuh proses berbeda, tetapi semuanya diarahkan untuk menghasilkan manfaat yang dapat terus berputar.</p>
          </div>

          <div className={styles.resultGrid}>
            <article className={styles.resultCard}>
              <div className={styles.resultImage}>
                <Image src="/images/gallery-handcrafted-products.jpg" alt="Contoh produk kerajinan hasil pengolahan bahan sisa" fill sizes="(max-width: 699px) 82vw, 33vw" />
              </div>
              <div><span>Minyak jelantah</span><h3>Produk olahan bernilai guna</h3><p>Diolah melalui proses yang sesuai menjadi karya yang dapat dipasarkan.</p></div>
            </article>
            <article className={styles.resultCard}>
              <div className={styles.resultImage}>
                <Image src="/images/data-difabel-kompos-tanaman.jpg" alt="Kegiatan mengolah sampah organik untuk tanaman" fill sizes="(max-width: 699px) 82vw, 33vw" />
              </div>
              <div><span>Sampah organik</span><h3>Nutrisi untuk kebun</h3><p>Diubah menjadi bahan pendukung tanaman agar sisa dapur kembali ke siklus kehidupan.</p></div>
            </article>
            <article className={styles.resultCard}>
              <div className={styles.resultImage}>
                <Image src="/images/data-difabel-panen-hidroponik.jpg" alt="Anak-anak membawa hasil kebun hidroponik" fill sizes="(max-width: 699px) 82vw, 33vw" />
              </div>
              <div><span>Hasil bersama</span><h3>Karya, pangan, dan kesempatan</h3><p>Nilai yang tercipta diputar kembali untuk mendukung kegiatan komunitas yang inklusif.</p></div>
            </article>
          </div>

          <span className={styles.resultsSwipeHint}>Geser untuk lihat semua →</span>
        </Container>
      </section>

      <section className={styles.transparencySection} id="transparansi">
        <Container>
          <div className={styles.transparencyCard}>
            <div className={styles.transparencyHeader}>
              <span className={styles.sectionLabel}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                Jejak Terbuka & Akuntabel
              </span>
              <h2 className={styles.transparencyTitle}>
                Setiap donasi layak punya jejak yang jelas.
              </h2>
              <p className={styles.transparencyLead}>
                Kami berkomitmen memisahkan perkiraan awal donatur dari hasil penimbangan aktual, lalu mencatat perjalanan bahan secara terbuka dari saat diterima hingga menjadi produk bernilai dan manfaat nyata bagi anak-anak difabel.
              </p>
            </div>

            <div className={styles.tracePipeline} aria-label="Alur pencatatan donasi">
              <div className={styles.traceStep}>
                <div className={styles.traceStepHeader}>
                  <span className={styles.traceStepBadge}>Tahap 01</span>
                  <div className={styles.traceStepIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                      <path d="m3.3 7 8.7 5 8.7-5"/>
                      <path d="M12 22V12"/>
                    </svg>
                  </div>
                </div>
                <h3 className={styles.traceStepName}>Diterima</h3>
                <p className={styles.traceStepDesc}>
                  Bahan donasi dicatat dengan nomor unik pelacakan dan bukti serah terima digital bagi donatur.
                </p>
              </div>

              <div className={styles.traceStep}>
                <div className={styles.traceStepHeader}>
                  <span className={styles.traceStepBadge}>Tahap 02</span>
                  <div className={styles.traceStepIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                      <path d="M7 21h10"/>
                      <path d="M12 3v18"/>
                      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
                    </svg>
                  </div>
                </div>
                <h3 className={styles.traceStepName}>Ditimbang</h3>
                <p className={styles.traceStepDesc}>
                  Volume atau berat riil diverifikasi dengan timbangan terkalibrasi, memvalidasi estimasi donatur.
                </p>
              </div>

              <div className={styles.traceStep}>
                <div className={styles.traceStepHeader}>
                  <span className={styles.traceStepBadge}>Tahap 03</span>
                  <div className={styles.traceStepIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 2v8"/>
                      <path d="m4.93 10.93 1.41 1.41"/>
                      <path d="M2 18h2"/>
                      <path d="M20 18h2"/>
                      <path d="m19.07 10.93-1.41 1.41"/>
                      <path d="M22 22H2"/>
                      <path d="m8 22 4-10 4 10"/>
                    </svg>
                  </div>
                </div>
                <h3 className={styles.traceStepName}>Diolah</h3>
                <p className={styles.traceStepDesc}>
                  Diolah telaten bersama anak-anak difabel menjadi lilin aromaterapi, sabun alami, & pupuk kompos.
                </p>
              </div>

              <div className={styles.traceStep}>
                <div className={styles.traceStepHeader}>
                  <span className={styles.traceStepBadge}>Tahap 04</span>
                  <div className={styles.traceStepIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                    </svg>
                  </div>
                </div>
                <h3 className={styles.traceStepName}>Dimanfaatkan</h3>
                <p className={styles.traceStepDesc}>
                  Menumbuhkan pangan segar kebun cerdas dan mendanai beasiswa kemandirian anak-anak istimewa.
                </p>
              </div>
            </div>

            <div className={styles.transparencyFooter}>
              <div className={styles.transparencyFooterInfo}>
                <span className={styles.transparencyCheckIcon} aria-hidden="true">✓</span>
                <div>
                  <strong>Jaminan Integritas & Tanpa Klaim Palsu</strong>
                  <p>Seluruh alur penerimaan fisik dan pengalokasian dampak tercatat secara jujur serta dapat diaudit publik.</p>
                </div>
              </div>
              <Link href="/donasikan" className={styles.transparencyLink}>
                Mulai Donasi Sekarang <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.finalCta}>
        <Container>
          <div className={styles.finalCtaInner}>
            <span className={styles.finalKicker}>Hari ini, jangan buru-buru dibuang.</span>
            <h2>Sisihkan. Pilahkan. Biarkan ia tumbuh menjadi harapan.</h2>
            <p>Kamu tidak harus menunggu punya banyak untuk mulai berbuat baik. Satu langkah kecil dari rumah bisa menjadi bagian dari perjalanan besar mereka.</p>
            <Link href="/donasikan" className={styles.lightButton}>Donasikan sampah sekarang <span aria-hidden="true">→</span></Link>
            <span className={styles.finalNote}>Dari limbah, tumbuh manfaat. Dari kepedulian, tumbuh kemandirian.</span>
          </div>
        </Container>
      </section>
    </>
  );
}
