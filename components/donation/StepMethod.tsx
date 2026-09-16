import React from "react";
import styles from "./DonationWizard.module.css";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { CollectionPoint } from "@/types/donation";

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
}

interface StepMethodProps {
  value: MethodData;
  onChange: (data: Partial<MethodData>) => void;
  collectionPoints: CollectionPoint[];
  wasteTypeSlug: string;
  errors: Partial<Record<keyof MethodData, string>>;
}

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
  const methodOptions = [
    {
      value: "DROP_OFF",
      label: "Antar ke Collection Point",
      description: "Kamu mengantarkan langsung ke lokasi kami. Gratis dan tidak perlu jadwal.",
    },
    {
      value: "PICKUP",
      label: "Dijemput",
      description:
        "Tim kami yang datang ke rumahmu. Jadwal akan dikonfirmasi dalam 1–2 hari kerja.",
    },
  ];

  // Filter collection points that accept the selected waste type
  const compatiblePoints = collectionPoints.filter(
    (cp) =>
      !cp.accepted_waste_slugs ||
      cp.accepted_waste_slugs.includes(wasteTypeSlug)
  );

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Bagaimana cara menyerahkannya?</h2>
        <p className={styles.stepSubtitle}>
          Pilih cara yang paling nyaman untukmu.
        </p>
      </div>

      <RadioGroup
        name="method"
        options={methodOptions}
        value={value.method}
        onChange={(v) => onChange({ method: v as DonationMethod })}
        error={errors.method}
      />

      {/* DROP_OFF section */}
      {value.method === "DROP_OFF" && (
        <div className={styles.methodSection}>
          <h3 className={styles.methodSectionTitle}>Pilih Lokasi Collection Point</h3>
          {compatiblePoints.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Belum ada collection point yang menerima jenis limbah ini di area kamu.</p>
              <p>
                Coba pilih metode <strong>Dijemput</strong>, atau{" "}
                <a href="mailto:kampungsmartfarming@gmail.com" className={styles.stepNoteLink}>
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
                    className={`${styles.cpCard} ${isSelected ? styles.cpCardSelected : ""}`}
                    onClick={() => onChange({ collection_point_id: cp.id })}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.cpCardHeader}>
                      <strong>{cp.name}</strong>
                      {isSelected && <span className={styles.cpSelectedBadge}>✓</span>}
                    </div>
                    <p className={styles.cpAddress}>{cp.address}</p>
                    {cp.notes && <p className={styles.cpNotes}>{cp.notes}</p>}
                    {cp.operating_hours && (
                      <details className={styles.cpHours}>
                        <summary>Jam Operasional</summary>
                        <ul>
                          {Object.entries(cp.operating_hours).map(([day, hours]) => (
                            <li key={day}>
                              <span className={styles.cpDay}>{day}:</span> {hours}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {errors.collection_point_id && (
            <p className={styles.stepError} role="alert">
              {errors.collection_point_id}
            </p>
          )}
        </div>
      )}

      {/* PICKUP section */}
      {value.method === "PICKUP" && (
        <div className={styles.methodSection}>
          <div className={styles.pickupNotice}>
            <span aria-hidden="true">📋</span>
            <div>
              <strong>Tentang layanan penjemputan</strong>
              <p>
                Setelah kamu konfirmasi donasi, tim kami akan menghubungi untuk
                memastikan jadwal pickup. Penjemputan biasanya dilakukan dalam
                1–3 hari kerja setelah konfirmasi.
              </p>
            </div>
          </div>

          <h3 className={styles.methodSectionTitle}>Alamat Penjemputan</h3>
          <div className={styles.pickupForm}>
            <Input
              label="Alamat Lengkap"
              placeholder="Jl. Contoh No. 1, RT 01/RW 02"
              required
              value={value.pickup_address_line1}
              onChange={(e) => onChange({ pickup_address_line1: e.target.value })}
              error={errors.pickup_address_line1}
            />
            <Input
              label="Patokan / Detail Tambahan (opsional)"
              placeholder="Dekat warung Bu Siti, rumah cat biru"
              value={value.pickup_address_line2}
              onChange={(e) => onChange({ pickup_address_line2: e.target.value })}
            />
            <div className={styles.pickupRow}>
              <Input
                label="Kelurahan / Kecamatan"
                placeholder="Kelurahan"
                value={value.pickup_district}
                onChange={(e) => onChange({ pickup_district: e.target.value })}
              />
              <Input
                label="Kota"
                placeholder="Kota"
                value={value.pickup_city}
                onChange={(e) => onChange({ pickup_city: e.target.value })}
              />
            </div>
          </div>

          <h3 className={styles.methodSectionTitle}>Jadwal Penjemputan</h3>
          <div className={styles.pickupForm}>
            <Input
              label="Tanggal yang Diinginkan"
              type="date"
              required
              min={getMinDate()}
              value={value.pickup_requested_date}
              onChange={(e) => onChange({ pickup_requested_date: e.target.value })}
              error={errors.pickup_requested_date}
            />
            <Select
              label="Slot Waktu (opsional)"
              placeholder="Pilih slot waktu"
              options={TIME_SLOTS}
              value={value.pickup_requested_slot}
              onChange={(e) => onChange({ pickup_requested_slot: e.target.value })}
            />
            <Textarea
              label="Catatan untuk Tim Kami (opsional)"
              placeholder="Misal: Tolong hubungi lewat WhatsApp sebelum datang"
              value={value.pickup_notes}
              onChange={(e) => onChange({ pickup_notes: e.target.value })}
              showCharCount
              maxLength={500}
            />
          </div>

          <div className={styles.privacyNote}>
            <span aria-hidden="true">🔒</span>
            <p>
              Alamat penjemputanmu bersifat <strong>privat</strong> dan hanya
              digunakan oleh tim operasional kami untuk keperluan penjemputan.
              Tidak akan dibagikan kepada pihak lain.
            </p>
          </div>
        </div>
      )}

      {/* Donor notes (shared, shown below both methods) */}
      <div className={styles.donorNotesSection}>
        <Textarea
          label="Catatan Tambahan (opsional)"
          placeholder="Ada informasi lain yang perlu kami ketahui tentang limbahmu?"
          value={value.donor_notes}
          onChange={(e) => onChange({ donor_notes: e.target.value })}
          showCharCount
          maxLength={500}
        />
      </div>
    </div>
  );
}
