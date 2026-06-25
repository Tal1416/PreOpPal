import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";
import {
  furnishDemoProfile,
  isDemoCredentials,
} from "@/lib/demo-seed";

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    return NextResponse.json({
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  }

  // Self-provision the public demo account on first use: if the demo
  // credentials don't sign in yet (user never seeded), create + furnish it now
  // so anyone can log straight into a fully-populated dashboard. No
  // service-role key required — the new session owns its own rows under RLS.
  if (isDemoCredentials(email, password)) {
    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    // "User already registered" means the account exists but the original
    // sign-in failed for another reason (e.g. email confirmation still
    // pending). Surface the original error rather than masking it.
    if (signUpErr || !signUp.user || !signUp.session) {
      return NextResponse.json(
        {
          error:
            signUpErr && !/already registered/i.test(signUpErr.message)
              ? signUpErr.message
              : error.message,
        },
        { status: 401 },
      );
    }

    try {
      await furnishDemoProfile(supabase, signUp.user.id);
    } catch (e) {
      // Account is created and signed in even if furnishing hit a snag — the
      // user still gets in (onboarding overlay may show). Log, don't block.
      console.warn("[signin] demo furnish failed", e);
    }

    return NextResponse.json({
      user: { id: signUp.user.id, email: signUp.user.email },
    });
  }

  return NextResponse.json({ error: error.message }, { status: 401 });
}
