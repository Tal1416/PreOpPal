import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";
import {
  medicationRowToMedication,
  type MedicationRow,
} from "@/lib/supabase/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    name?: string;
    dosage?: string;
    schedule?: string;
    status?: "stop" | "continue" | "new";
    reason?: string;
    daysLeft?: number | null;
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.dosage !== undefined) patch.dosage = body.dosage;
  if (body.schedule !== undefined) patch.schedule = body.schedule;
  if (body.status !== undefined) patch.status = body.status;
  if (body.reason !== undefined) patch.reason = body.reason;
  if (body.daysLeft !== undefined) patch.days_left = body.daysLeft;
  if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder;

  const { data, error } = await supabase
    .from("medications")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single<MedicationRow>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ medication: medicationRowToMedication(data) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
