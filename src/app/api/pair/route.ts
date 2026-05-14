import { NextResponse } from "next/server";
import {
  createPair,
  consumePair,
  type PairPayload,
} from "@/lib/pairing/store";

/**
 * In-memory store survives only within a single Node process — keep us off the
 * edge runtime so this route shares state with /api/pair/status.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Desktop publishes a pairing payload. */
export async function POST(req: Request) {
  let body: PairPayload;
  try {
    body = (await req.json()) as PairPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || !body.profile) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }
  const { code, expiresAt } = createPair(body);
  return NextResponse.json({ code, expiresAt }, { status: 201 });
}

/** Phone consumes a code (one-shot). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  const payload = consumePair(code);
  if (!payload) {
    return NextResponse.json(
      { error: "Code not found or expired" },
      { status: 404 },
    );
  }
  return NextResponse.json(payload);
}
