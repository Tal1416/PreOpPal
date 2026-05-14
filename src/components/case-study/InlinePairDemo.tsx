"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import QRCanvas from "@/components/pairing/QRCanvas";
import Confetti from "@/components/pairing/Confetti";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; code: string; url: string }
  | { phase: "paired" }
  | { phase: "error"; message: string };

/**
 * Inline, demo-only pairing generator for the case-study page. Hits the real
 * /api/pair so anyone reading the case study can scan and watch the pair flow
 * fire on their own phone — proof, not screenshots.
 */
export default function InlinePairDemo() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const pollRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  async function generate() {
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authEmail: "demo@preoppal.dev",
          authSignedInAt: new Date().toISOString(),
          profile: {
            firstName: "Demo",
            lastName: "Reader",
            procedureId: "knee",
            procedure: "Knee Replacement",
            surgeon: "Dr. Sarah Chen",
            surgeryDate: "2026-06-24",
            onboardingComplete: true,
          },
          viewMode: "phone",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { code: string };
      const url = `${window.location.origin}/pair?code=${data.code}`;
      setState({ phase: "ready", code: data.code, url });

      pollRef.current = window.setInterval(async () => {
        try {
          const r = await fetch(
            `/api/pair/status?code=${encodeURIComponent(data.code)}`,
          );
          const s = (await r.json()) as {
            status: "pending" | "consumed" | "expired";
          };
          if (s.status === "consumed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setState({ phase: "paired" });
          } else if (s.status === "expired") {
            if (pollRef.current) clearInterval(pollRef.current);
            setState({ phase: "idle" });
          }
        } catch {
          // keep polling
        }
      }, 1700);
    } catch (e) {
      setState({
        phase: "error",
        message: (e as Error).message ?? "Failed",
      });
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <motion.div
          className="relative rounded-3xl p-3 bg-white border border-white/70 shadow-[0_30px_60px_-12px_rgba(0,97,114,0.35)]"
          animate={
            state.phase === "ready"
              ? { scale: [1, 1.01, 1] }
              : undefined
          }
          transition={{ duration: 2.6, repeat: Infinity }}
        >
          <div
            className="rounded-xl flex items-center justify-center bg-white"
            style={{ width: 220, height: 220 }}
          >
            <AnimatePresence mode="wait">
              {state.phase === "idle" && (
                <motion.button
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={generate}
                  className="flex flex-col items-center gap-3 px-4"
                >
                  <span
                    className="material-symbols-outlined text-primary text-5xl"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    qr_code_2
                  </span>
                  <span className="text-[12px] text-on-surface-variant text-center max-w-[180px]">
                    Tap to spin up a real, one-shot pairing code right now.
                  </span>
                </motion.button>
              )}
              {state.phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-10 w-10 rounded-full border-[3px] border-primary/20 border-t-primary"
                  style={{ animation: "spin 1.2s linear infinite" }}
                />
              )}
              {state.phase === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QRCanvas value={state.url} size={216} />
                </motion.div>
              )}
              {state.phase === "paired" && (
                <motion.div
                  key="paired"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  className="relative h-24 w-24 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #88d1e5, #006172)",
                    boxShadow: "0 20px 40px -10px rgba(0,97,114,0.5)",
                  }}
                >
                  <span
                    className="material-symbols-outlined text-white text-5xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </motion.div>
              )}
              {state.phase === "error" && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center px-4"
                >
                  <span className="material-symbols-outlined text-rose-500 text-3xl">
                    error
                  </span>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {state.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* center logo cap */}
          {state.phase === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #acedff, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
                  boxShadow:
                    "0 6px 16px -2px rgba(0,97,114,0.55), 0 0 0 3px white",
                }}
              >
                <span className="material-symbols-outlined text-white text-[20px]">
                  favorite
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {state.phase === "paired" && <Confetti count={54} />}
      </div>

      {state.phase === "ready" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-white/70 border border-white/70 px-3.5 py-2"
        >
          <span className="material-symbols-outlined text-primary text-[16px]">
            key
          </span>
          <span className="font-mono text-base font-extrabold tracking-[0.3em] text-on-surface">
            {state.code}
          </span>
        </motion.div>
      )}

      <p className="mt-3 text-[11px] text-on-surface-variant text-center max-w-[240px]">
        {state.phase === "ready" &&
          "Scan with your phone camera. You'll get teleported into the demo with the same profile."}
        {state.phase === "paired" &&
          "Paired! Check your phone — your prep just teleported."}
        {state.phase === "idle" &&
          "Live API. Real code. 5-minute TTL. One-shot consume."}
        {state.phase === "loading" && "Talking to /api/pair…"}
      </p>
    </div>
  );
}
