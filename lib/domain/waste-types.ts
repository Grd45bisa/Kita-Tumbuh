import { createClient } from "@/lib/supabase/server";
import type { WasteType } from "@/types/donation";

/**
 * Fetch all active waste types ordered by sort_order.
 * Server-side only — called from Server Components or Server Actions.
 */
export async function getWasteTypes(): Promise<WasteType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("waste_types")
    .select(
      "id, slug, name, description, unit, min_quantity, max_quantity, accepted_notes, rejected_notes, sort_order"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[waste-types] fetch error:", error.message);
    return [];
  }

  return (data ?? []) as WasteType[];
}

/**
 * Fetch a single active waste type by slug.
 * Used for server-side validation during donation submission.
 */
export async function getWasteTypeBySlug(
  slug: string
): Promise<WasteType | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("waste_types")
    .select(
      "id, slug, name, description, unit, min_quantity, max_quantity, accepted_notes, rejected_notes, sort_order"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as WasteType;
}
