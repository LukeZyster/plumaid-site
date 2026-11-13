import { NextResponse } from "next/server";
import { db, hasSupabase } from "@/lib/supabase/admin";

/**
 * GET /api/health: a quick check that the live site is wired up correctly.
 * Shows only yes/no answers, never any keys.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const env = (k: string) => {
    const v = process.env[k] ?? "";
    return Boolean(v) && !v.startsWith("PASTE_");
  };
  const checks: Record<string, boolean | string> = {
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "not set",
    supabase_url_set: env("NEXT_PUBLIC_SUPABASE_URL"),
    publishable_key_set: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    secret_key_set: env("SUPABASE_SERVICE_ROLE_KEY"),
    secret_key_looks_right: /^(sb_secret_[A-Za-z0-9_-]{20,60}|eyJ[\w-]+\.[\w-]+\.[\w-]+)$/.test(process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""),
    email_password_set: env("SMTP_PASS"),
    admin_email_set: env("ADMIN_EMAILS"),
  };
  if (hasSupabase()) {
    const t0 = Date.now();
    const { count, error } = await db().from("services").select("id", { count: "exact", head: true });
    checks.database = error ? `ERROR: ${error.message}` : `ok (${count} services, ${Date.now() - t0} ms)`;
    const { error: sErr } = await db().storage.from("media").list("", { limit: 1 });
    checks.photo_storage = sErr ? `ERROR: ${sErr.message}` : "ok";
  } else {
    checks.database = "not connected (keys missing)";
  }
  const ok = checks.database.toString().startsWith("ok") && checks.email_password_set === true;
  return NextResponse.json({ ok, ...checks }, { headers: { "Cache-Control": "no-store" } });
}
