import { NextRequest } from "next/server";
import { getMonth } from "@/lib/availability";
import { getServiceBySlug, json } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";

/** GET /api/availability/month?month=2026-11[&service=slug] → which days are free / partly booked / full. */
export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month") ?? "";
  const slug = req.nextUrl.searchParams.get("service") ?? "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return json({ error: "invalid" }, 400);

  try {
    const service = slug ? await getServiceBySlug(slug) : null;
    const days = await getMonth(month, service?.duration_minutes ?? 60);
    return json({ month, days, preview: !hasSupabase() });
  } catch (e) {
    console.error("[availability/month]", e);
    return json({ error: "server_error" }, 500);
  }
}
