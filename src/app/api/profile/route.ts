import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";
import {
  profilePatchToRow,
  profileRowToProfile,
  type ProfileRow,
} from "@/lib/supabase/types";

export const runtime = "nodejs";

/**
 * Derive first/last name from a Supabase user's OAuth metadata.
 *
 * Mirrors the logic in the `handle_new_user()` Postgres trigger
 * (migration 0003). We keep this duplicated client-side because:
 *  - the trigger only fires on insert into auth.users; some users existed
 *    before 0003 and may not have been caught by the 0004 backfill,
 *  - and a brand-new account that hits /me with a stale tab (or any race
 *    where the row reads back empty) gets self-healed on the next GET.
 *
 * Returns null when there's nothing useful in the metadata.
 */
function deriveNamesFromMetadata(
  meta: Record<string, unknown> | null | undefined,
): { firstName: string; lastName: string } | null {
  if (!meta) return null;
  const str = (v: unknown): string =>
    typeof v === "string" ? v.trim() : "";
  const given = str(meta.given_name);
  const family = str(meta.family_name);
  const full = str(meta.full_name) || str(meta.name);

  let firstName = "";
  let lastName = "";
  if (given) firstName = given;
  else if (full) firstName = full.split(" ")[0] ?? "";

  if (family) lastName = family;
  else if (full) {
    const ix = full.indexOf(" ");
    if (ix >= 0) lastName = full.slice(ix + 1).trim();
  }

  if (!firstName && !lastName) return null;
  return { firstName, lastName };
}

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

  // Self-heal: if the row has no name and the OAuth user does, persist it.
  // Belt-and-suspenders for accounts that pre-date the populate-from-metadata
  // trigger (migration 0003) and slipped through the backfill (0004).
  if (!data.first_name?.trim() && !data.last_name?.trim()) {
    const derived = deriveNamesFromMetadata(
      user.user_metadata as Record<string, unknown> | undefined,
    );
    if (derived) {
      const { data: patched, error: patchError } = await supabase
        .from("profiles")
        .update({ first_name: derived.firstName, last_name: derived.lastName })
        .eq("id", user.id)
        .select("*")
        .single<ProfileRow>();
      if (!patchError && patched) {
        return NextResponse.json({ profile: profileRowToProfile(patched) });
      }
      // If the patch failed we still return the original empty row — the user
      // can fill it in manually rather than seeing a 500.
    }
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
