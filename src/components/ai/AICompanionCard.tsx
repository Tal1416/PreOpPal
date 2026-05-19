"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAI, SUGGESTIONS } from "./ai-store";
import { usePalExecutor } from "./use-pal-executor";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { useReduceEffects } from "@/lib/use-reduce-effects";

export default function AICompanionCard() {
  const ai = useAI();
  const { profile } = useProfile();
  const { isAuthenticated } = useAuth();
  const executor = usePalExecutor();
  const [input, setInput] = useState("");
  const reduce = useReduceEffects();

  function ask(text: string) {
    if (!text.trim()) return;
    ai.send(text, profile, executor);
    setInput("");
    ai.setOpen(true); // open the drawer so the conversation continues
  }

  function startVoice() {
    if (!isAuthenticated) return;
    ai.setVoiceOverlay(true);
  }

  const name = profile.firstName?.trim() || "friend";

  return (
    <div
      className="relative overflow-hidden rounded-[32px] p-8 md:p-12 text-white shadow-[0_40px_80px_-24px_rgba(0,97,114,0.45)]"
      style={{
        background:
          "linear-gradient(135deg, #006172 0%, #2a7a8c 45%, #0a6879 100%)",
      }}
    >
      {/* animated orbs in background — static on mobile/reduce-motion */}
      {reduce ? (
        <>
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-80 w-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(136,209,229,0.45), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(176,236,254,0.35), transparent 70%)",
            }}
          />
        </>
      ) : (
        <>
          <motion.div
            aria-hidden
            className="absolute -top-20 -right-20 h-80 w-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(136,209,229,0.45), transparent 70%)",
            }}
            animate={{ scale: [1, 1.18, 1], rotate: [0, 30, 0] }}
            transition={{ duration: 16, repeat: Infinity }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(176,236,254,0.35), transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 0.95, 1], rotate: [0, -25, 0] }}
            transition={{ duration: 22, repeat: Infinity }}
          />
        </>
      )}
      {/* noise overlay */}
      <div
        aria-hidden
        className="absolute inset-0 noise opacity-[0.06] mix-blend-overlay"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Pal avatar */}
        <div className="lg:col-span-4 flex items-center justify-center">
          <div className="relative">
            {!reduce && (
              <>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white/15"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.6 }}
                />
              </>
            )}
            <motion.div
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative h-44 w-44 md:h-52 md:w-52 rounded-full bg-gradient-to-br from-[#acedff] via-[#88d1e5] to-white flex items-center justify-center shadow-[0_30px_60px_-10px_rgba(0,0,0,0.45)]"
            >
              <span className="material-symbols-outlined text-primary text-7xl md:text-8xl">
                smart_toy
              </span>
              <span
                className={`absolute bottom-2 right-3 h-5 w-5 rounded-full bg-green-400 ring-4 ring-white ${
                  reduce ? "" : "animate-pulse-teal"
                }`}
              />
            </motion.div>
          </div>
        </div>

        {/* content */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]">
              AI Companion · Online
            </span>
          </div>
          <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Hi {name} — I&apos;m{" "}
            <span className="text-[#acedff]">Pal.</span>
          </h2>
          <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl leading-relaxed">
            Two ways to reach me — whichever feels right for the moment. Ask
            anything about your{" "}
            <span className="font-semibold text-white">
              {profile.procedure?.trim() || "procedure"}
            </span>
            , fasting, medications, or what to expect.
          </p>

          {/* TWO DOORS — text chat + voice */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Door 1 — Ask Pal (text chat) */}
            <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/25 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-white">
                    chat_bubble
                  </span>
                </span>
                <div>
                  <p className="text-[15px] font-extrabold leading-none">
                    Ask Pal
                  </p>
                  <p className="text-[11px] text-white/70 leading-tight mt-0.5">
                    Type · read back
                  </p>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="mt-1 flex items-center gap-2 rounded-xl bg-white/15 border border-white/20 px-3 py-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a question…"
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-white/55 text-sm"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.05 }}
                  disabled={!input.trim()}
                  aria-label="Send"
                  className="h-8 w-8 rounded-lg bg-white text-primary flex items-center justify-center disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </motion.button>
              </form>
            </div>

            {/* Door 2 — Talk to Pal (voice mode) */}
            <motion.button
              type="button"
              onClick={startVoice}
              disabled={!isAuthenticated}
              whileHover={isAuthenticated ? { y: -2 } : undefined}
              whileTap={isAuthenticated ? { scale: 0.98 } : undefined}
              className="text-left rounded-2xl bg-white/12 backdrop-blur-md border border-white/25 hover:bg-white/18 hover:border-white/40 p-4 flex flex-col group transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="relative h-8 w-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-xl border border-[#7CFFA7]/60"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                  )}
                  <span className="material-symbols-outlined text-[18px] text-[#acedff]">
                    graphic_eq
                  </span>
                </span>
                <div>
                  <p className="text-[15px] font-extrabold leading-none">
                    Talk to Pal
                  </p>
                  <p className="text-[11px] text-white/70 leading-tight mt-0.5">
                    Speak · Pal speaks back
                  </p>
                </div>
                <span
                  aria-hidden
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#7CFFA7]/20 border border-[#7CFFA7]/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#7CFFA7]"
                >
                  Voice
                </span>
              </div>
              <p className="mt-1 text-[12px] text-white/75 leading-snug">
                {isAuthenticated
                  ? "Hands-free conversation. Audio stays on your device — Pal hears the text, not the sound."
                  : "Sign in to unlock voice mode."}
              </p>
              {isAuthenticated && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#acedff]">
                  Start voice mode
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </div>
              )}
            </motion.button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
              Quick starts
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="text-xs md:text-sm rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 text-white/90 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
