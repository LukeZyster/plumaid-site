import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function hasSupabase(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  // Treat the "PASTE_..." placeholders in .env.local as not set yet.
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && key && !key.startsWith("PASTE_"));
}

/** Service-role client. Bypasses RLS. SERVER ONLY. Never import into client components. */
export function db(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Fail fast instead of making visitors wait if Supabase is slow or misconfigured.
    global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(5000) }) },
  });
  return client;
}
