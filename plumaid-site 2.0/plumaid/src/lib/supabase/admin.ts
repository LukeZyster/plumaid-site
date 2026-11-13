import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Whether the server-side Supabase credentials are configured. */
export function hasSupabase(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

let client: SupabaseClient | undefined;

/** Get the server-side client, using the service role key only on the server. */
export function db(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  client ??= createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}
