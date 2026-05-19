import { NextRequest, NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";
import {
  medicationRowToMedication,
  medicationToInsertRow,
  type MedicationRow,
} from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    medications: (data as MedicationRow[]).map(medicationRowToMedication),
  });
}

export async function POST(req: NextRequest) {
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
    daysLeft?: number;
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const insert = medicationToInsertRow(
    {
      name: body.name ?? "",
      dosage: body.dosage ?? "",
      schedule: body.schedule ?? "",
      status: body.status ?? "continue",
      reason: body.reason ?? "",
      daysLeft: body.daysLeft,
    },
    user.id,
    body.sortOrder ?? 0,
  );

  const { data, error } = await supabase
    .from("medications")
    .insert(insert)
    .select("*")
    .single<MedicationRow>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ medication: medicationRowToMedication(data) });
}
