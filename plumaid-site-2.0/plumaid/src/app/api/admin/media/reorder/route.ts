import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { json } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";

const schema = z.object({ ids: z.array(z.string().uuid()).min(1).max(200) });

/** Save the order of one list of photos/videos: ids[0] is shown first. */
export async function POST(req: NextRequest) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);
  const results = await Promise.all(
    parsed.data.ids.map((id, index) => db().from("media_items").update({ sort_order: index }).eq("id", id)),
  );
  if (results.some((r) => r.error)) return json({ error: "server_error" }, 500);
  revalidatePath("/");
  revalidatePath("/admin/media");
  return json({ ok: true });
}
