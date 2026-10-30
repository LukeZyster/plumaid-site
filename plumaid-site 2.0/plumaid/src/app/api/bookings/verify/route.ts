import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAppointment, json, siteUrl } from "@/lib/booking";
import { sendConfirmationEmail, sendPlumberNotification } from "@/lib/email";
import { createCalendarEvent } from "@/lib/gcal";
import { db, hasSupabase } from "@/lib/supabase/admin";
import { formatDate, formatTime } from "@/lib/time";

export async function POST(req: NextRequest) {
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token) return json({ error: "invalid" }, 400);

  const { data, error } = await db().rpc("verify_appointment", { p_token: token });
  if (error) {
    console.error("[verify] rpc", error);
    return json({ error: "server_error" }, 500);
  }
  if (!data?.ok) return json({ error: data?.error ?? "invalid" }, data?.error === "slot_taken" ? 409 : 400);

  // Already verified earlier → don't re-send everything.
  if (data.already) return json({ ok: true, already: true });

  const appt = await getAppointment(data.id);
  if (!appt) return json({ ok: true });

  // 1) On the plumber's calendar (optional Google Calendar sync; the admin calendar + .ics feed always work)
  const eventId = await createCalendarEvent({
    summary: `${appt.services?.name ?? "Plumbing"}: ${appt.customer_name}`,
    description: `Customer: ${appt.customer_name}\nPhone: ${appt.customer_phone}\nEmail: ${appt.customer_email}\n${appt.notes ? `Notes: ${appt.notes}` : ""}`,
    location: appt.address ?? "",
    start: new Date(appt.start_at),
    end: new Date(appt.end_at),
  });
  if (eventId) await db().from("appointments").update({ google_event_id: eventId }).eq("id", appt.id);

  // 2) Confirmation to the customer + notification to the plumber (independent: one failing doesn't block the other)
  const results = await Promise.allSettled([
    sendConfirmationEmail(appt, `${siteUrl()}/booking/cancel?token=${token}`),
    sendPlumberNotification(appt, `${siteUrl()}/admin`),
  ]);
  results.forEach((r, i) => r.status === "rejected" && console.error(`[verify] email ${i} failed`, r.reason));

  revalidatePath("/admin");
  return json({
    ok: true,
    when: `${formatDate(appt.start_at)} at ${formatTime(appt.start_at)}`,
  });
}
