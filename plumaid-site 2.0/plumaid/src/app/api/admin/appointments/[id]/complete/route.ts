import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { getAppointment, json, newToken, siteUrl } from "@/lib/booking";
import { sendReviewRequest } from "@/lib/email";
import { db } from "@/lib/supabase/admin";

/** Plumber marks the job done → review email is triggered. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const { id } = await ctx.params;
  const appt = await getAppointment(id);
  if (!appt) return json({ error: "not_found" }, 404);
  if (appt.status === "completed") return json({ error: "already_completed" }, 409);
  if (appt.status !== "confirmed") return json({ error: "not_confirmed" }, 400);

  const reviewToken = newToken();
  const now = new Date().toISOString();
  const { error } = await db()
    .from("appointments")
    .update({ status: "completed", completed_at: now, review_token: reviewToken })
    .eq("id", id)
    .eq("status", "confirmed"); // guards against double-clicks
  if (error) return json({ error: "server_error" }, 500);

  let emailed = true;
  try {
    await sendReviewRequest({ ...appt, review_token: reviewToken }, `${siteUrl()}/review/${reviewToken}`);
    await db().from("appointments").update({ review_requested_at: new Date().toISOString() }).eq("id", id);
  } catch (e) {
    console.error("[complete] review email failed", e);
    emailed = false;
  }
  revalidatePath("/admin");
  return json({ ok: true, emailed });
}
