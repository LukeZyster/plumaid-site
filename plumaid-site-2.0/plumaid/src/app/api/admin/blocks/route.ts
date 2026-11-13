import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { json } from "@/lib/booking";
import { BOOKING } from "@/lib/config";
import { db } from "@/lib/supabase/admin";
import { addDays, sastDate, weekdayOf } from "@/lib/time";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  allDay: z.boolean().default(false),
  from: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  to: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  note: z.string().trim().max(120).default("Unavailable"),
});

/**
 * Plumber marks time as booked/unavailable so customers can't request it.
 * One day, or a range of days (e.g. leave). "All day" uses the opening hours of each day.
 * (Remove a block with the cancel route.)
 */
export async function POST(req: NextRequest) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);
  const { date, allDay, from, to, note } = parsed.data;
  const until = parsed.data.until && parsed.data.until >= date ? parsed.data.until : date;
  if (!allDay && (!from || !to || to <= from)) return json({ error: "invalid_range" }, 400);

  let created = 0;
  const clashes: string[] = [];
  let d = date;
  for (let i = 0; i < 62 && d <= until; i++, d = addDays(d, 1)) {
    const hours = BOOKING.hours[weekdayOf(d)];
    if (allDay && !hours) continue; // closed anyway
    const [a, b] = allDay ? hours : [from!, to!];
    const { data, error } = await db().rpc("create_block", {
      p_start: sastDate(d, a).toISOString(),
      p_end: sastDate(d, b).toISOString(),
      p_note: note || "Unavailable",
    });
    if (error) return json({ error: "server_error" }, 500);
    if (data?.ok) created++;
    else clashes.push(d);
  }

  revalidatePath("/admin");
  if (!created && clashes.length) return json({ error: "overlaps_booking", clashes }, 409);
  return json({ ok: true, created, clashes });
}
