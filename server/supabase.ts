import { createClient } from "@supabase/supabase-js";

export function logRuntimeEnv() {
  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;

  console.log({
    usingServiceRole,
    hasUrl,
    hasAnonKey
  });
}

let supabaseClient: any = null;

export function getSupabase() {
  if (!supabaseClient) {
    logRuntimeEnv();
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase credentials are not configured in environment (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
    }
    const headers: Record<string, string> = {};
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      headers["Authorization"] = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
    }

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers,
      },
    });
  }
  return supabaseClient;
}

