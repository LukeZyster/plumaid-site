import { NextRequest } from "next/server";
import { getMonth } from "@/lib/availability";
import { json } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";

/**
 * GET /api/availability/month?month=2026-11&duration=60 → which days are free / partly booked / full.
 * One database round trip, and a short CDN cache so the calendar shows up straight away.
 * (The per-day times and the booking itself are always live, so a slightly old overview can't double-book.)
 */
export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month") ?? "";
  const dur = Number(req.nextUrl.searchParams.get("duration") ?? 60);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return json({ error: "invalid" }, 400);
  const duration = Number.isFinite(dur) ? Math.min(480, Math.max(30, Math.round(dur))) : 60;

  try {
    const days = await getMonth(month, duration);
    const res = json({ month, days, preview: !hasSupabase() });
    res.headers.set("Cache-Control", "public, s-maxage=20, stale-while-revalidate=120");
    return res;
  } catch (e) {
    console.error("[availability/month]", e);
    return json({ error: "server_error" }, 500);
  }
}
