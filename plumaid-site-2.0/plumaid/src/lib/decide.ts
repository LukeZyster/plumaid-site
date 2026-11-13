import "server-only";
import { revalidatePath } from "next/cache";
import { getAppointment, siteUrl } from "./booking";
import { sendConfirmationEmail, sendDeclinedEmail } from "./email";
import { createCalendarEvent } from "./gcal";
import { db } from "./supabase/admin";
import type { Appointment } from "./types";

export type DecideResult =
  | { ok: true; status: "confirmed" | "declined"; emailed: boolean; already?: boolean }
  | { ok: false; error: "not_pending" | "past" | "server_error"; status?: string };

/**
 * The plumber accepts or declines a pending request (from the email link or the admin dashboard).
 * The customer is emailed the outcome either way.
 */
export async function decideRequest(appt: Appointment, accept: boolean, note: string): Promise<DecideResult> {
  const wanted = accept ? "confirmed" : "declined";
  if (appt.status === wanted) return { ok: true, status: wanted, emailed: true, already: true };
  if (appt.status !== "pending") return { ok: false, error: "not_pending", status: appt.status };
  if (accept && new Date(appt.start_at) < new Date()) return { ok: false, error: "past" };

  const now = new Date().toISOString();
  const patch = accept
    ? { status: "confirmed", decided_at: now, verified_at: now, decision_note: note || null }
    : { status: "declined", decided_at: now, declined_at: now, decision_note: note || null };

  // Only flips if it is STILL pending (protects against double clicks / two devices).
  const { data, error } = await db()
    .from("appointments")
    .update(patch)
    .eq("id", appt.id)
    .eq("status", "pending")
    .select("id");
  if (error) {
    console.error("[decide] update failed", error);
    return { ok: false, error: "server_error" };
  }
  if (!data?.length) {
    const fresh = await getAppointment(appt.id);
    if (fresh?.status === wanted) return { ok: true, status: wanted, emailed: true, already: true };
    return { ok: false, error: "not_pending", status: fresh?.status };
  }

  const updated = (await getAppointment(appt.id)) ?? appt;
  let emailed = true;

  if (accept) {
    // Optional direct Google Calendar sync (the admin calendar + .ics feed always work).
    const eventId = await createCalendarEvent({
      summary: `${updated.services?.name ?? "Plumbing"}: ${updated.customer_name}`,
      description: `Customer: ${updated.customer_name}\nPhone: ${updated.customer_phone}\nEmail: ${updated.customer_email}\n${updated.notes ? `Message: ${updated.notes}` : ""}`,
      location: updated.address ?? "",
      start: new Date(updated.start_at),
      end: new Date(updated.end_at),
    }).catch(() => null);
    if (eventId) await db().from("appointments").update({ google_event_id: eventId }).eq("id", updated.id);

    await sendConfirmationEmail(updated, `${siteUrl()}/booking/cancel?token=${updated.verify_token}`, note).catch((e) => {
      console.error("[decide] confirmation email failed", e);
      emailed = false;
    });
  } else {
    await sendDeclinedEmail(updated, `${siteUrl()}/appointments`, note).catch((e) => {
      console.error("[decide] declined email failed", e);
      emailed = false;
    });
  }

  revalidatePath("/admin");
  return { ok: true, status: wanted, emailed };
}
