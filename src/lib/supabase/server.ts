import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Loud failure in dev; route handlers will 500 with a clear message instead of cryptic auth errors.
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

/**
 * Per-request Supabase client bound to the current user's cookies.
 * RLS policies see `auth.uid()` as the signed-in user. Use this in route
 * handlers and Server Components for any user-scoped data access.
 */
export async function createClientForRequest() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // `cookies().set` is a no-op inside Server Components — fine. The
          // session will still be refreshed on the next request via middleware
          // or a Route Handler.
        }
      },
    },
  });
}

/**
 * Admin client that bypasses RLS. Use sparingly: pairing codes (no logged-in
 * user during pairing), seed scripts, and any cross-user maintenance.
 *
 * NEVER ship this to the browser.
 */
export function createServiceClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for service-role operations. " +
        "Set it in .env.local (see .env.example).",
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Convenience: return the current user (or null) for the request.
 * Route handlers can use this to gate access.
 */
export async function getRequestUser() {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
