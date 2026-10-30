import { NextRequest } from "next/server";
import { z } from "zod";
import { BOOKING } from "@/lib/config";
import { getSlots } from "@/lib/availability";
import { getAppointment, getServiceBySlug, json, newToken, siteUrl } from "@/lib/booking";
import { sendVerificationEmail } from "@/lib/email";
import { hasSupabase, db } from "@/lib/supabase/admin";
import { addMinutes } from "@/lib/time";

const schema = z.object({
  service: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z.string().trim().min(9).max(25).regex(/^[+\d][\d\s()-]{7,}$/),
  address: z.string().trim().min(5).max(200),
  propertyType: z.enum(["residential", "commercial"]),
  notes: z.string().trim().max(1000).optional().default(""),
  website: z.string().optional(), // honeypot
});

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

  // The chosen time must be a real slot for that day/service.
  const slots = await getSlots(b.date, service.duration_minutes);
  const slot = slots.find((s) => s.time === b.time);
  if (!slot) return json({ error: "invalid_slot" }, 400);
  if (!slot.available) return json({ error: "slot_taken" }, 409);

  const start = new Date(slot.start);
  const end = addMinutes(start, service.duration_minutes);
  const blockEnd = addMinutes(end, BOOKING.bufferMinutes);
  const token = newToken();

  // Atomic insert. The database exclusion constraint rejects overlaps even under a race.
  const { data, error } = await db().rpc("create_appointment", {
    p_service_id: service.id,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_block_end: blockEnd.toISOString(),
    p_name: b.name,
    p_email: b.email,
    p_phone: b.phone,
    p_address: b.address,
    p_property_type: b.propertyType,
    p_notes: b.notes || null,
    p_verify_token: token,
    p_hold_minutes: BOOKING.holdMinutes,
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
  try {
    await sendVerificationEmail(appt!, `${siteUrl()}/booking/verify?token=${token}`, BOOKING.holdMinutes);
  } catch (e) {
    console.error("[bookings] verification email failed", e);
    // Release the slot so the customer can retry rather than being stuck with an invisible hold.
    await db().from("appointments").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", data.id);
    return json({ error: "email_failed" }, 502);
  }

  return json({ ok: true, email: b.email });
}
