import "server-only";
import { db, hasSupabase } from "./supabase/admin";
import type { MediaItem, Review } from "./types";

export async function getMedia(kind?: "video" | "photo", category?: MediaItem["category"]): Promise<MediaItem[]> {
  if (!hasSupabase()) return [];
  try {
    let q = db().from("media_items").select("*").eq("published", true);
    if (kind) q = q.eq("kind", kind);
    if (category) q = q.eq("category", category);
    const { data } = await q.order("sort_order").order("created_at", { ascending: false });
    return (data as MediaItem[]) ?? [];
  } catch {
    return [];
  }
}

export async function getReviews(limit?: number): Promise<Review[]> {
  if (!hasSupabase()) return [];
  try {
    let q = db().from("reviews").select("*").eq("published", true).order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

export async function getReviewStats(): Promise<{ count: number; average: number }> {
  const all = await getReviews();
  if (!all.length) return { count: 0, average: 0 };
  return { count: all.length, average: all.reduce((s, r) => s + r.rating, 0) / all.length };
}
