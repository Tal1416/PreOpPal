import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";
import {
  profilePatchToRow,
  profileRowToProfile,
  type ProfileRow,
} from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    // Trigger should have created a row at signup, but be defensive: return
    // an empty shell so the client can hydrate to its own defaults.
    return NextResponse.json({ profile: null });
  }
  return NextResponse.json({ profile: profileRowToProfile(data) });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Strip derived fields the client may include — they aren't persisted.
  const {
    daysToSurgery: _d,
    readinessScore: _r,
    medications: _m,
    ...patch
  } = body as Record<string, unknown>;
  void _d;
  void _r;
  void _m;

  const row = profilePatchToRow(patch);
  if (Object.keys(row).length === 0) {
    return NextResponse.json({ profile: null });
  }

  // Upsert (not update) so users who signed up before the migrations ran —
  // i.e. who have an auth.users row but no profiles row because the trigger
  // didn't exist yet — get a profile row created on their first save instead
  // of hitting a phantom "no row found" 500. The RLS owner-insert and
  // owner-update policies both check `auth.uid() = id`, so the upsert is safe.
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...row })
    .select("*")
    .single<ProfileRow>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profile: profileRowToProfile(data) });
}
