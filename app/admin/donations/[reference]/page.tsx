import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DonationVerificationForm } from "@/components/admin/DonationVerificationForm";
import { DonationStatusForm } from "@/components/admin/DonationStatusForm";
import { DONATION_STATUS_LABELS, type DonationStatus } from "@/types/donation";

interface DonationDetailPageProps {
  params: Promise<{ reference: string }>;
}

export default async function AdminDonationDetailPage({ params }: DonationDetailPageProps) {
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

  // 2. Fetch pickup details if method is PICKUP
  let pickupDetails = null;
  if (rawDonation.method === "PICKUP") {
    const { data: pickup } = await supabase
      .from("pickup_requests")
      .select("*")
      .eq("donation_id", rawDonation.id)
      .maybeSingle();
    pickupDetails = pickup;
  }

  // 3. Fetch status history
  const { data: rawHistory } = await supabase
    .from("donation_status_history")
    .select("*")
    .eq("donation_id", rawDonation.id)
    .order("created_at", { ascending: false });

  const history = rawHistory || [];

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/admin/donations"
          style={{
            fontSize: "var(--font-size-caption)",
            color: "var(--color-brand-primary)",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "var(--space-2)",
          }}
        >
          ← Kembali ke Antrean Donasi
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-mono, monospace)" }}>
              Donasi #{rawDonation.reference}
            </h1>
            <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Didaftarkan pada {new Date(rawDonation.created_at).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
            </p>
          </div>
          <Badge variant={rawDonation.status === "IMPACTED" ? "success" : rawDonation.status === "REJECTED" ? "danger" : "info"}>
            Status: {DONATION_STATUS_LABELS[rawDonation.status as DonationStatus] || rawDonation.status}
          </Badge>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        {/* Donor & Delivery Information */}
        <Card>
          <h2 style={{ fontSize: "var(--font-size-body-m)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
            Informasi Donatur & Pengiriman
          </h2>
          <dl style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-body-s)" }}>
            <dt style={{ color: "var(--color-text-muted)" }}>Nama Donatur:</dt>
            <dd style={{ fontWeight: 500 }}>{rawDonation.donor_name || "Anonim / Tamu"}</dd>

            <dt style={{ color: "var(--color-text-muted)" }}>Email:</dt>
            <dd style={{ fontWeight: 500 }}>{rawDonation.donor_email || "—"}</dd>

            <dt style={{ color: "var(--color-text-muted)" }}>Telepon/WA:</dt>
            <dd style={{ fontWeight: 500 }}>{rawDonation.donor_phone || "—"}</dd>

            <dt style={{ color: "var(--color-text-muted)" }}>Metode:</dt>
            <dd style={{ fontWeight: 600, color: "var(--color-brand-primary)" }}>
              {rawDonation.method === "PICKUP" ? "Penjemputan Armada (Pickup)" : "Antar Mandiri (Drop-off)"}
            </dd>

            {rawDonation.donor_notes && (
              <>
                <dt style={{ color: "var(--color-text-muted)" }}>Catatan Donatur:</dt>
                <dd style={{ fontStyle: "italic" }}>{rawDonation.donor_notes}</dd>
              </>
            )}
          </dl>

          {pickupDetails && (
            <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border-default)" }}>
              <h3 style={{ fontSize: "var(--font-size-caption)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>
                Alamat & Waktu Penjemputan
              </h3>
              <p style={{ fontSize: "var(--font-size-body-s)", lineHeight: 1.5 }}>
                {pickupDetails.address_line1}
                {pickupDetails.address_line2 ? `, ${pickupDetails.address_line2}` : ""}
                <br />
                {pickupDetails.district ? `Kec. ${pickupDetails.district}, ` : ""}
                {pickupDetails.city || ""}
              </p>
              {pickupDetails.requested_date && (
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-brand-primary-hover)", marginTop: "var(--space-1)", fontWeight: 600 }}>
                  Jadwal diminta: {pickupDetails.requested_date} ({pickupDetails.requested_slot || "Pagi/Siang"})
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Waste Specification Information */}
        <Card>
          <h2 style={{ fontSize: "var(--font-size-body-m)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-3)" }}>
            Data Fisik & Verifikasi
          </h2>
          <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "var(--space-2)", fontSize: "var(--font-size-body-s)" }}>
            <dt style={{ color: "var(--color-text-muted)" }}>Jenis Limbah:</dt>
            <dd style={{ fontWeight: 600 }}>{rawDonation.waste_type_name}</dd>

            <dt style={{ color: "var(--color-text-muted)" }}>Estimasi Donatur:</dt>
            <dd>{rawDonation.estimated_quantity} {rawDonation.unit}</dd>

            <dt style={{ color: "var(--color-text-muted)" }}>Kuantitas Riil:</dt>
            <dd style={{ fontWeight: 700, color: rawDonation.verified_quantity != null ? "var(--color-brand-primary-hover, #166534)" : "var(--color-text-muted)" }}>
              {rawDonation.verified_quantity != null ? `${rawDonation.verified_quantity} ${rawDonation.unit} (Terverifikasi)` : "Belum diverifikasi"}
            </dd>

            {rawDonation.verified_at && (
              <>
                <dt style={{ color: "var(--color-text-muted)" }}>Waktu Verifikasi:</dt>
                <dd>{new Date(rawDonation.verified_at).toLocaleString("id-ID")}</dd>
              </>
            )}

            {rawDonation.verification_notes && (
              <>
                <dt style={{ color: "var(--color-text-muted)" }}>Catatan Tim:</dt>
                <dd style={{ background: "var(--color-bg-canvas)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-caption)" }}>
                  {rawDonation.verification_notes}
                </dd>
              </>
            )}
          </dl>
        </Card>
      </div>

      {/* Action Forms */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
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
        <h2 style={{ fontSize: "var(--font-size-body-m)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-4)" }}>
          Audit Trail Riwayat Status
        </h2>

        {history.length === 0 ? (
          <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)" }}>
            Belum ada catatan perubahan status pada sistem.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {history.map((h) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-bg-canvas)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-body-s)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "var(--color-brand-primary)" }}>
                    {DONATION_STATUS_LABELS[h.to_status as DonationStatus] || h.to_status}
                  </span>
                  {h.from_status && (
                    <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", marginLeft: "var(--space-2)" }}>
                      (dari {DONATION_STATUS_LABELS[h.from_status as DonationStatus] || h.from_status})
                    </span>
                  )}
                  {h.notes && (
                    <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      {h.notes}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
                  {new Date(h.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
