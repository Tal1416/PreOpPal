"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Confetti from "@/components/pairing/Confetti";
import type { Profile } from "@/data/user";

const AUTH_KEY = "preoppal-auth-v1";
const PROFILE_KEY = "preoppal-profile-v1";
const VIEW_KEY = "preoppal-view-mode";

type Phase =
  | { kind: "missing" }
  | { kind: "manual"; code: string }
  | { kind: "pairing"; code: string }
  | { kind: "success" }
  | { kind: "error"; message: string };

function PairInner() {
  const search = useSearchParams();
  const router = useRouter();
  const codeFromURL = (search.get("code") ?? "").toUpperCase();
  const [phase, setPhase] = useState<Phase>(
    codeFromURL ? { kind: "pairing", code: codeFromURL } : { kind: "missing" },
  );
  const [manualCode, setManualCode] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (phase.kind !== "pairing") return;
    ran.current = true;
    void pair(phase.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pair(code: string) {
    setPhase({ kind: "pairing", code });
    try {
      const res = await fetch(
        `/api/pair?code=${encodeURIComponent(code.trim().toUpperCase())}`,
      );
      if (res.status === 404) {
        setPhase({
          kind: "error",
          message: "That code expired or has already been used.",
        });
        return;
      }
      if (!res.ok) {
        setPhase({ kind: "error", message: "Couldn't reach the server." });
        return;
      }
      const data = (await res.json()) as {
        authEmail?: string;
        authSignedInAt?: string;
        profile: Partial<Profile>;
        viewMode?: "web" | "phone";
      };

      // Write auth
      if (data.authEmail) {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            email: data.authEmail,
            signedInAt:
              data.authSignedInAt ?? new Date().toISOString(),
          }),
        );
      }
      // Write profile
      if (data.profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
      }
      // Force phone view on the phone side
      localStorage.setItem(VIEW_KEY, "phone");

      // Haptic celebration
      if ("vibrate" in navigator) navigator.vibrate?.([30, 50, 30, 50, 80]);

      setPhase({ kind: "success" });
      window.setTimeout(() => {
        // Hard reload so contexts re-hydrate from localStorage.
        window.location.href = "/dashboard?paired=1";
      }, 1600);
    } catch {
      setPhase({ kind: "error", message: "Something went wrong. Try again." });
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #e7f8ff 0%, #f6fbfb 60%, #ffffff 100%)",
      }}
    >
      <div className="w-full max-w-sm relative">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative glass-card-strong rounded-3xl p-7 text-center shadow-glass-lg overflow-hidden"
        >
          {phase.kind === "success" && <Confetti count={70} />}
          <motion.div
            className="relative mx-auto h-20 w-20 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #acedff 0%, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
              boxShadow:
                "0 20px 40px -10px rgba(0,97,114,0.55), 0 0 0 4px rgba(255,255,255,0.4) inset",
            }}
            animate={
              phase.kind === "pairing"
                ? { scale: [1, 1.06, 1] }
                : phase.kind === "success"
                  ? { scale: [1, 1.2, 1] }
                  : undefined
            }
            transition={{ duration: phase.kind === "pairing" ? 1.8 : 0.6 }}
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full ring-2 ring-white/40"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <span
              className="material-symbols-outlined text-white text-4xl drop-shadow"
              style={{
                fontVariationSettings:
                  phase.kind === "success" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {phase.kind === "success"
                ? "check_circle"
                : phase.kind === "error"
                  ? "error"
                  : "link"}
            </span>
          </motion.div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-on-surface">
            {phase.kind === "pairing" && "Connecting…"}
            {phase.kind === "success" && "You're paired!"}
            {phase.kind === "error" && "Hmm, that didn't work."}
            {phase.kind === "missing" && "Enter your pairing code"}
            {phase.kind === "manual" && "Enter your pairing code"}
          </h1>
          <p className="mt-2 text-on-surface-variant text-sm">
            {phase.kind === "pairing" &&
              "Bringing your prep over from your desktop."}
            {phase.kind === "success" &&
              "Your prep just teleported. Welcome back."}
            {phase.kind === "error" && phase.message}
            {(phase.kind === "missing" || phase.kind === "manual") &&
              "Open PreOpPal on your computer, tap “Continue on phone”, and type the 6-character code shown there."}
          </p>

          {(phase.kind === "missing" || phase.kind === "manual") && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim().length === 6) {
                  void pair(manualCode.trim());
                }
              }}
              className="mt-6 space-y-3"
            >
              <input
                inputMode="text"
                autoFocus
                autoCapitalize="characters"
                value={manualCode}
                onChange={(e) =>
                  setManualCode(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 6),
                  )
                }
                placeholder="ABC123"
                className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-white border border-white/80 rounded-2xl py-3 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={manualCode.length !== 6}
                className="w-full py-3 rounded-2xl bg-primary text-on-primary font-extrabold disabled:opacity-50"
              >
                Pair
              </button>
            </form>
          )}

          {phase.kind === "error" && (
            <button
              onClick={() => setPhase({ kind: "manual", code: "" })}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary text-on-primary px-5 py-2.5 font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Try a new code
            </button>
          )}

          {phase.kind === "pairing" && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="inline-block h-3 w-3 rounded-full border-[2px] border-primary/20 border-t-primary"
              />
              Pairing {phase.code}
            </div>
          )}
        </motion.div>

        <p className="mt-4 text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          One-time code · expires in 5 minutes
        </p>
      </div>
    </main>
  );
}

export default function PairPage() {
  return (
    <Suspense fallback={null}>
      <PairInner />
    </Suspense>
  );
}
