import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { getAppointment, json, siteUrl } from "@/lib/booking";
import { sendCancelledToCustomer } from "@/lib/email";
import { deleteCalendarEvent } from "@/lib/gcal";
import { db } from "@/lib/supabase/admin";

/** Plumber cancels a booking → customer is emailed, slot is released. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const { id } = await ctx.params;
  const appt = await getAppointment(id);
  if (!appt) return json({ error: "not_found" }, 404);
  if (!["held", "confirmed", "blocked"].includes(appt.status)) return json({ error: "not_cancellable" }, 400);

  await db().from("appointments").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", id);
  await deleteCalendarEvent(appt.google_event_id);

  if (appt.status !== "blocked" && appt.customer_email) {
    await sendCancelledToCustomer(appt, `${siteUrl()}/appointments`).catch((e) =>
      console.error("[admin cancel] customer email failed", e),
    );
  }
  revalidatePath("/admin");
  return json({ ok: true });
}
