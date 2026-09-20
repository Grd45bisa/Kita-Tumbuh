"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  type ProductCategory,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
} from "@/lib/validation/product-schema";
import { createProductAction, updateProductAction } from "@/lib/domain/admin/products";

export interface BatchOption {
  id: string;
  batch_number: string;
  title: string;
  target_output_type: string;
  actual_output_quantity: number;
  output_unit: string;
}

export interface InitialProductData {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  story?: string | null;
  category: ProductCategory;
  production_batch_id?: string | null;
  price: number;
  currency: string;
  stock_quantity: number;
  unit: string;
  image_url?: string | null;
  is_public: boolean;
}

interface ProductFormProps {
  initialData?: InitialProductData;
  batches: BatchOption[];
}

export function ProductForm({ initialData, batches }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = !!initialData;

  const [sku, setSku] = useState(initialData?.sku || "");
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [story, setStory] = useState(initialData?.story || "");
  const [category, setCategory] = useState<ProductCategory>(initialData?.category || "MINYAK_JELANTAH");
  const [productionBatchId, setProductionBatchId] = useState(initialData?.production_batch_id || "");
  const [price, setPrice] = useState(initialData ? String(initialData.price) : "");
  const [stockQuantity, setStockQuantity] = useState(initialData ? String(initialData.stock_quantity) : "0");
  const [unit, setUnit] = useState(initialData?.unit || "Pcs");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      story: story.trim() || "",
      category,
      production_batch_id: productionBatchId || null,
      price: Number(price),
      currency: "IDR",
      stock_quantity: Number(stockQuantity),
      unit: unit.trim() || "Pcs",
      image_url: imageUrl.trim() || null,
      is_public: isPublic,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateProductAction(initialData.id, payload)
        : await createProductAction(payload);

      if (!res.success) {
        setFormError(res.error || "Gagal menyimpan data produk.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }

      router.push("/admin/products");
    });
  };

  const categoryOptions = PRODUCT_CATEGORIES.map((c) => ({
    value: c,
    label: PRODUCT_CATEGORY_LABELS[c],
  }));

  const batchOptions = [
    { value: "", label: "-- Tanpa Tautan Batch Khusus --" },
    ...batches.map((b) => ({
      value: b.id,
      label: `${b.batch_number} — ${b.title} (${b.actual_output_quantity} ${b.output_unit})`,
    })),
  ];

  return (
    <Card style={{ padding: "var(--space-6)" }}>
      {formError && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "rgba(180, 83, 9, 0.1)",
            border: "1px solid var(--color-earth-500)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-earth-700)",
            marginBottom: "var(--space-5)",
            fontSize: "0.875rem",
          }}
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          <Input
            id="sku"
            name="sku"
            label="SKU Produk (Stock Keeping Unit)"
            placeholder="Contoh: PROD-SBN-01"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            required
            disabled={isPending}
            error={fieldErrors.sku?.[0]}
            helperText="Kode identifikasi stok unik, format huruf, angka, dan strip."
          />

          <Input
            id="name"
            name="name"
            label="Nama Produk Sirkular"
            placeholder="Contoh: Sabun Cuci Serbaguna Minyak Jelantah"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.name?.[0]}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          <Input
            id="slug"
            name="slug"
            label="Slug URL Publik"
            placeholder="sabun-cuci-serbaguna-minyak-jelantah"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            required
            disabled={isPending}
            error={fieldErrors.slug?.[0]}
            helperText="URL halaman detail: /produk/[slug]"
          />

          <Select
            id="category"
            name="category"
            label="Kategori Produk"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            required
            disabled={isPending}
            error={fieldErrors.category?.[0]}
          />
        </div>

        <Select
          id="production_batch_id"
          name="production_batch_id"
          label="Tautan Batch Produksi Asal (Traceability)"
          options={batchOptions}
          value={productionBatchId}
          onChange={(e) => setProductionBatchId(e.target.value)}
          disabled={isPending}
          error={fieldErrors.production_batch_id?.[0]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
          <Input
            id="price"
            name="price"
            type="number"
            step="100"
            label="Harga Jual (Rp Integer)"
            placeholder="15000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.price?.[0]}
            helperText="DATABASE.md: simpan integer Rupiah bulat (tanpa koma/desimal)."
          />

          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            step="1"
            label="Kuantitas Stok Tersedia"
            placeholder="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.stock_quantity?.[0]}
          />

          <Input
            id="unit"
            name="unit"
            label="Satuan Produk"
            placeholder="Pcs / Botol / Batang"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            disabled={isPending}
            error={fieldErrors.unit?.[0]}
          />
        </div>

        <Textarea
          id="description"
          name="description"
          label="Deskripsi Produk Lengkap"
          placeholder="Komposisi, cara penggunaan, dan keunggulan produk hasil olahan limbah ini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          disabled={isPending}
          error={fieldErrors.description?.[0]}
        />

        <Textarea
          id="story"
          name="story"
          label="Cerita Dampak & Bahan Baku (Storytelling Sirkular)"
          placeholder="Produk ini dibuat dari 10 liter minyak jelantah sumbangan warga yang diolah bersama mitra difabel..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={2}
          disabled={isPending}
          error={fieldErrors.story?.[0]}
          hint="Cerita yang menghubungkan donasi limbah dengan produk bernilai untuk transparansi publik."
        />

        <Input
          id="image_url"
          name="image_url"
          label="URL Gambar Produk (Opsional)"
          placeholder="https://... atau /images/products/..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={isPending}
          error={fieldErrors.image_url?.[0]}
          helperText="Tautan file gambar produk yang akan ditampilkan pada katalog."
        />

        {/* Public Visibility Toggle */}
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-paper-50)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, display: "block" }}>
              Tampilkan di Katalog Publik (/produk)
            </span>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-ink-600)" }}>
              Jika aktif, pengunjung website publik dapat melihat produk ini di halaman katalog.
            </span>
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isPending}
              style={{ width: "20px", height: "20px", accentColor: "var(--color-brand-primary)", cursor: "pointer" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => router.push("/admin/products")}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            {isEdit ? "Simpan Perubahan Produk" : "Daftarkan Produk Sirkular"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
