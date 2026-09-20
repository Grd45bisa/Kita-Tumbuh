import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DONATION_STATUS_LABELS, type DonationStatus } from "@/types/donation";

interface DonationListItem {
  id: string;
  reference: string;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  waste_type_slug: string;
  waste_type_name: string;
  estimated_quantity: number;
  verified_quantity: number | null;
  unit: string;
  method: string;
  status: DonationStatus;
  created_at: string;
}

interface AdminDonationsPageProps {
  searchParams: Promise<{
    status?: string;
    waste_type?: string;
    method?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminDonationsPage({ searchParams }: AdminDonationsPageProps) {
  const params = await searchParams;
  const currentStatus = params.status || "";
  const currentWasteType = params.waste_type || "";
  const currentMethod = params.method || "";
  const searchKeyword = params.q?.trim() || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 15;
  const offset = (currentPage - 1) * pageSize;

  const supabase = await createClient();

  // 1. Fetch waste types for filter dropdown
  const { data: wasteTypes } = await supabase
    .from("waste_types")
    .select("slug, name")
    .order("sort_order", { ascending: true });

  // 2. Query donations with filters
  let query = supabase
    .from("donations")
    .select(
      "id, reference, donor_name, donor_email, donor_phone, waste_type_slug, waste_type_name, estimated_quantity, verified_quantity, unit, method, status, created_at",
      { count: "exact" }
    );

  if (currentStatus) {
    query = query.eq("status", currentStatus);
  }
  if (currentWasteType) {
    query = query.eq("waste_type_slug", currentWasteType);
  }
  if (currentMethod) {
    query = query.eq("method", currentMethod);
  }
  if (searchKeyword) {
    // Search in reference or donor_name
    query = query.or(
      `reference.ilike.%${searchKeyword}%,donor_name.ilike.%${searchKeyword}%,donor_email.ilike.%${searchKeyword}%`
    );
  }

  const { data: rawDonations, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const donations = (rawDonations || []) as DonationListItem[];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams();
    if (currentStatus) p.set("status", currentStatus);
    if (currentWasteType) p.set("waste_type", currentWasteType);
    if (currentMethod) p.set("method", currentMethod);
    if (searchKeyword) p.set("q", searchKeyword);
    p.set("page", String(page));
    return `/admin/donations?${p.toString()}`;
  };

  const columns: Column<DonationListItem>[] = [
    {
      key: "reference",
      header: "Nomor Referensi",
      render: (item) => (
        <div>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "var(--color-brand-primary)" }}>
            #{item.reference}
          </span>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "donor",
      header: "Donatur",
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
            {item.donor_name || "Anonim / Tamu"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {item.donor_phone || item.donor_email || "Tanpa kontak"}
          </div>
        </div>
      ),
    },
    {
      key: "waste_type",
      header: "Jenis Limbah",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-body-s)", fontWeight: 500 }}>
          {item.waste_type_name}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Kuantitas",
      render: (item) => (
        <div style={{ fontSize: "var(--font-size-caption)" }}>
          {item.verified_quantity != null ? (
            <div>
              <strong style={{ color: "var(--color-brand-primary-hover, #166534)" }}>
                {item.verified_quantity} {item.unit} (Riil)
              </strong>
              <div style={{ color: "var(--color-text-muted)" }}>Est: ~{item.estimated_quantity} {item.unit}</div>
            </div>
          ) : (
            <span style={{ color: "var(--color-text-muted)" }}>
              Est: ~{item.estimated_quantity} {item.unit} (Belum ditimbang)
            </span>
          )}
        </div>
      ),
    },
    {
      key: "method",
      header: "Metode",
      width: "110px",
      align: "center",
      render: (item) => (
        <Badge variant={item.method === "PICKUP" ? "warning" : "neutral"}>
          {item.method === "PICKUP" ? "Pickup" : "Drop-off"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "140px",
      align: "center",
      render: (item) => {
        const variant =
          item.status === "IMPACTED"
            ? "success"
            : item.status === "REJECTED"
            ? "danger"
            : item.status === "VERIFIED" || item.status === "PROCESSED"
            ? "info"
            : "neutral";
        return (
          <Badge variant={variant}>
            {DONATION_STATUS_LABELS[item.status] || item.status}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      width: "110px",
      align: "right",
      render: (item) => (
        <Link href={`/admin/donations/${item.reference}`}>
          <Button variant="secondary" size="sm">
            Periksa
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Antrean Donasi & Penjemputan
        </h1>
        <p style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Periksa seluruh kiriman limbah, catat hasil penimbangan riil, dan kelola status siklus pengolahan.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form
        method="GET"
        action="/admin/donations"
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          marginBottom: "var(--space-6)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 2, minWidth: "200px" }}>
          <Input
            id="q"
            name="q"
            type="text"
            label="Cari Donasi"
            placeholder="Nomor referensi atau nama donatur..."
            defaultValue={searchKeyword}
          />
        </div>

        <div style={{ flex: 1, minWidth: "150px" }}>
          <label
            htmlFor="status"
            style={{
              display: "block",
              fontSize: "var(--font-size-caption)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-default)",
              padding: "0 var(--space-3)",
              fontSize: "var(--font-size-body-s)",
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Semua Status</option>
            {Object.entries(DONATION_STATUS_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label} ({k})
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "150px" }}>
          <label
            htmlFor="waste_type"
            style={{
              display: "block",
              fontSize: "var(--font-size-caption)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            Jenis Limbah
          </label>
          <select
            id="waste_type"
            name="waste_type"
            defaultValue={currentWasteType}
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-default)",
              padding: "0 var(--space-3)",
              fontSize: "var(--font-size-body-s)",
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Semua Jenis</option>
            {(wasteTypes || []).map((wt) => (
              <option key={wt.slug} value={wt.slug}>
                {wt.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: "140px" }}>
          <label
            htmlFor="method"
            style={{
              display: "block",
              fontSize: "var(--font-size-caption)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            Metode
          </label>
          <select
            id="method"
            name="method"
            defaultValue={currentMethod}
            style={{
              width: "100%",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-default)",
              padding: "0 var(--space-3)",
              fontSize: "var(--font-size-body-s)",
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">Semua Metode</option>
            <option value="PICKUP">Jemput (Pickup)</option>
            <option value="DROP_OFF">Antar Mandiri</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button type="submit" variant="primary" size="md">
            Filter
          </Button>
          {(currentStatus || currentWasteType || currentMethod || searchKeyword) && (
            <Link href="/admin/donations">
              <Button type="button" variant="tertiary" size="md">
                Reset
              </Button>
            </Link>
          )}
        </div>
      </form>

      {/* Donations Data Table */}
      <DataTable
        columns={columns}
        data={donations}
        keyExtractor={(item) => item.id}
        emptyMessage="Tidak ada donasi yang cocok dengan kriteria pencarian."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        buildPageUrl={buildPageUrl}
      />
    </div>
  );
}
