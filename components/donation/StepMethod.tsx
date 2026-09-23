import React from "react";
import styles from "./DonationWizard.module.css";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { CollectionPoint } from "@/types/donation";
import {
  MapPinIcon,
  PickupTruckIcon,
  CheckIcon,
  ClockIcon,
  ShieldLockIcon,
  InfoCircleIcon,
} from "./DonationIcons";

export type DonationMethod = "DROP_OFF" | "PICKUP";

interface MethodData {
  method: DonationMethod;
  // DROP_OFF
  collection_point_id: string;
  // PICKUP
  pickup_address_line1: string;
  pickup_address_line2: string;
  pickup_district: string;
  pickup_city: string;
  pickup_requested_date: string;
  pickup_requested_slot: string;
  pickup_notes: string;
  donor_notes: string;
  donor_email: string;
}

interface StepMethodProps {
  value: MethodData;
  onChange: (data: Partial<MethodData>) => void;
  collectionPoints: CollectionPoint[];
  wasteTypeSlug: string;
  errors: Partial<Record<keyof MethodData, string>>;
}

// MVP time preferences; these options do not represent checked capacity.
const TIME_SLOTS = [
  { value: "08:00–12:00", label: "Pagi: 08.00 – 12.00" },
  { value: "13:00–17:00", label: "Siang: 13.00 – 17.00" },
];

// Min date = tomorrow
function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function StepMethod({
  value,
  onChange,
  collectionPoints,
  wasteTypeSlug,
  errors,
}: StepMethodProps) {
  // Filter collection points that accept the selected waste type
  const compatiblePoints = collectionPoints.filter(
    (cp) =>
      !cp.accepted_waste_slugs ||
      cp.accepted_waste_slugs.includes(wasteTypeSlug)
  );

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Metode Penyerahan</h2>
        <p className={styles.stepSubtitle}>
          Pilih cara penyerahan limbah yang paling mudah untukmu.
        </p>
      </div>

      {/* Method choice cards */}
      <div className={styles.methodChoiceGrid}>
        <button
          type="button"
          className={`${styles.methodChoiceCard} ${
            value.method === "DROP_OFF" ? styles.methodChoiceCardActive : ""
          }`}
          onClick={() => onChange({ method: "DROP_OFF" })}
          aria-pressed={value.method === "DROP_OFF"}
        >
          <div className={styles.methodIconWrap}>
            <MapPinIcon size={24} />
          </div>
          <div className={styles.methodCardContent}>
            <div className={styles.methodCardTitleRow}>
              <strong className={styles.methodTitleText}>
                Antar ke Collection Point
              </strong>
              {value.method === "DROP_OFF" && (
                <span className={styles.methodActiveBadge}>
                  <CheckIcon size={12} />
                </span>
              )}
            </div>
            <p className={styles.methodDescText}>
              Kamu mengantar langsung ke titik kumpul terdekat. Cepat, fleksibel,
              dan tanpa perlu menunggu jadwal.
            </p>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.methodChoiceCard} ${
            value.method === "PICKUP" ? styles.methodChoiceCardActive : ""
          }`}
          onClick={() => onChange({ method: "PICKUP" })}
          aria-pressed={value.method === "PICKUP"}
        >
          <div className={styles.methodIconWrap}>
            <PickupTruckIcon size={24} />
          </div>
          <div className={styles.methodCardContent}>
            <div className={styles.methodCardTitleRow}>
              <strong className={styles.methodTitleText}>
                Dijemput oleh Tim
              </strong>
              {value.method === "PICKUP" && (
                <span className={styles.methodActiveBadge}>
                  <CheckIcon size={12} />
                </span>
              )}
            </div>
            <p className={styles.methodDescText}>
              Tim operasional kami akan datang menjemput ke alamatmu. Jadwal
              dikonfirmasi sebelum keberangkatan.
            </p>
          </div>
        </button>
      </div>

      {errors.method && (
        <div className={styles.stepError} role="alert">
          <InfoCircleIcon size={18} className={styles.errorIcon} />
          <span>{errors.method}</span>
        </div>
      )}

      {/* DROP_OFF section */}
      {value.method === "DROP_OFF" && (
        <div className={styles.methodSection}>
          <div className={styles.sectionHeadingWrap}>
            <h3 className={styles.methodSectionTitle}>
              Pilih Lokasi Collection Point
            </h3>
            <span className={styles.sectionSubtitle}>
              Pilih titik kumpul terdekat untuk menyerahkan limbah.
            </span>
          </div>

          {compatiblePoints.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Belum ada collection point yang menerima kategori limbah ini di area sekitarmu.</p>
              <p>
                Silakan beralih ke opsi <strong>Dijemput oleh Tim</strong>, atau{" "}
                <a
                  href="mailto:kampungsmartfarming@gmail.com"
                  className={styles.stepNoteLink}
                >
                  hubungi kami
                </a>
                .
              </p>
            </div>
          ) : (
            <div className={styles.collectionPointList}>
              {compatiblePoints.map((cp) => {
                const isSelected = value.collection_point_id === cp.id;
                return (
                  <button
                    key={cp.id}
                    type="button"
                    className={`${styles.cpCard} ${
                      isSelected ? styles.cpCardSelected : ""
                    }`}
                    onClick={() => onChange({ collection_point_id: cp.id })}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.cpCardHeader}>
                      <div className={styles.cpNameWithIcon}>
                        <MapPinIcon size={18} className={styles.cpPinIcon} />
                        <strong>{cp.name}</strong>
                      </div>
                      {isSelected && (
                        <span className={styles.cpSelectedBadge}>
                          <CheckIcon size={12} />
                          <span>Dipilih</span>
                        </span>
                      )}
                    </div>
                    <p className={styles.cpAddress}>{cp.address}</p>
                    {cp.notes && <p className={styles.cpNotes}>{cp.notes}</p>}
                    {cp.operating_hours && (
                      <details className={styles.cpHours}>
                        <summary>
                          <ClockIcon size={14} className={styles.clockIcon} />
                          <span>Lihat Jam Operasional</span>
                        </summary>
                        <ul>
                          {Object.entries(cp.operating_hours).map(
                            ([day, hours]) => (
                              <li key={day}>
                                <span className={styles.cpDay}>{day}:</span>{" "}
                                {hours}
                              </li>
                            )
                          )}
                        </ul>
                      </details>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {errors.collection_point_id && (
            <div className={styles.stepError} role="alert">
              <InfoCircleIcon size={18} className={styles.errorIcon} />
              <span>{errors.collection_point_id}</span>
            </div>
          )}
        </div>
      )}

      {/* PICKUP section */}
      {value.method === "PICKUP" && (
        <div className={styles.methodSection}>
          <div className={styles.pickupNotice}>
            <div className={styles.noticeIconWrap}>
              <InfoCircleIcon size={20} />
            </div>
            <div className={styles.noticeText}>
              <strong>Ketentuan Layanan Penjemputan</strong>
              <p>
                Tanggal dan jam yang kamu tentukan merupakan preferensi jadwal.
                Tim operasional kami akan mengonfirmasi ketersediaan rute armada
                sebelum penjemputan dilakukan.
              </p>
            </div>
          </div>

          <div className={styles.formGroupSection}>
            <h3 className={styles.methodSectionTitle}>Alamat Penjemputan</h3>
            <div className={styles.pickupForm}>
              <Input
                label="Alamat Lengkap"
                placeholder="Nama jalan, nomor rumah, RT/RW"
                required
                value={value.pickup_address_line1}
                onChange={(e) =>
                  onChange({ pickup_address_line1: e.target.value })
                }
                error={errors.pickup_address_line1}
              />
              <Input
                label="Patokan / Petunjuk Lokasi (opsional)"
                placeholder="Contoh: Seberang masjid, pagar warna hijau"
                value={value.pickup_address_line2}
                onChange={(e) =>
                  onChange({ pickup_address_line2: e.target.value })
                }
              />
              <div className={styles.pickupRow}>
                <Input
                  label="Kelurahan / Kecamatan"
                  placeholder="Kecamatan & Kelurahan"
                  value={value.pickup_district}
                  onChange={(e) =>
                    onChange({ pickup_district: e.target.value })
                  }
                />
                <Input
                  label="Kota / Kabupaten"
                  placeholder="Kota"
                  value={value.pickup_city}
                  onChange={(e) => onChange({ pickup_city: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroupSection}>
            <h3 className={styles.methodSectionTitle}>
              Preferensi Waktu Penjemputan
            </h3>
            <div className={styles.pickupForm}>
              <Input
                label="Pilihan Tanggal (Minimal Besok)"
                type="date"
                required
                min={getMinDate()}
                value={value.pickup_requested_date}
                onChange={(e) =>
                  onChange({ pickup_requested_date: e.target.value })
                }
                error={errors.pickup_requested_date}
              />
              <Select
                label="Pilihan Waktu (opsional)"
                placeholder="Pilih rentang waktu"
                hint="Jadwal aktual akan dikoordinasikan kembali oleh staf penjemputan."
                options={TIME_SLOTS}
                value={value.pickup_requested_slot}
                onChange={(e) =>
                  onChange({ pickup_requested_slot: e.target.value })
                }
              />
              <Textarea
                label="Catatan Penjemputan (opsional)"
                placeholder="Contoh: Mohon hubungi WhatsApp sebelum berangkat, atau parkir di depan gang"
                value={value.pickup_notes}
                onChange={(e) => onChange({ pickup_notes: e.target.value })}
                showCharCount
                maxLength={500}
              />
            </div>
          </div>

          <div className={styles.privacyNote}>
            <div className={styles.privacyIconWrap}>
              <ShieldLockIcon size={18} />
            </div>
            <p>
              Data alamat penjemputanmu bersifat <strong>rahasia & privat</strong>.
              Hanya digunakan oleh staf operasional kami untuk keperluan logistik
              penjemputan dan tidak akan pernah dibagikan kepada pihak lain.
            </p>
          </div>
        </div>
      )}

      {/* Optional email for status notifications (shared, shown below both methods) */}
      <div className={styles.donorNotesSection}>
        <Input
          type="email"
          label="Email (opsional) — untuk kabar progres donasimu"
          placeholder="namamu@email.com"
          value={value.donor_email}
          onChange={(e) => onChange({ donor_email: e.target.value })}
          error={errors.donor_email}
        />
        <p className={styles.sectionSubtitle}>
          Kalau diisi, kami kirim kabar setiap tahap donasimu berlanjut (misalnya saat diverifikasi atau diproses). Kami tidak mengirim promosi, dan tidak membagikan emailmu ke pihak lain. Ingin daftar akun? Gunakan email yang sama saat mendaftar dan riwayat donasi ini akan otomatis tertaut ke akunmu.
        </p>
      </div>

      {/* Donor notes (shared, shown below both methods) */}
      <div className={styles.donorNotesSection}>
        <Textarea
          label="Pesan atau Catatan Tambahan (opsional)"
          placeholder="Ada informasi tambahan mengenai kondisi limbah atau wadah yang kamu gunakan?"
          value={value.donor_notes}
          onChange={(e) => onChange({ donor_notes: e.target.value })}
          showCharCount
          maxLength={500}
        />
      </div>
    </div>
  );
}

