import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getByReviewToken, json } from "@/lib/booking";
import { db, hasSupabase } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().min(16),
  rating: z.number().int().min(1).max(5),
  name: z.string().trim().min(1).max(60),
  comment: z.string().trim().max(1200).default(""),
});

/** Customer submits a review using the one-time link from the "job complete" email. */
export async function POST(req: NextRequest) {
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);
  const { token, rating, name, comment } = parsed.data;

  const appt = await getByReviewToken(token);
  if (!appt || appt.status !== "completed") return json({ error: "invalid_link" }, 400);

  const { error } = await db()
    .from("reviews")
    .insert({ appointment_id: appt.id, reviewer_name: name, rating, comment });
  if (error) {
    if (error.code === "23505") return json({ error: "already_reviewed" }, 409); // unique(appointment_id)
    console.error("[reviews]", error);
    return json({ error: "server_error" }, 500);
  }
  revalidatePath("/reviews");
  revalidatePath("/");
  return json({ ok: true });
}
