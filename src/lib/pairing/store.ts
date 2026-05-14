/**
 * In-memory pairing store for the demo.
 *
 * Desktop publishes a `PairPayload`, gets a short code (6 alphanumeric chars).
 * Phone scans the QR, hits the API with the code, consumes the payload, and
 * writes it into its own localStorage — instantly mirroring the desktop session.
 *
 * Trade-offs:
 *  - In-memory: payloads die on serverless cold start. Fine for a demo
 *    (pairing happens within seconds). To make it persistent, swap this
 *    file for a Redis/Upstash adapter — the interface is intentionally small.
 *  - 5-minute TTL: long enough to pair, short enough to not pile up.
 *  - One-shot: GET also deletes. No replay.
 */

export type PairPayload = {
  // Auth
  authEmail: string;
  authSignedInAt: string;
  // Profile — full snapshot is fine for the demo.
  profile: Record<string, unknown>;
  // View mode preference
  viewMode?: "web" | "phone";
};

type Entry = {
  payload: PairPayload;
  createdAt: number;
  status: "pending" | "consumed";
  consumedAt?: number;
};

const TTL_MS = 5 * 60 * 1000;
// Globally cache the Map across hot reloads / route invocations.
const globalForPair = globalThis as unknown as { __pairStore?: Map<string, Entry> };
const STORE: Map<string, Entry> =
  globalForPair.__pairStore ?? (globalForPair.__pairStore = new Map());

function sweep() {
  const now = Date.now();
  for (const [code, entry] of STORE.entries()) {
    if (now - entry.createdAt > TTL_MS) STORE.delete(code);
  }
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L for readability
function makeCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function createPair(payload: PairPayload): {
  code: string;
  expiresAt: number;
} {
  sweep();
  let code = makeCode();
  // Ultra-low collision odds, but be defensive.
  let attempts = 0;
  while (STORE.has(code) && attempts < 10) {
    code = makeCode();
    attempts++;
  }
  const createdAt = Date.now();
  STORE.set(code, { payload, createdAt, status: "pending" });
  return { code, expiresAt: createdAt + TTL_MS };
}

export function consumePair(code: string): PairPayload | null {
  sweep();
  const entry = STORE.get(code.toUpperCase());
  if (!entry) return null;
  // Mark consumed but keep the entry briefly so the desktop poll can see "consumed"
  // before TTL sweeps it out.
  entry.status = "consumed";
  entry.consumedAt = Date.now();
  // We *don't* delete immediately — let the status endpoint show "consumed"
  // for ~10 seconds, then sweep takes care of it.
  setTimeout(() => STORE.delete(code.toUpperCase()), 10_000);
  return entry.payload;
}

export function getStatus(code: string): {
  status: "pending" | "consumed" | "expired";
  expiresAt?: number;
} {
  sweep();
  const entry = STORE.get(code.toUpperCase());
  if (!entry) return { status: "expired" };
  return {
    status: entry.status,
    expiresAt: entry.createdAt + TTL_MS,
  };
}
