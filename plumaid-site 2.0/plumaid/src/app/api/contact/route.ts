import { NextRequest } from "next/server";
import { z } from "zod";
import { json } from "@/lib/booking";
import { sendContactMessage } from "@/lib/email";
import { db, hasSupabase } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z.string().trim().max(25).optional().default(""),
  message: z.string().trim().min(10).max(3000),
  website: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);
  const m = parsed.data;
  if (m.website) return json({ ok: true });

  if (hasSupabase()) {
    const { error } = await db()
      .from("contact_messages")
      .insert({ name: m.name, email: m.email, phone: m.phone || null, message: m.message });
    if (error) console.error("[contact] store", error);
  }
  try {
    await sendContactMessage({ name: m.name, email: m.email, phone: m.phone, message: m.message });
  } catch (e) {
    console.error("[contact] email", e);
    return json({ error: "email_failed" }, 502);
  }
  return json({ ok: true });
}
