import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getByVerifyToken, json } from "@/lib/booking";
import { sendCancelledToPlumber } from "@/lib/email";
import { deleteCalendarEvent } from "@/lib/gcal";
import { db, hasSupabase } from "@/lib/supabase/admin";

/** Customer cancels via the link in their confirmation email. */
export async function POST(req: NextRequest) {
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  const appt = token ? await getByVerifyToken(token) : null;
  if (!appt) return json({ error: "invalid" }, 400);
  if (appt.status === "cancelled") return json({ ok: true, already: true });
  if (!["held", "pending", "confirmed"].includes(appt.status)) return json({ error: "not_cancellable" }, 400);
  if (new Date(appt.start_at) < new Date()) return json({ error: "past" }, 400);

  await db()
    .from("appointments")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", appt.id);

  await deleteCalendarEvent(appt.google_event_id);
  if (appt.status === "confirmed" || appt.status === "pending") {
    await sendCancelledToPlumber(appt).catch((e) => console.error("[cancel] plumber email failed", e));
  }
  revalidatePath("/admin");
  return json({ ok: true });
}
