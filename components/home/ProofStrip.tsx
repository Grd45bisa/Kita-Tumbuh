import React from "react";
import Image from "next/image";
import styles from "./ProofStrip.module.css";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

interface MetricItem {
  value: string;
  label: string;
  tag: string;
  note: string;
  imageSrc: string;
  imageAlt: string;
}

const metrics: MetricItem[] = [
  {
    value: "3.420 L",
    label: "Minyak Jelantah Diberdayakan",
    tag: "Workshop Kreatif",
    note: "Dikelola dengan teliti oleh anak-anak dan kawan difabel menjadi lilin aromaterapi dan sabun ramah lingkungan bernilai tinggi.",
    imageSrc: "/images/data-difabel-workshop-jelantah.jpg",
    imageAlt: "Anak-anak dan kawan difabel bekerja sama dengan gembira meracik lilin aromaterapi dan sabun alami di meja workshop",
  },
  {
    value: "12,8 Ton",
    label: "Biomassa Organik Terolah",
    tag: "Bio-Kompos Alami",
    note: "Difermentasi menjadi pupuk bio-kompos kaya nutrisi yang dirawat bersama anak-anak difabel untuk menyuburkan media tanam kebun.",
    imageSrc: "/images/data-difabel-kompos-tanaman.jpg",
    imageAlt: "Anak-anak difabel tersenyum ceria belajar merawat bibit tanaman dengan bio-kompos organik di kebun komunitas",
  },
  {
    value: "148 Paket",
    label: "Pangan Segar Berbagi Berkah",
    tag: "Panen Sehat Mandiri",
    note: "Sayuran hidroponik segar bebas pestisida hasil rawatan anak-anak difabel disalurkan berkala untuk pemenuhan gizi lansia dan warga sekitar.",
    imageSrc: "/images/data-difabel-panen-hidroponik.jpg",
    imageAlt: "Anak-anak difabel tersenyum bangga memegang keranjang sayuran segar hidroponik hasil panen kebun cerdas",
  },
  {
    value: "100%",
    label: "Jejak Kebaikan Terbuka",
    tag: "Transparansi Cerdas",
    note: "Setiap data timbangan limbah, sensor IoT kebun pintar, dan penyaluran manfaat tercatat transparan serta dapat diaudit terbuka.",
    imageSrc: "/images/data-difabel-smart-monitoring.jpg",
    imageAlt: "Anak difabel didampingi pembina memantau sensor kelembapan smart farming dan data panen melalui tablet di greenhouse",
  },
];

export function ProofStrip() {
  return (
    <section className={styles.section} aria-label="Ringkasan Bukti & Data Dampak">
      <Container>
        {/* Header with Title and Narrative Context */}
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <Badge variant="success">Jejak Data Nyata & Pemberdayaan</Badge>
            <h2 className={styles.title}>Bukti Terukur di Tangan yang Istimewa</h2>
            <p className={styles.description}>
              Setiap angka di bawah ini bukan sekadar statistik, melainkan buah dedikasi, senyuman, dan ketelatenan anak-anak difabel yang membuktikan bahwa limbah Anda bersemi menjadi kemandirian dan berkah bersama.
            </p>
          </div>
        </div>

        {/* 4 Rich Visual Metric Cards */}
        <div className={styles.grid}>
          {metrics.map((item) => (
            <article key={item.label} className={styles.card}>
              {/* Photo spotlighting children with disabilities */}
              <div className={styles.imageWrapper}>
                <span className={styles.imageTag}>{item.tag}</span>
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={styles.cardImage}
                />
              </div>

              {/* Data & Narrative Content */}
              <div className={styles.cardBody}>
                <div className={styles.value}>{item.value}</div>
                <h3 className={styles.label}>{item.label}</h3>
                <p className={styles.note}>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
