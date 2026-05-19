import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth cookies on every request.
 *
 * Without this, `@supabase/ssr` cookies set by `/api/auth/signin` aren't kept
 * fresh between requests — subsequent calls to route handlers like
 * `/api/profile` see no authenticated user, return 401, and the client
 * silently swallows the failure. Result: writes don't persist in production
 * even though sign-in appears to succeed.
 *
 * Wired up via `src/proxy.ts` (Next.js 16's renamed `middleware.ts`). The
 * `AuthGuard` component still handles the redirect-to-login UX on the client,
 * so we keep this helper minimal: just refresh the session and pass through.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANT: This call must immediately follow createServerClient.
  // Do not put any code between them — it can cause users to be randomly
  // logged out. We don't need the result; the side effect (refreshing the
  // auth cookie) is the point.
  await supabase.auth.getClaims();

  // IMPORTANT: Return supabaseResponse as-is so the refreshed cookies make it
  // back to the browser.
  return supabaseResponse;
}
