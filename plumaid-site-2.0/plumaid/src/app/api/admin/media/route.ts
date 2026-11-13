import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { json, newToken } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";

const BUCKET = "media";
const ALLOWED: Record<string, "video" | "photo"> = {
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "image/jpeg": "photo",
  "image/png": "photo",
  "image/webp": "photo",
};
const EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Step 1: ask for a signed upload URL (browser then uploads the big file straight to Supabase,
 *         bypassing Vercel's 4.5 MB request limit).
 */
const signSchema = z.object({
  action: z.literal("sign"),
  contentType: z.string(),
  category: z.enum(["hero", "job", "team", "business"]),
});

/** Step 2: register the uploaded file so it appears on the site. */
const saveSchema = z.object({
  action: z.literal("save"),
  path: z.string().min(3),
  contentType: z.string(),
  category: z.enum(["hero", "job", "team", "business"]),
  title: z.string().trim().max(80).default(""),
  caption: z.string().trim().max(200).default(""),
});

export async function POST(req: NextRequest) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const body = await req.json().catch(() => null);

  const sign = signSchema.safeParse(body);
  if (sign.success) {
    const kind = ALLOWED[sign.data.contentType];
    if (!kind) return json({ error: "unsupported_type" }, 400);
    const path = `${sign.data.category}/${Date.now()}-${newToken().slice(0, 8)}.${EXT[sign.data.contentType]}`;
    const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) return json({ error: "sign_failed", detail: error.message }, 500);
    return json({ ok: true, path, token: data.token });
  }

  const save = saveSchema.safeParse(body);
  if (save.success) {
    const kind = ALLOWED[save.data.contentType];
    if (!kind || !save.data.path.startsWith(`${save.data.category}/`)) return json({ error: "invalid" }, 400);
    const { data: pub } = db().storage.from(BUCKET).getPublicUrl(save.data.path);
    // New items go to the END of their list (the hero goes first, so a new hero shows straight away).
    const { data: edge } = await db()
      .from("media_items")
      .select("sort_order")
      .eq("category", save.data.category)
      .order("sort_order", { ascending: save.data.category === "hero" })
      .limit(1);
    const edgeOrder = edge?.[0]?.sort_order ?? 0;
    const sort_order = save.data.category === "hero" ? edgeOrder - 1 : edgeOrder + 1;
    const { error } = await db().from("media_items").insert({
      sort_order,
      kind,
      category: save.data.category,
      title: save.data.title,
      caption: save.data.caption,
      storage_path: save.data.path,
      public_url: pub.publicUrl,
    });
    if (error) return json({ error: "server_error" }, 500);
    revalidatePath("/");
    revalidatePath("/admin/media");
    return json({ ok: true });
  }

  return json({ error: "invalid" }, 400);
}
