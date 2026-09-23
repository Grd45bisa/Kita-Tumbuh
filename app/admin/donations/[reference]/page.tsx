import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DonationVerificationForm } from "@/components/admin/DonationVerificationForm";
import { DonationStatusForm } from "@/components/admin/DonationStatusForm";
import { DONATION_STATUS_LABELS, formatWasteUnitLabel, type DonationStatus } from "@/types/donation";
import styles from "./DonationDetail.module.css";

interface DonationDetailPageProps {
  params: Promise<{ reference: string }>;
}

export default async function AdminDonationDetailPage({ params }: DonationDetailPageProps) {
  await requirePermission("donations", "read");
  const { reference } = await params;
  const supabase = await createClient();

  // 1. Fetch donation
  const { data: rawDonation, error } = await supabase
    .from("donations")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (error || !rawDonation) {
    notFound();
  }

  // Pickup details (if applicable) and status history both depend only on
  // rawDonation.id (already known), not on each other — fetch concurrently.
  const [{ data: pickup }, { data: rawHistory }] = await Promise.all([
    rawDonation.method === "PICKUP"
      ? supabase.from("pickup_requests").select("*").eq("donation_id", rawDonation.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("donation_status_history")
      .select("*")
      .eq("donation_id", rawDonation.id)
      .order("created_at", { ascending: false }),
  ]);

  const pickupDetails = pickup;
  const history = rawHistory || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link
          href="/admin/donations"
          className={styles.backLink}
        >
          ← Kembali ke Antrean Donasi
        </Link>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>
              Donasi #{rawDonation.reference}
            </h1>
            <p className={styles.titleMeta}>
              Didaftarkan pada {new Date(rawDonation.created_at).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
            </p>
          </div>
          <Badge variant={rawDonation.status === "IMPACTED" ? "success" : rawDonation.status === "REJECTED" ? "danger" : "info"}>
            Status: {DONATION_STATUS_LABELS[rawDonation.status as DonationStatus] || rawDonation.status}
          </Badge>
        </div>
      </header>

      <div className={styles.infoGrid}>
        {/* Donor & Delivery Information */}
        <Card>
          <h2 className={styles.cardTitle}>
            Informasi Donatur & Pengiriman
          </h2>
          <dl className={styles.detailList}>
            <dt>Nama Donatur</dt>
            <dd>{rawDonation.donor_name || "Anonim / Tamu"}</dd>

            <dt>Email</dt>
            <dd>{rawDonation.donor_email || "—"}</dd>

            <dt>Telepon/WA</dt>
            <dd>{rawDonation.donor_phone || "—"}</dd>

            <dt>Metode</dt>
            <dd className={styles.accentValue}>
              {rawDonation.method === "PICKUP" ? "Penjemputan Armada (Pickup)" : "Antar Mandiri (Drop-off)"}
            </dd>

            {rawDonation.donor_notes && (
              <>
                <dt>Catatan</dt>
                <dd>{rawDonation.donor_notes}</dd>
              </>
            )}
          </dl>

          {pickupDetails && (
            <div className={styles.pickupBlock}>
              <h3 className={styles.pickupTitle}>
                Alamat & Waktu Penjemputan
              </h3>
              <p className={styles.pickupAddress}>
                {pickupDetails.address_line1}
                {pickupDetails.address_line2 ? `, ${pickupDetails.address_line2}` : ""}
                <br />
                {pickupDetails.district ? `Kec. ${pickupDetails.district}, ` : ""}
                {pickupDetails.city || ""}
              </p>
              {pickupDetails.requested_date && (
                <p className={styles.pickupSchedule}>
                  Jadwal diminta: {pickupDetails.requested_date} ({pickupDetails.requested_slot || "Pagi/Siang"})
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Waste Specification Information */}
        <Card>
          <h2 className={styles.cardTitle}>
            Data Fisik & Verifikasi
          </h2>
          <dl className={styles.detailList}>
            <dt>Jenis Limbah</dt>
            <dd>{rawDonation.waste_type_name}</dd>

            <dt>Estimasi</dt>
            <dd>{rawDonation.estimated_quantity} {formatWasteUnitLabel(rawDonation.unit)}</dd>

            <dt>Kuantitas riil</dt>
            <dd className={rawDonation.verified_quantity != null ? styles.accentValue : styles.mutedValue}>
              {rawDonation.verified_quantity != null ? `${rawDonation.verified_quantity} ${formatWasteUnitLabel(rawDonation.unit)} (Terverifikasi)` : "Belum diverifikasi"}
            </dd>

            {rawDonation.verified_at && (
              <>
                <dt>Diverifikasi</dt>
                <dd>{new Date(rawDonation.verified_at).toLocaleString("id-ID")}</dd>
              </>
            )}

            {rawDonation.verification_notes && (
              <>
                <dt>Catatan tim</dt>
                <dd className={styles.noteValue}>
                  {rawDonation.verification_notes}
                </dd>
              </>
            )}
          </dl>
        </Card>
      </div>

      {/* Action Forms */}
      <div className={styles.actionForms}>
        {/* Verification Form */}
        <DonationVerificationForm
          donationId={rawDonation.id}
          reference={rawDonation.reference}
          unit={rawDonation.unit}
          estimatedQuantity={Number(rawDonation.estimated_quantity)}
          initialVerifiedQuantity={rawDonation.verified_quantity}
          initialNotes={rawDonation.verification_notes}
          currentStatus={rawDonation.status}
        />

        {/* Status Lifecycle Form */}
        <DonationStatusForm
          donationId={rawDonation.id}
          reference={rawDonation.reference}
          currentStatus={rawDonation.status as DonationStatus}
        />
      </div>

      {/* Status History Audit Trail */}
      <Card>
        <h2 className={styles.cardTitle}>
          Audit Trail Riwayat Status
        </h2>

        {history.length === 0 ? (
          <p className={styles.emptyHistory}>
            Belum ada catatan perubahan status pada sistem.
          </p>
        ) : (
          <div className={styles.historyList}>
            {history.map((h) => (
              <div key={h.id} className={styles.historyItem}>
                <div>
                  <span className={styles.historyStatus}>
                    {DONATION_STATUS_LABELS[h.to_status as DonationStatus] || h.to_status}
                  </span>
                  {h.from_status && (
                    <span className={styles.historyFrom}>
                      (dari {DONATION_STATUS_LABELS[h.from_status as DonationStatus] || h.from_status})
                    </span>
                  )}
                  {h.notes && (
                    <p className={styles.historyNote}>
                      {h.notes}
                    </p>
                  )}
                </div>
                <time className={styles.historyDate} dateTime={h.created_at}>
                  {new Date(h.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                </time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
