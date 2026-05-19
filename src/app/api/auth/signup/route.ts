import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const supabase = await createClientForRequest();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // With email confirmation disabled in Supabase, signUp also creates the
  // session; cookies are already attached to the response via the cookie
  // adapter in createClientForRequest.
  return NextResponse.json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}
