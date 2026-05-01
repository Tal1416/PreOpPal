"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAI, SUGGESTIONS } from "./ai-store";
import { useProfile } from "@/lib/profile-context";

export default function AICompanionCard() {
  const ai = useAI();
  const { profile } = useProfile();
  const [input, setInput] = useState("");

  function ask(text: string) {
    if (!text.trim()) return;
    ai.send(text);
    setInput("");
    ai.setOpen(true); // open the drawer so the conversation continues
  }

  const name = profile.firstName?.trim() || "friend";

  return (
    <div className="relative overflow-hidden rounded-[32px] p-8 md:p-12 text-white shadow-[0_40px_80px_-24px_rgba(0,97,114,0.45)]"
      style={{
        background:
          "linear-gradient(135deg, #006172 0%, #2a7a8c 45%, #0a6879 100%)",
      }}
    >
      {/* animated orbs in background */}
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
      {/* noise overlay */}
      <div
        aria-hidden
        className="absolute inset-0 noise opacity-[0.06] mix-blend-overlay"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Pal avatar */}
        <div className="lg:col-span-4 flex items-center justify-center">
          <div className="relative">
            {/* outer pulse */}
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
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-44 w-44 md:h-52 md:w-52 rounded-full bg-gradient-to-br from-[#acedff] via-[#88d1e5] to-white flex items-center justify-center shadow-[0_30px_60px_-10px_rgba(0,0,0,0.45)]"
            >
              <span className="material-symbols-outlined text-primary text-7xl md:text-8xl">
                smart_toy
              </span>
              <span className="absolute bottom-2 right-3 h-5 w-5 rounded-full bg-green-400 ring-4 ring-white animate-pulse-teal" />
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
            Hi {name} — I'm{" "}
            <span className="text-[#acedff]">Pal.</span>
          </h2>
          <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl leading-relaxed">
            Ask me anything about your procedure, fasting, medications, or what
            to expect. I'm here 24/7 — and I'll never judge a question.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 px-4 py-3"
          >
            <span className="material-symbols-outlined text-white/70">
              chat_bubble
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Pal anything…"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60 text-base"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              className="h-10 px-4 rounded-xl bg-white text-primary font-bold text-sm flex items-center gap-1.5 shadow-md disabled:opacity-50"
              disabled={!input.trim()}
            >
              Ask
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </motion.button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
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
