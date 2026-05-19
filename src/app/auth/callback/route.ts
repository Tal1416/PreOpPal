import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * OAuth callback for the PKCE flow.
 *
 * When the browser client kicks off `signInWithOAuth({ provider: "google" })`,
 * Supabase eventually redirects the browser here with `?code=<pkce>` (plus the
 * `next` we attached in `auth-context.tsx`). We exchange the code for a real
 * session — which sets the auth cookies via `createServerClient`'s
 * `setAll` callback — and then redirect to `next`.
 *
 * Without this handler the user would land on a 404 right after consenting on
 * Google, and no cookies would ever get set.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/me";
  // Hard-fail open redirects: only same-origin relative paths are allowed.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/me";

  if (!code) {
    // Supabase failed to attach a code (user cancelled, mis-config, etc.).
    const back = new URL("/login", url.origin);
    back.searchParams.set("error", "oauth_no_code");
    return NextResponse.redirect(back);
  }

  const supabase = await createClientForRequest();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const back = new URL("/login", url.origin);
    back.searchParams.set("error", "oauth_exchange_failed");
    back.searchParams.set("message", error.message);
    return NextResponse.redirect(back);
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
