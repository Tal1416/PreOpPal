import { NextResponse } from "next/server";
import { getStatus } from "@/lib/pairing/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  return NextResponse.json(getStatus(code));
}
