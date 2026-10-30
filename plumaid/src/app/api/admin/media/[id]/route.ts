import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { json } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const { id } = await ctx.params;
  const { data: item } = await db().from("media_items").select("storage_path").eq("id", id).maybeSingle();
  if (!item) return json({ error: "not_found" }, 404);
  await db().storage.from("media").remove([item.storage_path]);
  await db().from("media_items").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/media");
  return json({ ok: true });
}
