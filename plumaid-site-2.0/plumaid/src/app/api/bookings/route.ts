import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BOOKING } from "@/lib/config";
import { getSlots } from "@/lib/availability";
import { getAppointment, getServiceBySlug, isRealService, json, newToken, siteUrl } from "@/lib/booking";
import { sendPlumberRequest, sendRequestReceived } from "@/lib/email";
import { hasSupabase, db } from "@/lib/supabase/admin";
import { addMinutes } from "@/lib/time";

const schema = z.object({
  service: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  firstName: z.string().trim().min(1).max(40),
  lastName: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z.string().trim().min(9).max(25).regex(/^[+\d][\d\s()-]{7,}$/),
  address: z.string().trim().max(200).optional().default(""),
  propertyType: z.enum(["residential", "commercial"]).default("residential"),
  message: z.string().trim().max(1500).optional().default(""),
  website: z.string().optional(), // honeypot
});

/**
 * Customer sends a booking REQUEST from the calendar pop-up.
 * The time is reserved as "pending", the plumber gets an email with Accept / Decline,
 * and the customer gets a "we received your request" email.
 */
export async function POST(req: NextRequest) {
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: "invalid", fields: parsed.error.issues.map((i) => i.path.join(".")) }, 400);
  }
  const b = parsed.data;

  // Honeypot: bots fill the hidden field. Pretend success, do nothing.
  if (b.website) return json({ ok: true });

  const service = await getServiceBySlug(b.service);
  if (!service) return json({ error: "unknown_service" }, 400);
  if (!isRealService(service)) return json({ error: "not_configured" }, 503);

  // The chosen time must be a real, free slot for that day/service.
  const slots = await getSlots(b.date, service.duration_minutes);
  const slot = slots.find((s) => s.time === b.time);
  if (!slot) return json({ error: "invalid_slot" }, 400);
  if (!slot.available) return json({ error: "slot_taken" }, 409);

  const start = new Date(slot.start);
  const end = addMinutes(start, service.duration_minutes);
  const blockEnd = addMinutes(end, BOOKING.bufferMinutes);
  const customerToken = newToken();
  const decisionToken = newToken();
  const name = `${b.firstName} ${b.lastName}`.trim();

  // Atomic insert. The database exclusion constraint rejects overlaps even under a race.
  const { data, error } = await db().rpc("create_request", {
    p_service_id: service.id,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_block_end: blockEnd.toISOString(),
    p_name: name,
    p_email: b.email,
    p_phone: b.phone,
    p_address: b.address,
    p_property_type: b.propertyType,
    p_notes: b.message || null,
    p_customer_token: customerToken,
    p_decision_token: decisionToken,
  });

  if (error) {
    console.error("[bookings] rpc error", error);
    return json({ error: "server_error" }, 500);
  }
  if (!data?.ok) {
    if (data?.error === "slot_taken") return json({ error: "slot_taken" }, 409);
    if (data?.error === "rate_limited") return json({ error: "rate_limited" }, 429);
    return json({ error: "server_error" }, 500);
  }

  const appt = await getAppointment(data.id);
  if (!appt) return json({ error: "server_error" }, 500);

  const base = siteUrl();
  const [plumber, customer] = await Promise.allSettled([
    sendPlumberRequest(
      appt,
      `${base}/booking/respond?token=${decisionToken}&action=accept`,
      `${base}/booking/respond?token=${decisionToken}&action=decline`,
      `${base}/admin?d=${b.date}`,
    ),
    sendRequestReceived(appt, `${base}/booking/cancel?token=${customerToken}`),
  ]);

  if (plumber.status === "rejected") {
    console.error("[bookings] plumber email failed", plumber.reason);
    // The plumber MUST hear about it. Release the time so the customer can phone instead.
    await db().from("appointments").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", appt.id);
    return json({ error: "email_failed" }, 502);
  }
  if (customer.status === "rejected") console.error("[bookings] customer receipt failed", customer.reason);

  revalidatePath("/admin");
  return json({ ok: true, email: b.email, customerEmailed: customer.status === "fulfilled" });
}
