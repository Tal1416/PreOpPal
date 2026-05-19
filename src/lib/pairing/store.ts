/**
 * Supabase-backed pairing store.
 *
 * Desktop publishes a `PairPayload`, gets a short code (6 alphanumeric chars).
 * Phone scans the QR, hits the API with the code, consumes the payload, and
 * writes it into its own localStorage — instantly mirroring the desktop session.
 *
 * Backed by the `pairing_codes` table. RLS is enabled with no policies, so all
 * access is via the service-role client — these endpoints are pre-auth (no
 * logged-in user when the phone hits them), so RLS wouldn't help anyway.
 */

import { createServiceClient } from "@/lib/supabase/server";
import type { PairingCodeRow } from "@/lib/supabase/types";

export type PairPayload = {
  // Auth
  authEmail: string;
  authSignedInAt: string;
  // Profile — full snapshot is fine for the demo.
  profile: Record<string, unknown>;
  // View mode preference
  viewMode?: "web" | "phone";
};

const TTL_MS = 5 * 60 * 1000;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L for readability

function makeCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function createPair(payload: PairPayload): Promise<{
  code: string;
  expiresAt: number;
}> {
  const supabase = createServiceClient();
  const createdAt = Date.now();
  const expiresAt = createdAt + TTL_MS;

  // Tiny retry loop in case of code collision (negligible odds at 6 chars
  // from a 32-letter alphabet but cheap to handle).
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = makeCode();
    const { error } = await supabase.from("pairing_codes").insert({
      code,
      payload,
      expires_at: new Date(expiresAt).toISOString(),
    });
    if (!error) {
      return { code, expiresAt };
    }
    // 23505 = unique_violation
    if (
      error.code !== "23505" &&
      !error.message?.toLowerCase().includes("duplicate")
    ) {
      throw error;
    }
  }
  throw new Error("Failed to allocate pairing code");
}

export async function consumePair(code: string): Promise<PairPayload | null> {
  const supabase = createServiceClient();
  const normalized = code.toUpperCase();
  const nowIso = new Date().toISOString();

  // Atomically claim the row: only succeeds if not yet consumed and not expired.
  const { data, error } = await supabase
    .from("pairing_codes")
    .update({ consumed_at: nowIso })
    .eq("code", normalized)
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .select("payload")
    .maybeSingle<Pick<PairingCodeRow, "payload">>();

  if (error || !data) return null;
  return data.payload as PairPayload;
}

export async function getStatus(code: string): Promise<{
  status: "pending" | "consumed" | "expired";
  expiresAt?: number;
}> {
  const supabase = createServiceClient();
  const normalized = code.toUpperCase();
  const { data } = await supabase
    .from("pairing_codes")
    .select("consumed_at, expires_at")
    .eq("code", normalized)
    .maybeSingle<Pick<PairingCodeRow, "consumed_at" | "expires_at">>();

  if (!data) return { status: "expired" };

  const expiresAtMs = new Date(data.expires_at).getTime();
  if (data.consumed_at) {
    return { status: "consumed", expiresAt: expiresAtMs };
  }
  if (Date.now() > expiresAtMs) {
    return { status: "expired" };
  }
  return { status: "pending", expiresAt: expiresAtMs };
}
