import { NextRequest } from "next/server";
import { z } from "zod";
import { getByDecisionToken, json } from "@/lib/booking";
import { decideRequest } from "@/lib/decide";
import { hasSupabase } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().min(16),
  action: z.enum(["accept", "decline"]),
  note: z.string().trim().max(500).optional().default(""),
});

/** Plumber pressed Accept / Decline on the page linked from the request email. */
export async function POST(req: NextRequest) {
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);

  const appt = await getByDecisionToken(parsed.data.token);
  if (!appt) return json({ error: "invalid" }, 400);

  const result = await decideRequest(appt, parsed.data.action === "accept", parsed.data.note);
  if (!result.ok) return json(result, result.error === "server_error" ? 500 : 409);
  return json(result);
}
