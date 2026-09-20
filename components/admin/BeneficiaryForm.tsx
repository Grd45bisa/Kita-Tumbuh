"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import {
  createBeneficiaryAction,
  updateBeneficiaryAction,
} from "@/lib/domain/admin/beneficiaries";
import {
  BENEFICIARY_CATEGORIES,
  BENEFICIARY_CATEGORY_LABELS,
  VERIFICATION_STATUSES,
  VERIFICATION_STATUS_LABELS,
  CONSENT_STATUSES,
  CONSENT_STATUS_LABELS,
  PRIVACY_LEVELS,
  PRIVACY_LEVEL_LABELS,
} from "@/lib/validation/social-schema";
import type { Beneficiary } from "@/types/social";

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary;
}

export function BeneficiaryForm({ beneficiary }: BeneficiaryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!beneficiary;

  const [nameOrAlias, setNameOrAlias] = useState(beneficiary?.name_or_alias || "");
  const [category, setCategory] = useState(beneficiary?.category || "CHILD_WITH_DISABILITY");
  const [needType, setNeedType] = useState(beneficiary?.need_type || "");
  const [verificationStatus, setVerificationStatus] = useState(beneficiary?.verification_status || "PENDING");
  const [consentStatus, setConsentStatus] = useState(beneficiary?.consent_status || "NOT_REQUESTED");
  const [privacyLevel, setPrivacyLevel] = useState(beneficiary?.privacy_level || "PRIVATE");
  const [notes, setNotes] = useState(beneficiary?.notes || "");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const privacyPublicBlocked = privacyLevel === "PUBLIC" && consentStatus !== "GRANTED";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const payload = {
      name_or_alias: nameOrAlias,
      category,
      need_type: needType,
      verification_status: verificationStatus,
      consent_status: consentStatus,
      privacy_level: privacyLevel,
      notes: notes.trim(),
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateBeneficiaryAction({ id: beneficiary.id, ...payload })
        : await createBeneficiaryAction(payload);

      if (!res.success) {
        setErrorMessage(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      setSuccessMessage(isEdit ? "Data penerima manfaat berhasil diperbarui." : "Penerima manfaat baru berhasil ditambahkan.");
      router.refresh();
      if (!isEdit) {
        setNameOrAlias("");
        setNeedType("");
        setNotes("");
      }
    });
  };

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

      <Input
        id="name_or_alias"
        name="name_or_alias"
        label="Nama atau Alias"
        helperText="Gunakan alias jika consent untuk nama asli belum diberikan."
        value={nameOrAlias}
        onChange={(e) => setNameOrAlias(e.target.value)}
        error={fieldErrors.name_or_alias?.[0]}
        required
        disabled={isPending}
      />

      <Select
        id="category"
        name="category"
        label="Kategori"
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
        options={BENEFICIARY_CATEGORIES.map((c) => ({ value: c, label: BENEFICIARY_CATEGORY_LABELS[c] }))}
        disabled={isPending}
      />

      <Textarea
        id="need_type"
        name="need_type"
        label="Jenis Kebutuhan / Bantuan"
        placeholder="Contoh: Alat bantu mobilitas (kursi roda), pelatihan keterampilan kerajinan"
        value={needType}
        onChange={(e) => setNeedType(e.target.value)}
        error={fieldErrors.need_type?.[0]}
        required
        disabled={isPending}
      />

      <Select
        id="verification_status"
        name="verification_status"
        label="Status Verifikasi"
        value={verificationStatus}
        onChange={(e) => setVerificationStatus(e.target.value as typeof verificationStatus)}
        options={VERIFICATION_STATUSES.map((s) => ({ value: s, label: VERIFICATION_STATUS_LABELS[s] }))}
        disabled={isPending}
      />

      <Select
        id="consent_status"
        name="consent_status"
        label="Status Consent (Persetujuan Publikasi)"
        value={consentStatus}
        onChange={(e) => setConsentStatus(e.target.value as typeof consentStatus)}
        options={CONSENT_STATUSES.map((s) => ({ value: s, label: CONSENT_STATUS_LABELS[s] }))}
        disabled={isPending}
      />

      <Select
        id="privacy_level"
        name="privacy_level"
        label="Tingkat Privasi Tampilan Publik"
        value={privacyLevel}
        onChange={(e) => setPrivacyLevel(e.target.value as typeof privacyLevel)}
        options={PRIVACY_LEVELS.map((p) => ({ value: p, label: PRIVACY_LEVEL_LABELS[p] }))}
        error={privacyPublicBlocked ? "PUBLIC hanya boleh dipilih jika status consent adalah GRANTED." : fieldErrors.privacy_level?.[0]}
        disabled={isPending}
      />

      <Textarea
        id="notes"
        name="notes"
        label="Catatan Internal (Opsional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        error={fieldErrors.notes?.[0]}
        disabled={isPending}
      />

      <Button type="submit" variant="primary" isLoading={isPending} disabled={isPending || privacyPublicBlocked}>
        {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Penerima Manfaat"}
      </Button>
    </form>
  );
}
