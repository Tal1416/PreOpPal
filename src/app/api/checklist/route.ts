import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";
import type { ChecklistKind } from "@/lib/supabase/types";

export const runtime = "nodejs";

const KINDS: ChecklistKind[] = ["bag", "task", "phase"];

function parseKind(value: string | null): ChecklistKind | null {
  return KINDS.includes(value as ChecklistKind)
    ? (value as ChecklistKind)
    : null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = parseKind(req.nextUrl.searchParams.get("kind"));
  if (!kind) {
    return NextResponse.json(
      { error: "kind must be one of bag, task, phase" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("checklist_state")
    .select("item_id")
    .eq("user_id", user.id)
    .eq("kind", kind);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    kind,
    checked: (data ?? []).map((r) => r.item_id),
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { kind?: string; itemId?: string; checked?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const kind = parseKind(body.kind ?? null);
  const itemId = body.itemId?.trim();
  if (!kind || !itemId) {
    return NextResponse.json(
      { error: "kind and itemId are required" },
      { status: 400 },
    );
  }

  if (body.checked) {
    const { error } = await supabase.from("checklist_state").upsert({
      user_id: user.id,
      kind,
      item_id: itemId,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("checklist_state")
      .delete()
      .eq("user_id", user.id)
      .eq("kind", kind)
      .eq("item_id", itemId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
