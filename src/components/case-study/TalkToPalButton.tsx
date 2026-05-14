"use client";

import { motion } from "framer-motion";
import { useAI } from "@/components/ai/ai-store";

/**
 * Big "Talk to Pal" trigger for the case-study page. Opens the global
 * VoiceOverlay so the reader can experience voice mode without leaving
 * the page.
 */
export default function TalkToPalButton() {
  const ai = useAI();
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => {
        if ("vibrate" in navigator) navigator.vibrate?.(10);
        ai.setVoiceOverlay(true);
      }}
      className="relative inline-flex items-center gap-3 rounded-2xl px-6 py-4 font-extrabold text-white shadow-[0_20px_40px_-10px_rgba(0,97,114,0.55)]"
      style={{
        background:
          "linear-gradient(135deg, #2a7a8c 0%, #006172 50%, #0a3845 100%)",
      }}
    >
      <span className="relative h-9 w-9 rounded-full flex items-center justify-center bg-white/15 border border-white/30">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[#7CFFA7]/60"
          animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <span className="material-symbols-outlined text-[20px] text-[#acedff]">
          graphic_eq
        </span>
      </span>
      <span className="tracking-tight">Talk to Pal — voice mode</span>
      <span className="material-symbols-outlined text-base">arrow_forward</span>
    </motion.button>
  );
}
