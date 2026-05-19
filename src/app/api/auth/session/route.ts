import { NextResponse } from "next/server";
import { createClientForRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClientForRequest();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: user.id, email: user.email },
  });
}
