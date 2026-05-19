import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renames `middleware.ts` to `proxy.ts`. This file runs on every
// matched request and refreshes the Supabase auth cookies so route handlers
// (e.g. /api/profile) see the signed-in user. See updateSession() for the
// "why this is needed" rant.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match everything except static assets and image files. Auth endpoints
    // are included on purpose — they set/refresh cookies too.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
