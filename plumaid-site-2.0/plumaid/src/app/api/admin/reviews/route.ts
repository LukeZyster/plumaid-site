import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { json, newToken } from "@/lib/booking";
import { db } from "@/lib/supabase/admin";

const IMAGE_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const signSchema = z.object({ action: z.literal("sign"), contentType: z.string() });
const createSchema = z.object({
  action: z.literal("create"),
  name: z.string().trim().max(80).default(""),
  anonymous: z.boolean().default(false),
  source: z.enum(["whatsapp", "facebook", "google", "sms", "email", "in_person", "other"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1500).default(""),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  screenshotPath: z.string().startsWith("reviews/").optional(),
  published: z.boolean().default(true),
});

/**
 * The plumber adds a review he received elsewhere (WhatsApp, Facebook, Google, in person…).
 *  1. {action:"sign"} → one-time upload URL for an optional screenshot
 *  2. {action:"create"} → saves the review
 */
export async function POST(req: NextRequest) {
  if (!(await getAdmin())) return json({ error: "unauthorized" }, 401);
  const body = await req.json().catch(() => null);

  const sign = signSchema.safeParse(body);
  if (sign.success) {
    const ext = IMAGE_EXT[sign.data.contentType];
    if (!ext) return json({ error: "unsupported_type" }, 400);
    const path = `reviews/${Date.now()}-${newToken().slice(0, 8)}.${ext}`;
    const { data, error } = await db().storage.from("media").createSignedUploadUrl(path);
    if (error) return json({ error: "sign_failed", detail: error.message }, 500);
    return json({ ok: true, path, token: data.token });
  }

  const c = createSchema.safeParse(body);
  if (!c.success) return json({ error: "invalid", fields: c.error.issues.map((i) => i.path.join(".")) }, 400);
  const r = c.data;
  if (!r.anonymous && !r.name) return json({ error: "name_required" }, 400);
  if (!r.comment && !r.screenshotPath) return json({ error: "need_text_or_screenshot" }, 400);

  const screenshot_url = r.screenshotPath ? db().storage.from("media").getPublicUrl(r.screenshotPath).data.publicUrl : null;
  const { error } = await db().from("reviews").insert({
    appointment_id: null,
    reviewer_name: r.anonymous ? "Anonymous" : r.name,
    anonymous: r.anonymous,
    source: r.source,
    rating: r.rating,
    comment: r.comment,
    review_date: r.reviewDate || null,
    screenshot_url,
    storage_path: r.screenshotPath ?? null,
    published: r.published,
  });
  if (error) {
    console.error("[admin reviews] insert", error);
    return json({ error: /column|constraint/i.test(error.message) ? "needs_migration" : "server_error", detail: error.message }, 500);
  }
  revalidatePath("/reviews");
  revalidatePath("/");
  revalidatePath("/admin/reviews");
  return json({ ok: true });
}
