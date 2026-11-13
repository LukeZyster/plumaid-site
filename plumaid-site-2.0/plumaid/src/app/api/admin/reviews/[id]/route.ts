import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { json } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";

/** Show / hide a review on the public site. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const { id } = await ctx.params;
  const { published } = (await req.json().catch(() => ({}))) as { published?: boolean };
  if (typeof published !== "boolean") return json({ error: "invalid" }, 400);
  await db().from("reviews").update({ published }).eq("id", id);
  revalidatePath("/reviews");
  revalidatePath("/");
  revalidatePath("/admin");
  return json({ ok: true });
}
