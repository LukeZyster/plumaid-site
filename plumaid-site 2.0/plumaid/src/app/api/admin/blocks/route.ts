import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { json } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";
import { sastDate } from "@/lib/time";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  from: z.string().regex(/^\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().trim().max(120).default("Unavailable"),
});

/** Plumber blocks out time so customers can't book it. (Cancel a block via the cancel route.) */
export async function POST(req: NextRequest) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);
  const { date, from, to, note } = parsed.data;
  const start = sastDate(date, from);
  const end = sastDate(date, to);
  if (end <= start) return json({ error: "invalid_range" }, 400);

  const { data, error } = await db().rpc("create_block", {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_note: note || "Unavailable",
  });
  if (error) return json({ error: "server_error" }, 500);
  if (!data?.ok) return json({ error: data?.error ?? "server_error" }, 409);
  revalidatePath("/admin");
  return json({ ok: true });
}
