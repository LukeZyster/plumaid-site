import { NextRequest } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { getAppointment, json } from "@/lib/booking";
import { decideRequest } from "@/lib/decide";

const schema = z.object({
  action: z.enum(["accept", "decline"]),
  note: z.string().trim().max(500).optional().default(""),
});

/** Accept / decline a pending request from the admin dashboard. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);

  const appt = await getAppointment(id);
  if (!appt) return json({ error: "not_found" }, 404);

  const result = await decideRequest(appt, parsed.data.action === "accept", parsed.data.note);
  if (!result.ok) return json(result, result.error === "server_error" ? 500 : 409);
  return json(result);
}
