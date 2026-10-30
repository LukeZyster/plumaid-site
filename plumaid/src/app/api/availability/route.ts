import { NextRequest } from "next/server";
import { getSlots } from "@/lib/availability";
import { getServiceBySlug, json } from "@/lib/booking";
import { hasSupabase } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const slug = req.nextUrl.searchParams.get("service") ?? "";
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);

  const service = await getServiceBySlug(slug);
  if (!service) return json({ error: "unknown_service" }, 400);

  try {
    const slots = await getSlots(date, service.duration_minutes);
    return json({ date, slots });
  } catch (e) {
    console.error("[availability]", e);
    return json({ error: "server_error" }, 500);
  }
}
