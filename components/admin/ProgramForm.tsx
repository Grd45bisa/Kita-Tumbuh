"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import {
  createSocialProgramAction,
  updateSocialProgramAction,
} from "@/lib/domain/admin/social-programs";
import {
  SOCIAL_PROGRAM_STATUSES,
  SOCIAL_PROGRAM_STATUS_LABELS,
} from "@/lib/validation/social-schema";
import type { SocialProgram } from "@/types/social";

interface ProgramFormProps {
  program?: SocialProgram;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProgramForm({ program }: ProgramFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!program;

  const [name, setName] = useState(program?.name || "");
  const [slug, setSlug] = useState(program?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(program?.description || "");
  const [goal, setGoal] = useState(program?.goal || "");
  const [status, setStatus] = useState(program?.status || "DRAFT");
  const [targetAmount, setTargetAmount] = useState(
    program?.target_amount ? String(program.target_amount) : ""
  );
  const [startDate, setStartDate] = useState(program?.start_date || "");
  const [endDate, setEndDate] = useState(program?.end_date || "");
  const [publicStatus, setPublicStatus] = useState(program?.public_status || false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const payload = {
      name,
      slug,
      description,
      goal,
      status,
      target_amount: targetAmount ? parseInt(targetAmount.replace(/\D/g, ""), 10) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      public_status: publicStatus,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateSocialProgramAction({ id: program.id, ...payload })
        : await createSocialProgramAction(payload);

      if (!res.success) {
        setErrorMessage(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      setSuccessMessage(isEdit ? "Program berhasil diperbarui." : "Program baru berhasil dibuat.");
      router.refresh();
      if (!isEdit) {
        router.push("/admin/social/programs");
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
        id="name"
        name="name"
        label="Nama Program"
        placeholder="Contoh: Pelatihan Kerajinan Lilin untuk Anak Difabel"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        error={fieldErrors.name?.[0]}
        required
        disabled={isPending}
      />

      <Input
        id="slug"
        name="slug"
        label="Slug URL"
        placeholder="pelatihan-kerajinan-lilin-anak-difabel"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(slugify(e.target.value));
        }}
        helperText="Digunakan di URL publik: /program/[slug]"
        error={fieldErrors.slug?.[0]}
        required
        disabled={isPending}
      />

      <Textarea
        id="description"
        name="description"
        label="Deskripsi Program"
        placeholder="Jelaskan program ini secara faktual: apa yang dilakukan, siapa yang terlibat, dan bagaimana prosesnya."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={fieldErrors.description?.[0]}
        required
        disabled={isPending}
      />

      <Textarea
        id="goal"
        name="goal"
        label="Tujuan Program"
        placeholder="Contoh: Memberikan keterampilan kerajinan bernilai jual bagi 10 anak difabel di kampung"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        error={fieldErrors.goal?.[0]}
        required
        disabled={isPending}
      />

      <Select
        id="status"
        name="status"
        label="Status Siklus Hidup"
        value={status}
        onChange={(e) => setStatus(e.target.value as typeof status)}
        options={SOCIAL_PROGRAM_STATUSES.map((s) => ({
          value: s,
          label: SOCIAL_PROGRAM_STATUS_LABELS[s],
        }))}
        disabled={isPending}
      />

      <Input
        id="target_amount"
        name="target_amount"
        label="Target Dana (Rupiah, Opsional)"
        placeholder="Kosongkan jika program bersifat berkelanjutan/berbasis kebutuhan"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
        error={fieldErrors.target_amount?.[0]}
        disabled={isPending}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          label="Tanggal Mulai (Opsional)"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={isPending}
        />
        <Input
          id="end_date"
          name="end_date"
          type="date"
          label="Tanggal Selesai (Opsional)"
          value={endDate || ""}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={isPending}
        />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-3) var(--space-4)",
          backgroundColor: "var(--color-bg-subtle)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border-subtle)",
          fontSize: "var(--font-size-body-s)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={publicStatus}
          onChange={(e) => setPublicStatus(e.target.checked)}
          disabled={isPending}
        />
        <span>
          Tampilkan di halaman publik <strong>/program</strong> (hanya centang jika data sudah faktual dan siap dipublikasikan)
        </span>
      </label>

      <Button type="submit" variant="primary" isLoading={isPending} disabled={isPending}>
        {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Program"}
      </Button>
    </form>
  );
}
