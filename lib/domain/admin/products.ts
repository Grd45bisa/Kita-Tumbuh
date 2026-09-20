"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { ProductSchema, type ProductInput } from "@/lib/validation/product-schema";

export interface ProductActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Creates a new circular product record.
 */
export async function createProductAction(
  rawInput: ProductInput
): Promise<ProductActionResult<{ id: string; slug: string }>> {
  await requirePermission("product_catalog", "write");

  const parsed = ProductSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Data produk tidak valid. Periksa formulir.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      sku: parsed.data.sku.toUpperCase(),
      name: parsed.data.name,
      slug: parsed.data.slug.toLowerCase(),
      description: parsed.data.description,
      story: parsed.data.story || null,
      category: parsed.data.category,
      production_batch_id: parsed.data.production_batch_id || null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      stock_quantity: parsed.data.stock_quantity,
      unit: parsed.data.unit,
      image_url: parsed.data.image_url || null,
      is_public: parsed.data.is_public,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "SKU atau Slug produk sudah pernah digunakan. Mohon gunakan nilai yang unik.",
      };
    }
    return {
      success: false,
      error: `Gagal menyimpan produk: ${insertError.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/produk");

  return { success: true, data: product };
}

/**
 * Updates an existing circular product record.
 */
export async function updateProductAction(
  productId: string,
  rawInput: ProductInput
): Promise<ProductActionResult<{ id: string; slug: string }>> {
  await requirePermission("product_catalog", "write");

  const parsed = ProductSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Data produk tidak valid. Periksa formulir.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: updated, error: updateError } = await supabase
    .from("products")
    .update({
      sku: parsed.data.sku.toUpperCase(),
      name: parsed.data.name,
      slug: parsed.data.slug.toLowerCase(),
      description: parsed.data.description,
      story: parsed.data.story || null,
      category: parsed.data.category,
      production_batch_id: parsed.data.production_batch_id || null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      stock_quantity: parsed.data.stock_quantity,
      unit: parsed.data.unit,
      image_url: parsed.data.image_url || null,
      is_public: parsed.data.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id, slug")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        success: false,
        error: "SKU atau Slug produk sudah terdaftar untuk produk lain.",
      };
    }
    return {
      success: false,
      error: `Gagal memperbarui produk: ${updateError.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/produk");
  revalidatePath(`/produk/${updated.slug}`);

  return { success: true, data: updated };
}

/**
 * Toggles product public visibility on the public website catalog.
 */
export async function toggleProductVisibilityAction(
  productId: string,
  isPublic: boolean
): Promise<ProductActionResult<{ is_public: boolean }>> {
  await requirePermission("product_catalog", "write");

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      error: `Gagal mengubah visibilitas produk: ${error.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/produk");

  return { success: true, data: { is_public: isPublic } };
}
