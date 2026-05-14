"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import QRCanvas from "./QRCanvas";
import Confetti from "./Confetti";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";

type Props = {
  open: boolean;
  onClose: () => void;
};

type State =
  | { phase: "loading" }
  | { phase: "ready"; code: string; url: string; expiresAt: number }
  | { phase: "paired" }
  | { phase: "expired" }
  | { phase: "error"; message: string };

const POLL_MS = 1600;

export default function QRModal({ open, onClose }: Props) {
  const { session } = useAuth();
  const { profile } = useProfile();
  const { mode } = useViewMode();
  const [state, setState] = useState<State>({ phase: "loading" });
  const pollRef = useRef<number | null>(null);

  // Capture the profile once on open so it doesn't churn the QR URL on every keystroke.
  const snapshotRef = useRef(profile);

  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    snapshotRef.current = profile;
    setState({ phase: "loading" });

    const createPair = async () => {
      try {
        const res = await fetch("/api/pair", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authEmail: session?.email ?? "",
            authSignedInAt: session?.signedInAt ?? new Date().toISOString(),
            profile: snapshotRef.current,
            viewMode: mode,
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as {
          code: string;
          expiresAt: number;
        };
        const origin = window.location.origin;
        const url = `${origin}/pair?code=${data.code}`;
        setState({
          phase: "ready",
          code: data.code,
          url,
          expiresAt: data.expiresAt,
        });

        // Start polling for status
        pollRef.current = window.setInterval(async () => {
          try {
            const r = await fetch(`/api/pair/status?code=${data.code}`);
            const s = (await r.json()) as {
              status: "pending" | "consumed" | "expired";
            };
            if (s.status === "consumed") {
              if (pollRef.current) clearInterval(pollRef.current);
              if ("vibrate" in navigator) navigator.vibrate?.([20, 40, 20]);
              setState({ phase: "paired" });
            } else if (s.status === "expired") {
              if (pollRef.current) clearInterval(pollRef.current);
              setState({ phase: "expired" });
            }
          } catch {
            // network blip — keep polling
          }
        }, POLL_MS);
      } catch (e) {
        setState({
          phase: "error",
          message: (e as Error).message ?? "Couldn't generate a code.",
        });
      }
    };

    void createPair();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [open, session, mode, profile]);

  // Auto-dismiss the paired state after a couple of seconds.
  useEffect(() => {
    if (state.phase !== "paired") return;
    const t = window.setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [state.phase, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="qr-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[180] flex items-center justify-center p-4"
        >
          {/* backdrop */}
          <motion.button
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 0%, rgba(14,54,64,0.78), rgba(3,19,26,0.92))",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-md glass-card-strong rounded-3xl overflow-hidden shadow-glass-lg"
          >
            <div
              className="relative px-6 pt-6 pb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(172,237,255,0.55), rgba(136,209,229,0.25) 60%, rgba(255,255,255,0))",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    qr_code_2
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                    Continue on phone
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 rounded-full hover:bg-black/5 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-on-surface leading-tight">
                {state.phase === "paired"
                  ? "Paired with your phone."
                  : "Scan to pick up where you left off."}
              </h2>
              <p className="mt-1 text-[13px] text-on-surface-variant">
                {state.phase === "paired"
                  ? "Your prep just teleported. Open PreOpPal on your phone."
                  : "Open the camera on your phone and point it at the code."}
              </p>
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col items-center">
              <div className="relative">
                {/* QR */}
                <motion.div
                  className="relative rounded-3xl p-3 bg-white shadow-[0_30px_60px_-10px_rgba(0,97,114,0.35)] border border-white/70"
                  animate={
                    state.phase === "ready"
                      ? { scale: [1, 1.01, 1] }
                      : undefined
                  }
                  transition={{ duration: 2.6, repeat: Infinity }}
                >
                  {state.phase === "ready" ? (
                    <QRCanvas value={state.url} size={232} />
                  ) : (
                    <div
                      className="rounded-xl bg-white flex items-center justify-center"
                      style={{ width: 232, height: 232 }}
                    >
                      {state.phase === "loading" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="h-10 w-10 rounded-full border-[3px] border-primary/20 border-t-primary"
                        />
                      )}
                      {state.phase === "expired" && (
                        <div className="text-center px-4">
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                            schedule
                          </span>
                          <p className="mt-2 text-sm text-on-surface-variant">
                            The code expired. Reopen this dialog for a new one.
                          </p>
                        </div>
                      )}
                      {state.phase === "error" && (
                        <div className="text-center px-4">
                          <span className="material-symbols-outlined text-3xl text-rose-500">
                            error
                          </span>
                          <p className="mt-2 text-sm text-on-surface-variant">
                            Couldn&apos;t generate a code.
                          </p>
                        </div>
                      )}
                      {state.phase === "paired" && (
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          }}
                          className="relative h-24 w-24 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, #88d1e5, #006172)",
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
                    </div>
                  )}

                  {/* Logo cap in the center of the QR */}
                  {state.phase === "ready" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #acedff, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
                          boxShadow:
                            "0 6px 16px -2px rgba(0,97,114,0.55), 0 0 0 3px white",
                        }}
                      >
                        <span className="material-symbols-outlined text-white text-[22px]">
                          favorite
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {state.phase === "paired" && <Confetti count={60} />}
              </div>

              {/* Code text */}
              {state.phase === "ready" && (
                <>
                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/70 border border-white/70 px-4 py-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      key
                    </span>
                    <span className="font-mono text-lg font-extrabold tracking-[0.3em] text-on-surface">
                      {state.code}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-on-surface-variant">
                    Or visit{" "}
                    <span className="font-semibold text-on-surface">
                      /pair
                    </span>{" "}
                    on your phone and enter this code.
                  </p>
                </>
              )}

              {state.phase === "paired" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#7CFFA7]/20 border border-[#7CFFA7]/40 px-3 py-1">
                    <span className="material-symbols-outlined text-[14px] text-[#1c8a4e]">
                      smartphone
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#1c8a4e]">
                      Linked
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* footnote */}
            <div className="px-6 pb-5 -mt-2 flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">
                lock
              </span>
              One-time code · expires in 5 minutes
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
