import { NextRequest } from "next/server";
import { z } from "zod";
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

const ALLOWED: Record<string, "video" | "photo"> = {
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "image/jpeg": "photo",
  "image/png": "photo",
  "image/webp": "photo",
};

const patchSchema = z.object({
  published: z.boolean().optional(),
  title: z.string().trim().max(80).optional(),
  caption: z.string().trim().max(200).optional(),
  category: z.enum(["hero", "job", "team", "business"]).optional(),
  // replacing the file: the browser has already uploaded it to this path via a signed URL
  path: z.string().min(3).optional(),
  contentType: z.string().optional(),
});

/** Edit an item: show/hide, title, caption, which section it is in, or swap the photo/video itself. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !Object.keys(parsed.data).length) return json({ error: "invalid" }, 400);
  const { path, contentType, ...fields } = parsed.data;

  const { data: item } = await db().from("media_items").select("storage_path").eq("id", id).maybeSingle();
  if (!item) return json({ error: "not_found" }, 404);

  const update: Record<string, unknown> = { ...fields };
  if (path) {
    const kind = contentType ? ALLOWED[contentType] : undefined;
    if (!kind || path.includes("..")) return json({ error: "invalid" }, 400);
    update.kind = kind;
    update.storage_path = path;
    update.public_url = db().storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await db().from("media_items").update(update).eq("id", id);
  if (error) return json({ error: "server_error" }, 500);
  // remove the old file once the new one is in place
  if (path && item.storage_path !== path) await db().storage.from("media").remove([item.storage_path]);
  revalidatePath("/");
  revalidatePath("/admin/media");
  return json({ ok: true });
}
