"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { createWasteTypeAction, updateWasteTypeAction } from "@/lib/domain/admin/waste-types";
import type { WasteType } from "@/types/donation";
import styles from "./WasteTypeForm.module.css";

interface WasteTypeFormProps {
  initialData?: WasteType;
  isEdit?: boolean;
}

export function WasteTypeForm({ initialData, isEdit = false }: WasteTypeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [unit, setUnit] = useState(initialData?.unit || "kg");
  const [minQuantity, setMinQuantity] = useState(
    initialData?.min_quantity != null ? String(initialData.min_quantity) : "0.5"
  );
  const [maxQuantity, setMaxQuantity] = useState(
    initialData?.max_quantity != null ? String(initialData.max_quantity) : ""
  );
  const [sortOrder, setSortOrder] = useState(
    initialData?.sort_order != null ? String(initialData.sort_order) : "1"
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [description, setDescription] = useState(initialData?.description || "");
  const [acceptedNotes, setAcceptedNotes] = useState(initialData?.accepted_notes || "");
  const [rejectedNotes, setRejectedNotes] = useState(initialData?.rejected_notes || "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      // Auto-generate slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const payload = {
        name,
        slug,
        unit,
        min_quantity: Number(minQuantity),
        max_quantity: maxQuantity ? Number(maxQuantity) : null,
        sort_order: Number(sortOrder),
        is_active: isActive,
        description,
        accepted_notes: acceptedNotes,
        rejected_notes: rejectedNotes,
      };

      const res = isEdit && initialData
        ? await updateWasteTypeAction(initialData.id, payload)
        : await createWasteTypeAction(payload);

      if (!res.success) {
        setErrorMessage(res.error || "Terjadi kesalahan saat menyimpan data.");
      } else {
        router.push("/admin/waste-types");
        router.refresh();
      }
    });
  };

  return (
    <Card className={styles.card}>
      {errorMessage && (
        <div role="alert" className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="name"
          name="name"
          label="Nama Kategori Limbah"
          placeholder="Contoh: Minyak Jelantah"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          disabled={isPending}
        />

        <div className={styles.twoColumns}>
          <Input
            id="slug"
            name="slug"
            label="Slug (URL identifier)"
            placeholder="minyak-jelantah"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            disabled={isPending}
            helperText="Hanya huruf kecil, angka, dan strip"
          />

          <Input
            id="unit"
            name="unit"
            label="Satuan Ukuran"
            placeholder="L, kg, pcs"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            disabled={isPending}
          />
        </div>

        <div className={styles.threeColumns}>
          <Input
            id="min_quantity"
            name="min_quantity"
            type="number"
            step="0.1"
            label="Kuantitas Minimum"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            required
            disabled={isPending}
          />

          <Input
            id="max_quantity"
            name="max_quantity"
            type="number"
            step="0.1"
            label="Kuantitas Maksimum (Opsional)"
            placeholder="Kosongkan jika bebas"
            value={maxQuantity}
            onChange={(e) => setMaxQuantity(e.target.value)}
            disabled={isPending}
          />

          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            label="Nomor Urut Tampil"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            required
            disabled={isPending}
          />
        </div>

        <Textarea
          id="description"
          name="description"
          label="Deskripsi / Penjelasan Singkat"
          placeholder="Jelaskan karakteristik dan potensi manfaat pengolahan limbah ini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isPending}
        />

        <Textarea
          id="accepted_notes"
          name="accepted_notes"
          label="Ketentuan Kondisi Diterima"
          placeholder="Petunjuk kemasan atau kebersihan yang diharapkan dari donatur..."
          value={acceptedNotes}
          onChange={(e) => setAcceptedNotes(e.target.value)}
          rows={3}
          disabled={isPending}
        />

        <Textarea
          id="rejected_notes"
          name="rejected_notes"
          label="Ketentuan Kondisi Ditolak"
          placeholder="Jenis cemaran atau kondisi yang tidak dapat diolah..."
          value={rejectedNotes}
          onChange={(e) => setRejectedNotes(e.target.value)}
          rows={3}
          disabled={isPending}
        />

        <div className={styles.checkboxRow}>
          <Checkbox
            id="is_active"
            label="Kategori limbah aktif dan dapat dipilih di form donasi"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            {isEdit ? "Simpan Perubahan" : "Tambah Jenis Limbah"}
          </Button>
          <Link href="/admin/waste-types">
            <Button type="button" variant="secondary" size="md" disabled={isPending}>
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
