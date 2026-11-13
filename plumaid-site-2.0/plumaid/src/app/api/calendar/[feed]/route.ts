import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { buildIcs } from "@/lib/ics";
import { db, hasSupabase } from "@/lib/supabase/admin";
import type { Appointment } from "@/lib/types";

/**
 * Private, subscribable calendar feed of every confirmed appointment.
 * Add this URL to Google Calendar / Apple Calendar / Outlook ("From URL"):
 *   https://YOUR-SITE/api/calendar/<CALENDAR_FEED_SECRET>.ics
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ feed: string }> }) {
  const { feed } = await ctx.params;
  const given = Buffer.from(feed.replace(/\.ics$/, ""));
  const secret = Buffer.from(process.env.CALENDAR_FEED_SECRET ?? "");
  if (!secret.length || given.length !== secret.length || !timingSafeEqual(given, secret) || !hasSupabase()) {
    return new Response("Not found", { status: 404 });
  }

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await db()
    .from("appointments")
    .select("*, services(name, duration_minutes)")
    .in("status", ["confirmed", "completed", "blocked"])
    .gte("start_at", since)
    .order("start_at");

  const events = ((data as Appointment[]) ?? []).map((a) => {
    const blocked = a.status === "blocked";
    const name = a.services?.name ?? "Plumbing";
    return {
      uid: a.id,
      start: new Date(a.start_at),
      end: new Date(a.end_at),
      summary: blocked ? `Unavailable: ${a.notes || "blocked"}` : `${a.status === "completed" ? "Done: " : ""}${name}: ${a.customer_name}`,
      location: a.address ?? undefined,
      description: blocked
        ? "Blocked time"
        : `Customer: ${a.customer_name}\nPhone: ${a.customer_phone}\nEmail: ${a.customer_email}${a.notes ? `\nNotes: ${a.notes}` : ""}`,
    };
  });

  return new Response(buildIcs(events, { name: "PlumAid Appointments" }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
