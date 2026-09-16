import { createClient } from "@/lib/supabase/server";
import type { CollectionPoint } from "@/types/donation";

/**
 * Fetch all active collection points.
 * Server-side only — public data, safe to pass to client as props.
 * Note: full address is included because collection points are public locations.
 */
export async function getCollectionPoints(): Promise<CollectionPoint[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_points")
    .select(
      "id, code, name, address, district, city, phone, operating_hours, accepted_waste_slugs, notes"
    )
    .eq("is_active", true)
    .order("code", { ascending: true });

  if (error) {
    console.error("[collection-points] fetch error:", error.message);
    return [];
  }

  return (data ?? []) as CollectionPoint[];
}

/**
 * Fetch a single collection point by id.
 * Used during server-side validation of drop-off donations.
 */
export async function getCollectionPointById(
  id: string
): Promise<CollectionPoint | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_points")
    .select(
      "id, code, name, address, district, city, phone, operating_hours, accepted_waste_slugs, notes"
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as CollectionPoint;
}
