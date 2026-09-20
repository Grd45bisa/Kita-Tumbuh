"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { createDistributionAction } from "@/lib/domain/admin/distributions";
import { getApprovedAllocationsForProgram } from "@/lib/domain/admin/finance";

interface ProgramOption {
  id: string;
  name: string;
}

interface BeneficiaryOption {
  id: string;
  name_or_alias: string;
}

interface DistributionFormProps {
  programs: ProgramOption[];
  beneficiaries: BeneficiaryOption[];
}

export function DistributionForm({ programs, beneficiaries }: DistributionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);

  const [programId, setProgramId] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [allocationId, setAllocationId] = useState("");
  const [allocationOptions, setAllocationOptions] = useState<Array<{ id: string; amount: number; allocated_at: string }>>([]);
  const [amount, setAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [distributedAt, setDistributedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!programId) {
      setAllocationOptions([]);
      setAllocationId("");
      return;
    }
    setIsLoadingAllocations(true);
    getApprovedAllocationsForProgram(programId)
      .then((options) => {
        setAllocationOptions(options);
        setAllocationId("");
      })
      .finally(() => setIsLoadingAllocations(false));
  }, [programId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await createDistributionAction({
        program_id: programId,
        beneficiary_id: beneficiaryId,
        allocation_id: allocationId || null,
        amount: amount ? parseInt(amount.replace(/\D/g, ""), 10) : null,
        item_description: itemDescription.trim(),
        distributed_at: distributedAt,
        evidence_url: evidenceUrl.trim(),
        evidence_notes: evidenceNotes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      setSuccessMessage("Distribusi berhasil dicatat.");
      setAmount("");
      setItemDescription("");
      setEvidenceUrl("");
      setEvidenceNotes("");
      router.refresh();
    });
  };

  const selectedAllocation = allocationOptions.find((a) => a.id === allocationId);
  const numericAmount = amount ? parseInt(amount.replace(/\D/g, ""), 10) || 0 : 0;
  const overAllocation = !!selectedAllocation && numericAmount > selectedAllocation.amount;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger-fg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-success-bg)",
            color: "var(--color-success-fg)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
          }}
        >
          {successMessage}
        </div>
      )}

      <Select
        id="program_id"
        name="program_id"
        label="Program Sosial"
        placeholder="Pilih program..."
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
        options={programs.map((p) => ({ value: p.id, label: p.name }))}
        error={fieldErrors.program_id?.[0]}
        required
        disabled={isPending}
      />

      <Select
        id="beneficiary_id"
        name="beneficiary_id"
        label="Penerima Manfaat"
        placeholder="Pilih penerima manfaat terverifikasi..."
        value={beneficiaryId}
        onChange={(e) => setBeneficiaryId(e.target.value)}
        options={beneficiaries.map((b) => ({ value: b.id, label: b.name_or_alias }))}
        error={fieldErrors.beneficiary_id?.[0]}
        required
        disabled={isPending}
      />

      <Select
        id="allocation_id"
        name="allocation_id"
        label="Sumber Dana (Alokasi Program, Opsional)"
        placeholder={isLoadingAllocations ? "Memuat alokasi..." : "Tidak terkait alokasi dana (barang in-kind)"}
        value={allocationId}
        onChange={(e) => setAllocationId(e.target.value)}
        options={allocationOptions.map((a) => ({
          value: a.id,
          label: `Rp ${a.amount.toLocaleString("id-ID")} — ${new Date(a.allocated_at).toLocaleDateString("id-ID")}`,
        }))}
        disabled={isPending || !programId || isLoadingAllocations}
        hint={!programId ? "Pilih program terlebih dahulu untuk melihat alokasi dana yang tersedia." : undefined}
      />

      <Input
        id="amount"
        name="amount"
        label="Nominal Dana (Rupiah, Opsional jika hanya barang)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={fieldErrors.amount?.[0] || (overAllocation ? `Melebihi sisa alokasi (Rp ${selectedAllocation?.amount.toLocaleString("id-ID")}).` : undefined)}
        disabled={isPending}
      />

      <Textarea
        id="item_description"
        name="item_description"
        label="Deskripsi Barang (Opsional jika hanya dana)"
        placeholder="Contoh: 1 unit kursi roda bekas layak pakai"
        value={itemDescription}
        onChange={(e) => setItemDescription(e.target.value)}
        error={fieldErrors.item_description?.[0]}
        disabled={isPending}
      />

      <Input
        id="distributed_at"
        name="distributed_at"
        type="date"
        label="Tanggal Distribusi"
        value={distributedAt}
        onChange={(e) => setDistributedAt(e.target.value)}
        required
        disabled={isPending}
      />

      <Input
        id="evidence_url"
        name="evidence_url"
        label="Tautan Bukti (Opsional)"
        placeholder="URL foto/dokumen bukti penyaluran"
        value={evidenceUrl}
        onChange={(e) => setEvidenceUrl(e.target.value)}
        disabled={isPending}
      />

      <Textarea
        id="evidence_notes"
        name="evidence_notes"
        label="Catatan Bukti / Persetujuan (Opsional)"
        value={evidenceNotes}
        onChange={(e) => setEvidenceNotes(e.target.value)}
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isPending}
        disabled={isPending || !programId || !beneficiaryId || overAllocation}
      >
        {isPending ? "Menyimpan..." : "Catat Distribusi"}
      </Button>
    </form>
  );
}
