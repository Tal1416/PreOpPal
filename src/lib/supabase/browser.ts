"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

let browserClient: SupabaseClient | null = null;

/**
 * Singleton browser Supabase client. Used by the auth context to subscribe to
 * `onAuthStateChange` and keep tabs in sync after sign-in / sign-out / token
 * refresh.
 *
 * Most data access still goes through `/api/*` route handlers — this client
 * is mainly here for the auth event stream.
 */
export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return browserClient;
}
